import { PaymentSettings } from "../models/PaymentSettings";
import { ApiError } from "../utils/ApiError";
import { assertValidImage } from "../utils/imageValidation";
import { MAX_PAYMENT_IMAGE_BYTES } from "../middleware/upload";
import { recordAudit } from "./auditLog.service";
import { deletePrivateFile, readPrivateFile, uploadPrivateImage } from "./upload.service";

const SETTINGS_KEY = "default";

/** Public-safe view: whether a QR code is configured and when it last changed. The image
 * itself is served by `getQrCodeImage`; storage details never leave the backend. */
export async function getPaymentSettings() {
  const settings = await PaymentSettings.findOne({ key: SETTINGS_KEY }).lean();
  return {
    qrCode: settings?.qrCode
      ? { available: true, updatedAt: settings.qrCode.uploadedAt }
      : { available: false, updatedAt: null },
  };
}

export async function getQrCodeImage() {
  const settings = await PaymentSettings.findOne({ key: SETTINGS_KEY }).lean();
  if (!settings?.qrCode) throw ApiError.notFound("No payment QR code has been configured");
  const buffer = await readPrivateFile(settings.qrCode);
  return { buffer, mimeType: settings.qrCode.mimeType };
}

export async function replaceQrCode(adminId: string, file: Express.Multer.File | undefined) {
  if (!file) throw ApiError.badRequest("Please attach a QR code image");
  const mimeType = assertValidImage(file, MAX_PAYMENT_IMAGE_BYTES);
  const stored = await uploadPrivateImage(file.buffer, mimeType, "payment-qr");

  const previous = await PaymentSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: { qrCode: { ...stored, uploadedBy: adminId, uploadedAt: new Date() } } },
    { upsert: true, new: false }
  ).lean();
  if (previous?.qrCode) await deletePrivateFile(previous.qrCode);

  await recordAudit({
    userId: adminId,
    action: "PAYMENT_QR_UPDATED",
    entity: "PaymentSettings",
    metadata: { bytes: stored.bytes, mimeType },
  });

  return getPaymentSettings();
}

export async function removeQrCode(adminId: string) {
  const previous = await PaymentSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $unset: { qrCode: 1 } },
    { new: false }
  ).lean();
  if (previous?.qrCode) await deletePrivateFile(previous.qrCode);

  await recordAudit({ userId: adminId, action: "PAYMENT_QR_REMOVED", entity: "PaymentSettings" });
  return getPaymentSettings();
}
