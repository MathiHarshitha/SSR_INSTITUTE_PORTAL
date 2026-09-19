import { FilterQuery } from "mongoose";
import { Task, ITask } from "../models/Task";
import { Submission } from "../models/Submission";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { assertBatchAccess, listStudentBatchIds, listTrainerBatchIds } from "../utils/batchAccess";
import { recordAudit } from "./auditLog.service";
import { notifyUser, notifyUsers } from "./notification.service";
import { emailService } from "./email.service";
import { Role } from "../constants/enums";
import {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "../validators/task.validator";

export async function createTask(userId: string, role: Role, input: CreateTaskInput) {
  const batch = await assertBatchAccess(input.batch, userId, role);

  const task = await Task.create({ ...input, course: batch.course, createdBy: userId });

  await recordAudit({ userId, action: "TASK_CREATED", entity: "Task", entityId: task._id });
  return task;
}

export async function listTasks(userId: string, role: Role, query: ListTasksQuery) {
  const filter: FilterQuery<ITask> = {};

  if (query.batch) {
    await assertBatchAccess(query.batch, userId, role);
    filter.batch = query.batch;
  } else if (role === "TRAINER") {
    filter.batch = { $in: await listTrainerBatchIds(userId) };
  } else if (role === "STUDENT") {
    filter.batch = { $in: await listStudentBatchIds(userId) };
  }

  if (query.type) filter.type = query.type;

  if (role === "STUDENT") {
    // Students never see drafts, regardless of what status filter they ask for.
    filter.status = query.status && query.status !== "DRAFT" ? query.status : { $ne: "DRAFT" };
  } else if (query.status) {
    filter.status = query.status;
  }

  const tasks = await Task.find(filter).sort({ dueDate: 1 }).lean();

  if (role === "STUDENT") {
    const mySubmissions = await Submission.find({
      student: userId,
      task: { $in: tasks.map((t) => t._id) },
    })
      .select("task status marks")
      .lean();
    const subMap = new Map(mySubmissions.map((s) => [String(s.task), s]));
    return tasks.map((t) => ({ ...t, mySubmission: subMap.get(String(t._id)) ?? null }));
  }

  const submissionCounts = await Submission.aggregate<{ _id: unknown; count: number }>([
    { $match: { task: { $in: tasks.map((t) => t._id) } } },
    { $group: { _id: "$task", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(submissionCounts.map((c) => [String(c._id), c.count]));

  return tasks.map((t) => ({ ...t, submissionCount: countMap.get(String(t._id)) ?? 0 }));
}

export async function getTaskById(userId: string, role: Role, id: string) {
  const task = await Task.findById(id).lean();
  if (!task) throw ApiError.notFound("Task not found");
  await assertBatchAccess(String(task.batch), userId, role);
  return task;
}

export async function updateTask(userId: string, role: Role, id: string, input: UpdateTaskInput) {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound("Task not found");

  await assertBatchAccess(String(task.batch), userId, role);

  Object.assign(task, input);
  await task.save();

  await recordAudit({ userId, action: "TASK_UPDATED", entity: "Task", entityId: task._id });
  return task;
}

export async function updateTaskStatus(userId: string, role: Role, id: string, status: ITask["status"]) {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound("Task not found");

  await assertBatchAccess(String(task.batch), userId, role);

  task.status = status;
  await task.save();

  if (status === "PUBLISHED") {
    const studentIds = (await Enrollment.find({ batch: task.batch }).select("student").lean()).map((e) =>
      String(e.student)
    );
    await notifyUsers(studentIds, {
      type: "TASK_PUBLISHED",
      title: `New task: ${task.title}`,
      message: `A new ${task.type.toLowerCase()} is due ${task.dueDate.toDateString()}.`,
      link: "/student/tasks",
    });
  }

  await recordAudit({
    userId,
    action: "TASK_STATUS_CHANGED",
    entity: "Task",
    entityId: task._id,
    metadata: { status },
  });
  return task;
}

export async function deleteTask(userId: string, role: Role, id: string) {
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound("Task not found");
  if (task.status !== "DRAFT") {
    throw ApiError.badRequest("Only draft tasks can be deleted — close published tasks instead");
  }

  await assertBatchAccess(String(task.batch), userId, role);

  await task.deleteOne();
  await recordAudit({ userId, action: "TASK_DELETED", entity: "Task", entityId: id });
}

// --- Submissions ---

export async function listPendingSubmissions(userId: string, role: Role) {
  const batchIds = role === "TRAINER" ? await listTrainerBatchIds(userId) : undefined;
  const filter: Record<string, unknown> = { status: { $in: ["SUBMITTED", "LATE"] } };
  if (batchIds) filter.batch = { $in: batchIds };

  return Submission.find(filter)
    .populate("student", "name email")
    .populate("task", "title type maxMarks dueDate")
    .populate("batch", "name")
    .sort({ submittedAt: 1 })
    .lean();
}

export async function listSubmissionsForTask(userId: string, role: Role, taskId: string) {
  const task = await Task.findById(taskId).select("batch").lean();
  if (!task) throw ApiError.notFound("Task not found");
  await assertBatchAccess(String(task.batch), userId, role);

  return Submission.find({ task: taskId }).populate("student", "name email").sort({ submittedAt: -1 }).lean();
}

export async function submitTask(
  studentId: string,
  taskId: string,
  input: { content?: string; fileUrl?: string; comments?: string }
) {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");
  if (task.status !== "PUBLISHED") {
    throw ApiError.badRequest("This task is not open for submissions");
  }

  const enrollment = await Enrollment.findOne({ student: studentId, batch: task.batch }).lean();
  if (!enrollment) throw ApiError.forbidden("You are not enrolled in this task's batch");

  const isLate = new Date() > task.dueDate;

  const submission = await Submission.findOneAndUpdate(
    { task: taskId, student: studentId },
    {
      $set: {
        batch: task.batch,
        content: input.content,
        fileUrl: input.fileUrl,
        comments: input.comments,
        status: isLate ? "LATE" : "SUBMITTED",
        submittedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return submission;
}

export async function getMySubmission(studentId: string, taskId: string) {
  return Submission.findOne({ task: taskId, student: studentId }).lean();
}

export async function evaluateSubmission(
  userId: string,
  role: Role,
  submissionId: string,
  marks: number,
  feedback?: string
) {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw ApiError.notFound("Submission not found");

  await assertBatchAccess(String(submission.batch), userId, role);

  const task = await Task.findById(submission.task).select("title maxMarks").lean();
  if (task && marks > task.maxMarks) {
    throw ApiError.badRequest(`Marks cannot exceed the maximum of ${task.maxMarks}`);
  }

  submission.marks = marks;
  submission.feedback = feedback;
  submission.status = "EVALUATED";
  submission.set("evaluatedBy", userId);
  submission.evaluatedAt = new Date();
  await submission.save();

  if (task) {
    await notifyUser(String(submission.student), {
      type: "SUBMISSION_EVALUATED",
      title: `"${task.title}" has been evaluated`,
      message: `You scored ${marks}/${task.maxMarks}.`,
      link: "/student/tasks",
    });

    const student = await User.findById(submission.student).select("name email").lean();
    if (student) {
      await emailService.sendSubmissionEvaluated(student.email, student.name, task.title, marks, task.maxMarks);
    }
  }

  await recordAudit({
    userId,
    action: "SUBMISSION_EVALUATED",
    entity: "Submission",
    entityId: submission._id,
    metadata: { marks },
  });

  return submission;
}
