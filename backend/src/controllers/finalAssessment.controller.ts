import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as finalAssessmentService from "../services/finalAssessment.service";
import { CreateFinalAssessmentInput, UpdateFinalAssessmentInput } from "../validators/finalAssessment.validator";

export const upsertFinalAssessment = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await finalAssessmentService.upsertFinalAssessment(
    req.user!,
    req.params.courseId as string,
    req.body as CreateFinalAssessmentInput
  );
  sendSuccess(res, 200, "Final assessment saved", assessment);
});

export const updateFinalAssessment = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await finalAssessmentService.updateFinalAssessment(
    req.user!,
    req.params.courseId as string,
    req.body as UpdateFinalAssessmentInput
  );
  sendSuccess(res, 200, "Final assessment updated", assessment);
});

export const getFinalAssessmentForAuthoring = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await finalAssessmentService.getFinalAssessmentForAuthoring(
    req.user!,
    req.params.courseId as string
  );
  sendSuccess(res, 200, "Final assessment fetched", assessment);
});

export const getFinalAssessmentState = asyncHandler(async (req: Request, res: Response) => {
  const state = await finalAssessmentService.getFinalAssessmentState(
    req.user!.id,
    req.params.courseId as string
  );
  sendSuccess(res, 200, "Final assessment state fetched", state);
});

export const startFinalAssessment = asyncHandler(async (req: Request, res: Response) => {
  const state = await finalAssessmentService.startFinalAssessment(
    req.user!.id,
    req.params.courseId as string
  );
  sendSuccess(res, 200, "Final assessment started", state);
});

export const answerFinalAssessmentQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { selectedIndex } = req.body as { selectedIndex: number };
  const state = await finalAssessmentService.answerFinalAssessmentQuestion(
    req.user!.id,
    req.params.courseId as string,
    selectedIndex
  );
  sendSuccess(res, 200, "Answer recorded", state);
});

export const submitFinalAssessment = asyncHandler(async (req: Request, res: Response) => {
  const result = await finalAssessmentService.submitFinalAssessment(
    req.user!.id,
    req.params.courseId as string
  );
  sendSuccess(res, 200, "Final assessment submitted", result);
});
