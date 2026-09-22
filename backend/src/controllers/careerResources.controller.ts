import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as careerResourcesService from "../services/careerResources.service";

export const getCareerResourcesStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await careerResourcesService.getCareerResourcesStatus(req.user!.id);
  sendSuccess(res, 200, "Career resources status fetched", status);
});
