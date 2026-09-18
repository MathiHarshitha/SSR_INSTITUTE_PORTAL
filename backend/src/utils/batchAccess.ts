import { Batch, IBatch } from "../models/Batch";
import { ApiError } from "../utils/ApiError";
import { Role } from "../constants/enums";

/**
 * Enforces spec §60 rule #6: trainers can only access their own assigned
 * batches; admins can access any batch. Never trust a role/id sent by the
 * client alone — this re-fetches the batch and compares its stored trainer.
 */
export async function assertBatchAccess(
  batchId: string,
  userId: string,
  role: Role
): Promise<IBatch> {
  const batch = await Batch.findById(batchId);
  if (!batch) throw ApiError.notFound("Batch not found");

  if (role === "ADMIN") return batch;

  if (role === "TRAINER" && batch.trainer && String(batch.trainer) === userId) {
    return batch;
  }

  throw ApiError.forbidden("You do not have access to this batch");
}

export async function listTrainerBatchIds(trainerId: string): Promise<string[]> {
  const batches = await Batch.find({ trainer: trainerId }).select("_id").lean();
  return batches.map((b) => String(b._id));
}
