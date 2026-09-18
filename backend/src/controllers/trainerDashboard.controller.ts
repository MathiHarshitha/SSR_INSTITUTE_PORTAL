import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as trainerDashboardService from "../services/trainerDashboard.service";

export const getTrainerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await trainerDashboardService.getTrainerDashboard(req.user!.id);
  sendSuccess(res, 200, "Trainer dashboard fetched", stats);
});
