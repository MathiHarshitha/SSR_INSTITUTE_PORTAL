import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as moduleService from "../services/module.service";
import * as progressService from "../services/progress.service";
import {
  CreateLessonInput,
  CreateModuleInput,
  CreateTopicInput,
  UpdateLessonInput,
  UpdateModuleInput,
  UpdateTopicInput,
} from "../validators/module.validator";

export const listModules = asyncHandler(async (req: Request, res: Response) => {
  const modules = await moduleService.listModules(req.params.courseId as string);
  sendSuccess(res, 200, "Modules fetched", modules);
});

export const createModule = asyncHandler(async (req: Request, res: Response) => {
  const module = await moduleService.createModule(
    req.user!,
    req.params.courseId as string,
    req.body as CreateModuleInput
  );
  sendSuccess(res, 201, "Module created", module);
});

export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const module = await moduleService.updateModule(
    req.user!,
    req.params.id as string,
    req.body as UpdateModuleInput
  );
  sendSuccess(res, 200, "Module updated", module);
});

export const deleteModule = asyncHandler(async (req: Request, res: Response) => {
  await moduleService.deleteModule(req.user!, req.params.id as string);
  sendSuccess(res, 200, "Module deleted");
});

export const reorderModules = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await moduleService.reorderModules(req.user!, req.params.courseId as string, orderedIds);
  sendSuccess(res, 200, "Modules reordered");
});

export const listTopics = asyncHandler(async (req: Request, res: Response) => {
  const topics = await moduleService.listTopics(req.params.moduleId as string);
  sendSuccess(res, 200, "Topics fetched", topics);
});

export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  const topic = await moduleService.createTopic(
    req.user!,
    req.params.moduleId as string,
    req.body as CreateTopicInput
  );
  sendSuccess(res, 201, "Topic created", topic);
});

export const updateTopic = asyncHandler(async (req: Request, res: Response) => {
  const topic = await moduleService.updateTopic(
    req.user!,
    req.params.id as string,
    req.body as UpdateTopicInput
  );
  sendSuccess(res, 200, "Topic updated", topic);
});

export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  await moduleService.deleteTopic(req.user!, req.params.id as string);
  sendSuccess(res, 200, "Topic deleted");
});

export const reorderTopics = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await moduleService.reorderTopics(req.user!, req.params.moduleId as string, orderedIds);
  sendSuccess(res, 200, "Topics reordered");
});

export const listLessons = asyncHandler(async (req: Request, res: Response) => {
  const lessons = await moduleService.listLessons(req.params.topicId as string);
  sendSuccess(res, 200, "Lessons fetched", lessons);
});

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await moduleService.createLesson(
    req.user!,
    req.params.topicId as string,
    req.body as CreateLessonInput
  );
  sendSuccess(res, 201, "Lesson created", lesson);
});

/** Any authenticated role: admin/trainer get the full authoring content, a student gets the
 * learner view with quiz answers stripped (see progressService.getLessonForStudent). */
export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const requester = req.user!;
  const lesson =
    requester.role === "STUDENT"
      ? await progressService.getLessonForStudent(requester.id, req.params.id as string)
      : await moduleService.getLessonForAuthoring(requester, req.params.id as string);
  sendSuccess(res, 200, "Lesson fetched", lesson);
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await moduleService.updateLesson(
    req.user!,
    req.params.id as string,
    req.body as UpdateLessonInput
  );
  sendSuccess(res, 200, "Lesson updated", lesson);
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  await moduleService.deleteLesson(req.user!, req.params.id as string);
  sendSuccess(res, 200, "Lesson deleted");
});

export const reorderLessons = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await moduleService.reorderLessons(req.user!, req.params.topicId as string, orderedIds);
  sendSuccess(res, 200, "Lessons reordered");
});

export const submitLessonQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { answers } = req.body as { answers: number[] };
  const result = await progressService.submitLessonQuiz(req.user!.id, req.params.id as string, answers);
  sendSuccess(res, 200, "Quiz submitted", result);
});
