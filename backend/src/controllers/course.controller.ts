import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as courseService from "../services/course.service";

export const listPublicCourses = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await courseService.listPublishedCourses();
  sendSuccess(res, 200, "Courses fetched", courses);
});
