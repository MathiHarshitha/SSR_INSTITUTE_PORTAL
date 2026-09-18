import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as classScheduleService from "../services/classSchedule.service";
import {
  CreateClassScheduleInput,
  ListClassSchedulesQuery,
  UpdateClassScheduleInput,
} from "../validators/classSchedule.validator";

export const createClass = asyncHandler(async (req: Request, res: Response) => {
  const classSchedule = await classScheduleService.createClass(
    req.user!.id,
    req.user!.role,
    req.body as CreateClassScheduleInput
  );
  sendSuccess(res, 201, "Class scheduled", classSchedule);
});

export const listClasses = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListClassSchedulesQuery;
  const classes = await classScheduleService.listClasses(req.user!.id, req.user!.role, query);
  sendSuccess(res, 200, "Classes fetched", classes);
});

export const updateClass = asyncHandler(async (req: Request, res: Response) => {
  const classSchedule = await classScheduleService.updateClass(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
    req.body as UpdateClassScheduleInput
  );
  sendSuccess(res, 200, "Class updated", classSchedule);
});

export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
  await classScheduleService.deleteClass(req.user!.id, req.user!.role, req.params.id as string);
  sendSuccess(res, 200, "Class deleted");
});
