import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as taskService from "../services/task.service";
import {
  CreateTaskInput,
  EvaluateSubmissionInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "../validators/task.validator";
import { TaskStatus } from "../models/Task";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.user!.id, req.user!.role, req.body as CreateTaskInput);
  sendSuccess(res, 201, "Task created", task);
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListTasksQuery;
  const tasks = await taskService.listTasks(req.user!.id, req.user!.role, query);
  sendSuccess(res, 200, "Tasks fetched", tasks);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.getTaskById(req.user!.id, req.user!.role, req.params.id as string);
  sendSuccess(res, 200, "Task fetched", task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.updateTask(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
    req.body as UpdateTaskInput
  );
  sendSuccess(res, 200, "Task updated", task);
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: TaskStatus };
  const task = await taskService.updateTaskStatus(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
    status
  );
  sendSuccess(res, 200, "Task status updated", task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.user!.id, req.user!.role, req.params.id as string);
  sendSuccess(res, 200, "Task deleted");
});

export const listPendingSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const submissions = await taskService.listPendingSubmissions(req.user!.id, req.user!.role);
  sendSuccess(res, 200, "Pending submissions fetched", submissions);
});

export const listSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const submissions = await taskService.listSubmissionsForTask(
    req.user!.id,
    req.user!.role,
    req.params.taskId as string
  );
  sendSuccess(res, 200, "Submissions fetched", submissions);
});

export const submitTask = asyncHandler(async (req: Request, res: Response) => {
  const submission = await taskService.submitTask(
    req.user!.id,
    req.params.taskId as string,
    req.body as { content?: string; fileUrl?: string; comments?: string }
  );
  sendSuccess(res, 200, "Task submitted", submission);
});

export const getMySubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await taskService.getMySubmission(req.user!.id, req.params.taskId as string);
  sendSuccess(res, 200, "Submission fetched", submission);
});

export const evaluateSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { marks, feedback } = req.body as EvaluateSubmissionInput;
  const submission = await taskService.evaluateSubmission(
    req.user!.id,
    req.user!.role,
    req.params.submissionId as string,
    marks,
    feedback
  );
  sendSuccess(res, 200, "Submission evaluated", submission);
});
