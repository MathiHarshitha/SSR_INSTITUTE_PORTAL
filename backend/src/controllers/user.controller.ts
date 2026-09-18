import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as userService from "../services/user.service";
import { ListUsersQuery } from "../validators/user.validator";

export const getUserStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await userService.getUserStats();
  sendSuccess(res, 200, "User stats fetched", stats);
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListUsersQuery;
  const { users, total } = await userService.listUsers(query);
  sendSuccess(res, 200, "Users fetched", users, buildPaginationMeta(query.page, query.limit, total));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  sendSuccess(res, 200, "User fetched", user);
});

export const approveUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.approveUser(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "User approved", user);
});

export const rejectUser = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const user = await userService.rejectUser(req.user!.id, req.params.id as string, reason);
  sendSuccess(res, 200, "User rejected", user);
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.blockUser(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "User blocked", user);
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.unblockUser(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "User unblocked", user);
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const user = await userService.suspendUser(req.user!.id, req.params.id as string, reason);
  sendSuccess(res, 200, "User suspended", user);
});

export const reactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.reactivateUser(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "User reactivated", user);
});
