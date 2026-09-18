import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as attendanceService from "../services/attendance.service";
import { ListAttendanceQuery, MarkAttendanceInput } from "../validators/attendance.validator";

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const records = await attendanceService.markAttendance(
    req.user!.id,
    req.user!.role,
    req.body as MarkAttendanceInput
  );
  sendSuccess(res, 200, "Attendance marked", records);
});

export const listAttendance = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListAttendanceQuery;
  const records = await attendanceService.listAttendance(req.user!.id, req.user!.role, query);
  sendSuccess(res, 200, "Attendance fetched", records);
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await attendanceService.getAttendanceSummary(
    req.params.batchId as string,
    req.user!.id,
    req.user!.role
  );
  sendSuccess(res, 200, "Attendance summary fetched", summary);
});
