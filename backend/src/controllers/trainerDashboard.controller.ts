import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as trainerDashboardService from "../services/trainerDashboard.service";
import * as studentDashboardService from "../services/studentDashboard.service";

export const getTrainerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await trainerDashboardService.getTrainerDashboard(req.user!.id);
  sendSuccess(res, 200, "Trainer dashboard fetched", stats);
});

export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await studentDashboardService.getStudentDashboard(req.user!.id);
  sendSuccess(res, 200, "Student dashboard fetched", stats);
});
