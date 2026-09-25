import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { assertValidUpload } from "../utils/fileSignature";
import { sanitizeFolder, uploadBuffer } from "../services/upload.service";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw ApiError.badRequest("No file was uploaded");

  assertValidUpload(file);

  // Students only ever upload task submissions; they don't get to choose a storage folder
  // (e.g. write into the folder staff materials are served from).
  const folder =
    req.user!.role === "STUDENT" ? "submissions" : sanitizeFolder(req.body.folder as string | undefined);
  const result = await uploadBuffer(file.buffer, file.originalname, folder);

  sendSuccess(res, 201, "File uploaded", result);
});
