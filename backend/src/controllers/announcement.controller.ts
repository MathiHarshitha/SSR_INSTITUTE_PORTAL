import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as announcementService from "../services/announcement.service";
import {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
} from "../validators/announcement.validator";

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await announcementService.createAnnouncement(
    req.user!.id,
    req.body as CreateAnnouncementInput
  );
  sendSuccess(res, 201, "Announcement published", announcement);
});

export const listAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListAnnouncementsQuery;
  const { announcements, total } = await announcementService.listAnnouncements(query, req.user!);
  sendSuccess(
    res,
    200,
    "Announcements fetched",
    announcements,
    buildPaginationMeta(query.page, query.limit, total)
  );
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  await announcementService.deleteAnnouncement(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, "Announcement deleted");
});
