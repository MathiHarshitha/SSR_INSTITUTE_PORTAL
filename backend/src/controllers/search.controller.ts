import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as searchService from "../services/search.service";
import { SearchQuery } from "../validators/search.validator";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query as unknown as SearchQuery;
  const results = await searchService.search(q, req.user!);
  sendSuccess(res, 200, "Search results", results);
});
