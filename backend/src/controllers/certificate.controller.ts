import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, buildPaginationMeta } from "../utils/apiResponse";
import * as certificateService from "../services/certificate.service";
import {
  IssueCertificateInput,
  ListCertificatesQuery,
  RevokeCertificateInput,
} from "../validators/certificate.validator";

export const issueCertificate = asyncHandler(async (req: Request, res: Response) => {
  const certificate = await certificateService.issueCertificate(
    req.user!.id,
    req.body as IssueCertificateInput
  );
  sendSuccess(res, 201, "Certificate issued", certificate);
});

export const listCertificates = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListCertificatesQuery;
  const { certificates, total } = await certificateService.listCertificatesAdmin(query);
  sendSuccess(
    res,
    200,
    "Certificates fetched",
    certificates,
    buildPaginationMeta(query.page, query.limit, total)
  );
});

export const getCertificate = asyncHandler(async (req: Request, res: Response) => {
  const certificate = await certificateService.getCertificateById(req.params.id as string);
  sendSuccess(res, 200, "Certificate fetched", certificate);
});

export const revokeCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body as RevokeCertificateInput;
  const certificate = await certificateService.revokeCertificate(
    req.user!.id,
    req.params.id as string,
    reason
  );
  sendSuccess(res, 200, "Certificate revoked", certificate);
});

export const listMyCertificates = asyncHandler(async (req: Request, res: Response) => {
  const certificates = await certificateService.listMyCertificates(req.user!.id);
  sendSuccess(res, 200, "Certificates fetched", certificates);
});

export const verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
  const certificate = await certificateService.verifyCertificate(
    req.params.certificateNumber as string
  );
  sendSuccess(res, 200, "Certificate verified", certificate);
});
