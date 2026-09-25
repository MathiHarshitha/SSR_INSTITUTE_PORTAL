"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertCircle, ImageUp, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PaymentQrCode } from "@/components/shared/payment-qr-code";
import { blobToDataUrl, useSubmitPaymentRequest } from "@/hooks/useFees";
import { extractErrorMessage } from "@/lib/api-client";
import { MyFeeStatusRow } from "@/types/fee";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_BYTES = 5 * 1024 * 1024;

function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Client-side checks are only for fast feedback — the backend re-validates type, content and size. */
function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_TYPES.includes(file.type) || !ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Please choose a PNG, JPG, JPEG or WEBP image.";
  }
  if (file.size > MAX_BYTES) return "Screenshot must be 5MB or smaller.";
  if (file.size === 0) return "The selected file is empty.";
  return null;
}

interface PayFeeDialogProps {
  row: MyFeeStatusRow | null;
  onOpenChange: (open: boolean) => void;
}

export function PayFeeDialog({ row, onOpenChange }: PayFeeDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const submitMutation = useSubmitPaymentRequest();

  const amountDue = row?.amountDue ?? 0;
  const amountText = amountInput ?? String(amountDue);
  const amount = Number(amountText);
  const amountError =
    !amountText || !Number.isFinite(amount) || amount <= 0
      ? "Enter the amount you paid."
      : amount > amountDue
        ? `Amount cannot exceed the remaining fee of ${inr(amountDue)}.`
        : null;

  function clearFile() {
    setFile(null);
    setPreviewUrl(null);
  }

  function reset() {
    clearFile();
    setFileError(null);
    setAmountInput(null);
    setSubmitError(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open && submitMutation.isPending) return;
    if (!open) reset();
    onOpenChange(open);
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    const error = validateFile(selected);
    setSubmitError(null);
    setFileError(error);
    clearFile();
    if (error) return;
    blobToDataUrl(selected)
      .then((url) => {
        setFile(selected);
        setPreviewUrl(url);
      })
      .catch(() => setFileError("Couldn't read that image. Please choose another file."));
  }

  function handleSubmit() {
    if (!row || !file || amountError) return;
    setSubmitError(null);
    submitMutation.mutate(
      { enrollmentId: row.enrollmentId, amount, screenshot: file },
      {
        onSuccess: () => handleOpenChange(false),
        onError: (error) => setSubmitError(extractErrorMessage(error)),
      }
    );
  }

  return (
    <Dialog open={!!row} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay course fee</DialogTitle>
          <DialogDescription>
            Pay using the QR code, then upload a screenshot of the successful payment for verification.
          </DialogDescription>
        </DialogHeader>

        {row && (
          <>
            <div className="rounded-2xl border border-border p-3">
              <p className="text-sm font-semibold text-foreground">{row.course.name}</p>
              <p className="text-xs text-muted-foreground">{row.batch.name}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-muted/50 py-2">
                  <p className="text-xs font-bold text-foreground">{inr(row.finalFee)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Fee</p>
                </div>
                <div className="rounded-xl bg-status-good/5 py-2">
                  <p className="text-xs font-bold text-status-good">{inr(row.amountPaid)}</p>
                  <p className="text-[10px] text-muted-foreground">Already Paid</p>
                </div>
                <div className="rounded-xl bg-accent/5 py-2">
                  <p className="text-xs font-bold text-accent">{inr(row.amountDue)}</p>
                  <p className="text-[10px] text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>

            <PaymentQrCode />

            <div className="grid gap-2">
              <Label htmlFor="pay-amount">Amount paid (₹)</Label>
              <Input
                id="pay-amount"
                type="number"
                inputMode="decimal"
                min={1}
                max={amountDue}
                step="0.01"
                value={amountText}
                onChange={(e) => setAmountInput(e.target.value)}
                disabled={submitMutation.isPending}
                aria-invalid={!!amountError}
              />
              {amountError ? (
                <p className="text-xs text-destructive">{amountError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter exactly what you paid — the admin will verify it against your screenshot.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Upload Payment Screenshot</Label>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleFileSelected}
              />
              {previewUrl && file ? (
                <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={previewUrl} alt="Payment screenshot preview" className="max-h-64 w-full object-contain" />
                  <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {file.name} · {(file.size / 1024).toFixed(0)} KB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={clearFile}
                      disabled={submitMutation.isPending}
                      aria-label="Remove screenshot"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:bg-muted/40"
                >
                  <ImageUp className="h-6 w-6 text-secondary" />
                  <span className="text-sm font-medium text-foreground">Choose screenshot</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, JPEG or WEBP · up to 5MB</span>
                </button>
              )}
              {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            </div>

            {submitMutation.isPending && (
              <div className="grid gap-1">
                <Progress value={submitMutation.progress} />
                <p className="text-xs text-muted-foreground">Uploading… {submitMutation.progress}%</p>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || !!amountError || submitMutation.isPending}>
            {submitMutation.isPending && <Loader2 className="animate-spin" />}
            {submitMutation.isPending ? "Submitting..." : "Submit Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
