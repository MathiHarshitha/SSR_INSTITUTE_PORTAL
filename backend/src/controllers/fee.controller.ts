import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as feeService from "../services/fee.service";
import {
  ListFeeStatusQuery,
  ListPaymentsQuery,
  RecordPaymentInput,
} from "../validators/fee.validator";

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await feeService.recordPayment(req.user!.id, req.body as RecordPaymentInput);
  sendSuccess(res, 201, "Payment recorded", payment);
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListPaymentsQuery;
  const { payments, total } = await feeService.listPayments(query);
  sendSuccess(res, 200, "Payments fetched", payments, buildPaginationMeta(query.page, query.limit, total));
});

export const listFeeStatus = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListFeeStatusQuery;
  const { rows, total } = await feeService.listFeeStatus(query);
  sendSuccess(res, 200, "Fee status fetched", rows, buildPaginationMeta(query.page, query.limit, total));
});

export const getMyFeeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { rows } = await feeService.listFeeStatus({ page: 1, limit: 100 }, req.user!.id);
  sendSuccess(res, 200, "Fee status fetched", rows);
});

export const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const payments = await feeService.getMyPayments(req.user!.id);
  sendSuccess(res, 200, "Payments fetched", payments);
});

export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await feeService.getPaymentHistory(
    req.params.studentId as string,
    req.params.batchId as string
  );
  sendSuccess(res, 200, "Payment history fetched", history);
});

export const updateDiscount = asyncHandler(async (req: Request, res: Response) => {
  const { discount } = req.body as { discount: number };
  const enrollment = await feeService.updateDiscount(req.user!.id, req.params.enrollmentId as string, discount);
  sendSuccess(res, 200, "Discount updated", enrollment);
});
