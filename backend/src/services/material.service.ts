import { searchRegex } from "../utils/searchRegex";
import { FilterQuery } from "mongoose";
import { Material, IMaterial } from "../models/Material";
import { ApiError } from "../utils/ApiError";
import { assertBatchAccess, listStudentBatchIds, listTrainerBatchIds } from "../utils/batchAccess";
import { recordAudit } from "./auditLog.service";
import { Role } from "../constants/enums";
import {
  CreateMaterialInput,
  ListMaterialsQuery,
  UpdateMaterialInput,
} from "../validators/material.validator";

export async function createMaterial(
  userId: string,
  role: Role,
  input: CreateMaterialInput
) {
  const batch = await assertBatchAccess(input.batch, userId, role);

  const material = await Material.create({
    ...input,
    course: batch.course,
    uploadedBy: userId,
  });

  await recordAudit({
    userId,
    action: "MATERIAL_UPLOADED",
    entity: "Material",
    entityId: material._id,
  });

  return material;
}

export async function listMaterials(userId: string, role: Role, query: ListMaterialsQuery) {
  const filter: FilterQuery<IMaterial> = {};

  if (query.batch) {
    await assertBatchAccess(query.batch, userId, role);
    filter.batch = query.batch;
  } else if (role === "TRAINER") {
    // No specific batch requested — scope to batches this trainer owns.
    filter.batch = { $in: await listTrainerBatchIds(userId) };
  } else if (role === "STUDENT") {
    filter.batch = { $in: await listStudentBatchIds(userId) };
  }

  if (query.module) filter.module = query.module;
  if (query.search) filter.title = searchRegex(query.search);

  const skip = (query.page - 1) * query.limit;

  const [materials, total] = await Promise.all([
    Material.find(filter)
      .populate("module", "name")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Material.countDocuments(filter),
  ]);

  return { materials, total };
}

export async function updateMaterial(
  userId: string,
  role: Role,
  id: string,
  input: UpdateMaterialInput
) {
  const material = await Material.findById(id);
  if (!material) throw ApiError.notFound("Material not found");

  await assertBatchAccess(String(material.batch), userId, role);

  Object.assign(material, input);
  await material.save();

  await recordAudit({ userId, action: "MATERIAL_UPDATED", entity: "Material", entityId: material._id });
  return material;
}

export async function deleteMaterial(userId: string, role: Role, id: string) {
  const material = await Material.findById(id);
  if (!material) throw ApiError.notFound("Material not found");

  await assertBatchAccess(String(material.batch), userId, role);

  await material.deleteOne();
  await recordAudit({ userId, action: "MATERIAL_DELETED", entity: "Material", entityId: id });
}
