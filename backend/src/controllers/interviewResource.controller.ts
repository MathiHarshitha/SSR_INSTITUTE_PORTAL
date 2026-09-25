import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as interviewResourceService from "../services/interviewResource.service";
import {
  CreateInterviewResourceInput,
  UpdateInterviewResourceInput,
} from "../validators/interviewResource.validator";

export const createInterviewResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await interviewResourceService.createInterviewResource(
    req.user!,
    req.body as CreateInterviewResourceInput
  );
  sendSuccess(res, 201, "Interview resource created", resource);
});

export const updateInterviewResource = asyncHandler(async (req: Request, res: Response) => {
  const resource = await interviewResourceService.updateInterviewResource(
    req.user!,
    req.params.id as string,
    req.body as UpdateInterviewResourceInput
  );
  sendSuccess(res, 200, "Interview resource updated", resource);
});

export const deleteInterviewResource = asyncHandler(async (req: Request, res: Response) => {
  await interviewResourceService.deleteInterviewResource(req.user!, req.params.id as string);
  sendSuccess(res, 200, "Interview resource deleted");
});

export const listInterviewResourcesAdmin = asyncHandler(async (req: Request, res: Response) => {
  const resources = await interviewResourceService.listInterviewResourcesAdmin(req.user!);
  sendSuccess(res, 200, "Interview resources fetched", resources);
});

export const listInterviewResourcesForStudent = asyncHandler(async (req: Request, res: Response) => {
  const resources = await interviewResourceService.listInterviewResourcesForStudent(req.user!.id);
  sendSuccess(res, 200, "Interview resources fetched", resources);
});
