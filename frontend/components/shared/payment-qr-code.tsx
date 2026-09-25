"use client";

import { Loader2, QrCode } from "lucide-react";
import { usePaymentQrCode, usePaymentSettings } from "@/hooks/useFees";

/**
 * Shows the institute's current payment QR code, as configured by an admin (served by the
 * backend — nothing is hardcoded here). Falls back to a placeholder until one is uploaded.
 */
export function PaymentQrCode() {
  const { data: settings, isLoading: isLoadingSettings } = usePaymentSettings();
  const available = !!settings?.qrCode.available;
  const { data: url, isLoading: isLoadingImage, isError } = usePaymentQrCode(
    settings?.qrCode.updatedAt,
    available
  );

  const isLoading = isLoadingSettings || (available && isLoadingImage);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : url && !isError ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: URL from an authorized fetch
          <img src={url} alt="Payment QR code" className="h-full w-full bg-white object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <QrCode className="h-12 w-12" />
            <span className="text-[11px] font-semibold tracking-wide">QR CODE PLACEHOLDER</span>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">Scan the QR code to make the payment.</p>
    </div>
  );
}
