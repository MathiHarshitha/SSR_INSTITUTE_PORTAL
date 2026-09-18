import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as batchService from "../services/batch.service";
import { CreateBatchInput, ListBatchesQuery, UpdateBatchInput } from "../validators/batch.validator";
import { BatchStatus } from "../models/Batch";

export const listBatches = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListBatchesQuery;
  const { batches, total } = await batchService.listBatchesAdmin(query);
  sendSuccess(res, 200, "Batches fetched", batches, buildPaginationMeta(query.page, query.limit, total));
});

export const getBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await batchService.getBatchById(req.params.id as string);
  sendSuccess(res, 200, "Batch fetched", batch);
});

export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await batchService.createBatch(req.user!.id, req.body as CreateBatchInput);
  sendSuccess(res, 201, "Batch created", batch);
});

export const updateBatch = asyncHandler(async (req: Request, res: Response) => {
  const batch = await batchService.updateBatch(
    req.user!.id,
    req.params.id as string,
    req.body as UpdateBatchInput
  );
  sendSuccess(res, 200, "Batch updated", batch);
});

export const updateBatchStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: BatchStatus };
  const batch = await batchService.updateBatchStatus(req.user!.id, req.params.id as string, status);
  sendSuccess(res, 200, "Batch status updated", batch);
});

export const listBatchStudents = asyncHandler(async (req: Request, res: Response) => {
  const students = await batchService.listBatchStudents(req.params.id as string);
  sendSuccess(res, 200, "Enrolled students fetched", students);
});

export const enrollStudent = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.body as { studentId: string };
  const enrollment = await batchService.enrollStudent(req.user!.id, req.params.id as string, studentId);
  sendSuccess(res, 201, "Student enrolled", enrollment);
});

export const removeStudent = asyncHandler(async (req: Request, res: Response) => {
  await batchService.removeStudent(req.user!.id, req.params.id as string, req.params.studentId as string);
  sendSuccess(res, 200, "Student removed from batch");
});
