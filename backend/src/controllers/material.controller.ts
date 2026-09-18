import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as materialService from "../services/material.service";
import {
  CreateMaterialInput,
  ListMaterialsQuery,
  UpdateMaterialInput,
} from "../validators/material.validator";

export const createMaterial = asyncHandler(async (req: Request, res: Response) => {
  const material = await materialService.createMaterial(
    req.user!.id,
    req.user!.role,
    req.body as CreateMaterialInput
  );
  sendSuccess(res, 201, "Material uploaded", material);
});

export const listMaterials = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListMaterialsQuery;
  const { materials, total } = await materialService.listMaterials(req.user!.id, req.user!.role, query);
  sendSuccess(
    res,
    200,
    "Materials fetched",
    materials,
    buildPaginationMeta(query.page, query.limit, total)
  );
});

export const updateMaterial = asyncHandler(async (req: Request, res: Response) => {
  const material = await materialService.updateMaterial(
    req.user!.id,
    req.user!.role,
    req.params.id as string,
    req.body as UpdateMaterialInput
  );
  sendSuccess(res, 200, "Material updated", material);
});

export const deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
  await materialService.deleteMaterial(req.user!.id, req.user!.role, req.params.id as string);
  sendSuccess(res, 200, "Material deleted");
});
