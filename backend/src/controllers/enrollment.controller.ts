import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as enrollmentService from "../services/enrollment.service";
import { UpdateLastVisitedInput } from "../validators/enrollment.validator";

export const listMyEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const enrollments = await enrollmentService.listMyEnrollments(req.user!.id);
  sendSuccess(res, 200, "Enrollments fetched", enrollments);
});

export const updateLastVisited = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.body as UpdateLastVisitedInput;
  await enrollmentService.updateLastVisited(req.user!.id, courseId, lessonId);
  sendSuccess(res, 200, "Last visited lesson updated");
});
