import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as quizAttemptService from "../services/quizAttempt.service";

export const getQuizState = asyncHandler(async (req: Request, res: Response) => {
  const state = await quizAttemptService.getQuizState(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Quiz state fetched", state);
});

export const startQuiz = asyncHandler(async (req: Request, res: Response) => {
  const state = await quizAttemptService.startQuiz(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Quiz started", state);
});

export const answerQuizQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { selectedIndex } = req.body as { selectedIndex: number };
  const state = await quizAttemptService.answerQuizQuestion(
    req.user!.id,
    req.params.id as string,
    selectedIndex
  );
  sendSuccess(res, 200, "Answer recorded", state);
});

export const submitQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizAttemptService.submitQuiz(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Quiz submitted", result);
});

export const quitQuiz = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizAttemptService.quitQuiz(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Quiz ended", result);
});
