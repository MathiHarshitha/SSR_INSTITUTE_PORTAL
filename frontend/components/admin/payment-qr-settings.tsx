"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PaymentQrCode } from "@/components/shared/payment-qr-code";
import { usePaymentSettings, useRemovePaymentQrCode, useReplacePaymentQrCode } from "@/hooks/useFees";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/** Lets an admin replace the payment QR students see, without any frontend change or redeploy. */
export function PaymentQrSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const { data: settings } = usePaymentSettings();
  const replaceMutation = useReplacePaymentQrCode();
  const removeMutation = useRemovePaymentQrCode();
  const hasQr = !!settings?.qrCode.available;

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return setFileError("Please choose a PNG, JPG, JPEG or WEBP image.");
    if (file.size > MAX_BYTES) return setFileError("QR image must be 5MB or smaller.");
    setFileError(null);
    replaceMutation.mutate(file);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <PaymentQrCode />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Payment QR code</p>
            <p className="text-sm text-muted-foreground">
              Students see this QR in the Pay Now window. Replace it whenever the institute&apos;s payment
              account changes — it takes effect immediately.
            </p>
            {settings?.qrCode.updatedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Last updated {new Date(settings.qrCode.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleFileSelected}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => inputRef.current?.click()} disabled={replaceMutation.isPending}>
              {replaceMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              {hasQr ? "Replace QR code" : "Upload QR code"}
            </Button>
            {hasQr && (
              <Button variant="outline" onClick={() => setConfirmRemove(true)} disabled={removeMutation.isPending}>
                <Trash2 />
                Remove
              </Button>
            )}
          </div>
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remove payment QR code?"
        description="Students will see a placeholder instead of a QR code until a new one is uploaded."
        confirmLabel="Remove"
        destructive
        isLoading={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate(undefined, { onSuccess: () => setConfirmRemove(false) })}
      />
    </Card>
  );
}
