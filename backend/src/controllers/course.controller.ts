import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as courseService from "../services/course.service";
import {
  CreateCourseInput,
  ListCoursesQuery,
  UpdateCourseInput,
} from "../validators/course.validator";

export const listPublicCourses = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await courseService.listPublishedCourses();
  sendSuccess(res, 200, "Courses fetched", courses);
});

export const listAdminCourses = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListCoursesQuery;
  const { courses, total } = await courseService.listCoursesAdmin(query);
  sendSuccess(res, 200, "Courses fetched", courses, buildPaginationMeta(query.page, query.limit, total));
});

export const listTrainerCourses = asyncHandler(async (req: Request, res: Response) => {
  const courses = await courseService.listCoursesForTrainer(req.user!.id);
  sendSuccess(res, 200, "Courses fetched", courses);
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(req.params.id as string, req.user!);
  sendSuccess(res, 200, "Course fetched", course);
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.createCourse(req.user!.id, req.body as CreateCourseInput);
  sendSuccess(res, 201, "Course created", course);
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateCourseInput
  );
  sendSuccess(res, 200, "Course updated", course);
});

export const updateCourseStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };
  const course = await courseService.updateCourseStatus(req.user!.id, req.params.id as string, status);
  sendSuccess(res, 200, "Course status updated", course);
});
