import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as codingService from "../services/coding.service";

export const getCodingState = asyncHandler(async (req: Request, res: Response) => {
  const state = await codingService.getCodingState(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Coding state fetched", state);
});

export const submitCodingAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body as { code: string };
  const result = await codingService.submitCodingAnswer(req.user!.id, req.params.id as string, code);
  sendSuccess(res, 200, "Code submitted", result);
});
