import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as mockInterviewService from "../services/mockInterview.service";
import {
  ListInterviewsQuery,
  RecordFeedbackInput,
  ScheduleInterviewInput,
  UpdateInterviewInput,
} from "../validators/mockInterview.validator";

export const scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
  const interview = await mockInterviewService.scheduleInterview(
    req.user!.id,
    req.user!.role,
    req.body as ScheduleInterviewInput
  );
  sendSuccess(res, 201, "Interview scheduled", interview);
});

export const listInterviews = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListInterviewsQuery;
  const interviews = await mockInterviewService.listInterviews(req.user!.id, req.user!.role, query);
  sendSuccess(res, 200, "Interviews fetched", interviews);
});

export const updateInterview = asyncHandler(async (req: Request, res: Response) => {
  const interview = await mockInterviewService.updateInterview(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
    req.body as UpdateInterviewInput
  );
  sendSuccess(res, 200, "Interview updated", interview);
});

export const recordFeedback = asyncHandler(async (req: Request, res: Response) => {
  const interview = await mockInterviewService.recordFeedback(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
    req.body as RecordFeedbackInput
  );
  sendSuccess(res, 200, "Feedback recorded", interview);
});

export const deleteInterview = asyncHandler(async (req: Request, res: Response) => {
  await mockInterviewService.deleteInterview(req.user!.id, req.user!.role, req.params.id as string);
  sendSuccess(res, 200, "Interview deleted");
});
