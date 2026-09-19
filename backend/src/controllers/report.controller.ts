import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as reportService from "../services/report.service";

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await reportService.getReportsOverview();
  sendSuccess(res, 200, "Reports overview fetched", overview);
});
