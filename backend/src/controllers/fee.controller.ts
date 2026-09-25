import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as feeService from "../services/fee.service";
import * as paymentRequestService from "../services/paymentRequest.service";
import * as paymentSettingsService from "../services/paymentSettings.service";
import {
  ApprovePaymentRequestInput,
  ListFeeStatusQuery,
  ListPaymentRequestsQuery,
  ListPaymentsQuery,
  RecordPaymentInput,
  RejectPaymentRequestInput,
  SubmitPaymentRequestInput,
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

// --- Screenshot payment verification ---------------------------------------------------------

/** Private images: never cached by shared caches, and served with their verified MIME type. */
function sendPrivateImage(res: Response, image: { buffer: Buffer; mimeType: string }) {
  res.setHeader("Content-Type", image.mimeType);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Disposition", "inline");
  res.status(200).send(image.buffer);
}

export const submitPaymentRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await paymentRequestService.submitPaymentRequest(
    req.user!.id,
    req.body as SubmitPaymentRequestInput,
    req.file
  );
  sendSuccess(res, 201, "Payment screenshot submitted for verification", request);
});

export const getMyPaymentRequests = asyncHandler(async (req: Request, res: Response) => {
  const requests = await paymentRequestService.listMyPaymentRequests(req.user!.id);
  sendSuccess(res, 200, "Payment requests fetched", requests);
});

export const listPaymentRequests = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListPaymentRequestsQuery;
  const { requests, total } = await paymentRequestService.listPaymentRequests(query);
  sendSuccess(res, 200, "Payment requests fetched", requests, buildPaginationMeta(query.page, query.limit, total));
});

export const getPaymentRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await paymentRequestService.getPaymentRequest(req.params.id as string);
  sendSuccess(res, 200, "Payment request fetched", request);
});

export const getPaymentRequestScreenshot = asyncHandler(async (req: Request, res: Response) => {
  const image = await paymentRequestService.getScreenshot(req.user!, req.params.id as string);
  sendPrivateImage(res, image);
});

export const approvePaymentRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await paymentRequestService.approvePaymentRequest(
    req.user!.id,
    req.params.id as string,
    req.body as ApprovePaymentRequestInput
  );
  sendSuccess(res, 200, "Payment approved", request);
});

export const rejectPaymentRequest = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as RejectPaymentRequestInput;
  const request = await paymentRequestService.rejectPaymentRequest(req.user!.id, req.params.id as string, reason);
  sendSuccess(res, 200, "Payment rejected", request);
});

export const getPaymentSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await paymentSettingsService.getPaymentSettings();
  sendSuccess(res, 200, "Payment settings fetched", settings);
});

export const getPaymentQrCode = asyncHandler(async (_req: Request, res: Response) => {
  sendPrivateImage(res, await paymentSettingsService.getQrCodeImage());
});

export const replacePaymentQrCode = asyncHandler(async (req: Request, res: Response) => {
  const settings = await paymentSettingsService.replaceQrCode(req.user!.id, req.file);
  sendSuccess(res, 200, "Payment QR code updated", settings);
});

export const removePaymentQrCode = asyncHandler(async (req: Request, res: Response) => {
  const settings = await paymentSettingsService.removeQrCode(req.user!.id);
  sendSuccess(res, 200, "Payment QR code removed", settings);
});
