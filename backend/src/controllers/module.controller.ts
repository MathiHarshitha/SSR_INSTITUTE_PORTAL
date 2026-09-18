import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as moduleService from "../services/module.service";
import {
  CreateLessonInput,
  CreateModuleInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from "../validators/module.validator";

export const listModules = asyncHandler(async (req: Request, res: Response) => {
  const modules = await moduleService.listModules(req.params.courseId as string);
  sendSuccess(res, 200, "Modules fetched", modules);
});

export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const module = await moduleService.createModule(
    req.user!.id,
    req.params.courseId as string,
    req.body as CreateModuleInput
  );
  sendSuccess(res, 201, "Module created", module);
});

export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const module = await moduleService.updateModule(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateModuleInput
  );
  sendSuccess(res, 200, "Module updated", module);
});

export const deleteModule = asyncHandler(async (req: Request, res: Response) => {
  await moduleService.deleteModule(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Module deleted");
});

export const reorderModules = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await moduleService.reorderModules(req.user!.id, req.params.courseId as string, orderedIds);
  sendSuccess(res, 200, "Modules reordered");
});

export const listLessons = asyncHandler(async (req: Request, res: Response) => {
  const lessons = await moduleService.listLessons(req.params.moduleId as string);
  sendSuccess(res, 200, "Lessons fetched", lessons);
});

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await moduleService.createLesson(
    req.user!.id,
    req.params.moduleId as string,
    req.body as CreateLessonInput
  );
  sendSuccess(res, 201, "Lesson created", lesson);
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await moduleService.updateLesson(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateLessonInput
  );
  sendSuccess(res, 200, "Lesson updated", lesson);
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  await moduleService.deleteLesson(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Lesson deleted");
});

export const reorderLessons = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await moduleService.reorderLessons(req.user!.id, req.params.moduleId as string, orderedIds);
  sendSuccess(res, 200, "Lessons reordered");
});
