import { FilterQuery } from "mongoose";
import { MockInterview, IMockInterview } from "../models/MockInterview";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { recordAudit } from "./auditLog.service";
import { notifyUser } from "./notification.service";
import { emailService } from "./email.service";
import { Role } from "../constants/enums";
import {
  ListInterviewsQuery,
  RecordFeedbackInput,
  ScheduleInterviewInput,
  UpdateInterviewInput,
} from "../validators/mockInterview.validator";

async function assertStudentValid(studentId: string) {
  const student = await User.findOne({ _id: studentId, role: "STUDENT" }).select("name email").lean();
  if (!student) throw ApiError.badRequest("Selected student does not exist");
  return student;
}

export async function scheduleInterview(
  interviewerId: string,
  input: ScheduleInterviewInput
) {
  const student = await assertStudentValid(input.student);

  const interview = await MockInterview.create({
    ...input,
    meetingLink: input.meetingLink || undefined,
    interviewer: interviewerId,
    createdBy: interviewerId,
  });

  await notifyUser(input.student, {
    type: "INTERVIEW_SCHEDULED",
    title: "Mock interview scheduled",
    message: `A ${input.type.toLowerCase()} interview is scheduled on ${interview.date.toDateString()} at ${interview.time}.`,
    link: "/student/interviews",
  });
  await emailService.sendInterviewScheduled(
    student.email,
    student.name,
    interview.date.toDateString(),
    interview.time
  );

  await recordAudit({
    userId: interviewerId,
    action: "INTERVIEW_SCHEDULED",
    entity: "MockInterview",
    entityId: interview._id,
  });

  return interview;
}

function assertInterviewAccess(interview: IMockInterview, userId: string, role: Role): void {
  if (role === "ADMIN") return;
  if (role === "TRAINER" && String(interview.interviewer) === userId) return;
  if (role === "STUDENT" && String(interview.student) === userId) return;
  throw ApiError.forbidden("You do not have access to this interview");
}

export async function listInterviews(userId: string, role: Role, query: ListInterviewsQuery) {
  const filter: FilterQuery<IMockInterview> = {};

  if (role === "TRAINER") filter.interviewer = userId;
  else if (role === "STUDENT") filter.student = userId;
  else {
    if (query.interviewer) filter.interviewer = query.interviewer;
    if (query.student) filter.student = query.student;
  }

  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }

  return MockInterview.find(filter)
    .populate("student", "name email")
    .populate("interviewer", "name")
    .populate("batch", "name")
    .sort({ date: -1 })
    .lean();
}

export async function updateInterview(
  userId: string,
  role: Role,
  id: string,
  input: UpdateInterviewInput
) {
  const interview = await MockInterview.findById(id);
  if (!interview) throw ApiError.notFound("Interview not found");
  assertInterviewAccess(interview, userId, role);
  if (role === "STUDENT") throw ApiError.forbidden("Students cannot modify interviews");

  const { meetingLink, ...rest } = input;
  Object.assign(interview, rest);
  if (meetingLink !== undefined) interview.meetingLink = meetingLink || undefined;
  await interview.save();

  await recordAudit({
    userId,
    action: "INTERVIEW_UPDATED",
    entity: "MockInterview",
    entityId: interview._id,
  });
  return interview;
}

export async function recordFeedback(
  userId: string,
  role: Role,
  id: string,
  input: RecordFeedbackInput
) {
  const interview = await MockInterview.findById(id);
  if (!interview) throw ApiError.notFound("Interview not found");
  assertInterviewAccess(interview, userId, role);
  if (role === "STUDENT") throw ApiError.forbidden("Students cannot record interview feedback");

  Object.assign(interview, input);
  await interview.save();

  await recordAudit({
    userId,
    action: "INTERVIEW_FEEDBACK_RECORDED",
    entity: "MockInterview",
    entityId: interview._id,
  });
  return interview;
}

export async function deleteInterview(userId: string, role: Role, id: string) {
  const interview = await MockInterview.findById(id);
  if (!interview) throw ApiError.notFound("Interview not found");
  assertInterviewAccess(interview, userId, role);
  if (role === "STUDENT") throw ApiError.forbidden("Students cannot delete interviews");

  await interview.deleteOne();
  await recordAudit({ userId, action: "INTERVIEW_DELETED", entity: "MockInterview", entityId: id });
}
