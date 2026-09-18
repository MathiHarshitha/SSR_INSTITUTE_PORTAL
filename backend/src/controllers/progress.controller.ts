import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as progressService from "../services/progress.service";

export const markComplete = asyncHandler(async (req: Request, res: Response) => {
  await progressService.markLessonComplete(req.user!.id, req.params.lessonId as string);
  sendSuccess(res, 200, "Lesson marked complete");
});

export const unmarkComplete = asyncHandler(async (req: Request, res: Response) => {
  await progressService.unmarkLessonComplete(req.user!.id, req.params.lessonId as string);
  sendSuccess(res, 200, "Lesson marked incomplete");
});

export const getCourseProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await progressService.getCourseProgress(
    req.user!.id,
    req.params.courseId as string
  );
  sendSuccess(res, 200, "Course progress fetched", progress);
});
