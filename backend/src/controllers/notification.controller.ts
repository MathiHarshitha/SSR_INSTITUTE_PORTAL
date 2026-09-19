import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as notificationService from "../services/notification.service";
import { ListNotificationsQuery } from "../validators/notification.validator";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListNotificationsQuery;
  const { notifications, total } = await notificationService.listMyNotifications(
    req.user!.id,
    query
  );
  sendSuccess(
    res,
    200,
    "Notifications fetched",
    notifications,
    buildPaginationMeta(query.page, query.limit, total)
  );
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.id);
  sendSuccess(res, 200, "Unread count fetched", { count });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Notification marked read", notification);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.id);
  sendSuccess(res, 200, "All notifications marked read");
});
