"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, ZoomIn, ZoomOut } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import {
  useApprovePaymentRequest,
  usePaymentRequest,
  usePaymentRequestScreenshot,
  useRejectPaymentRequest,
} from "@/hooks/useFees";

function inr(amount: number | undefined) {
  return `₹${(amount ?? 0).toLocaleString("en-IN")}`;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

interface PaymentRequestDialogProps {
  requestId: string | null;
  /** Open straight into the approve or reject step (from the table's row actions). */
  initialMode?: "view" | "approve" | "reject";
  onOpenChange: (open: boolean) => void;
}

export function PaymentRequestDialog({ requestId, initialMode = "view", onOpenChange }: PaymentRequestDialogProps) {
  const { data: request, isLoading, isError } = usePaymentRequest(requestId);
  const { data: screenshotUrl, isLoading: isLoadingShot, isError: isShotError } =
    usePaymentRequestScreenshot(requestId);
  const approveMutation = useApprovePaymentRequest();
  const rejectMutation = useRejectPaymentRequest();

  const [modeOverride, setModeOverride] = useState<"view" | "approve" | "reject" | null>(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [zoomed, setZoomed] = useState(false);

  const mode = modeOverride ?? initialMode;
  const isPending = request?.status === "PENDING";
  const busy = approveMutation.isPending || rejectMutation.isPending;

  const approvedAmountText = approvedAmountInput ?? String(request?.amount ?? "");
  const approvedAmount = Number(approvedAmountText);
  const currentDue = request?.currentBalance?.amountDue;
  const approveError =
    !Number.isFinite(approvedAmount) || approvedAmount <= 0
      ? "Enter the verified amount."
      : currentDue !== undefined && approvedAmount > currentDue
        ? `Exceeds the current remaining fee of ${inr(currentDue)}.`
        : null;
  const reasonError = reason.trim().length < 5 ? "Give a reason of at least 5 characters." : null;

  function handleOpenChange(open: boolean) {
    if (!open && busy) return;
    if (!open) {
      setModeOverride(null);
      setApprovedAmountInput(null);
      setReason("");
    }
    onOpenChange(open);
  }

  function handleApprove() {
    if (!request || approveError) return;
    approveMutation.mutate(
      { id: request._id, amount: approvedAmount !== request.amount ? approvedAmount : undefined },
      { onSuccess: () => handleOpenChange(false) }
    );
  }

  function handleReject() {
    if (!request || reasonError) return;
    rejectMutation.mutate({ id: request._id, reason: reason.trim() }, { onSuccess: () => handleOpenChange(false) });
  }

  const student = request && typeof request.student === "object" ? request.student : null;
  const batchName = request && typeof request.batch === "object" ? request.batch.name : "";
  const balanceChanged =
    request?.currentBalance &&
    isPending &&
    (request.currentBalance.amountPaid !== request.previousPaidAmount ||
      request.currentBalance.finalFee !== request.totalFee);
  const previousAttempts = request?.history.filter((h) => h._id !== request._id) ?? [];

  return (
    <Dialog open={!!requestId} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment verification</DialogTitle>
          <DialogDescription>
            Check the screenshot against the institute account before approving.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : isError || !request ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Couldn&apos;t load this payment request.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex min-h-72 flex-col overflow-hidden rounded-xl border border-border bg-muted/30">
              {isLoadingShot ? (
                <Skeleton className="h-full min-h-72 w-full" />
              ) : isShotError || !screenshotUrl ? (
                <p className="m-auto p-6 text-center text-sm text-muted-foreground">Screenshot unavailable.</p>
              ) : (
                <>
                  <div className={zoomed ? "max-h-[70vh] flex-1 overflow-auto" : "flex-1"}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from an authorized fetch */}
                    <img
                      src={screenshotUrl}
                      alt={`Payment screenshot from ${request.studentName}`}
                      className={zoomed ? "w-[200%] max-w-none" : "max-h-[28rem] w-full object-contain"}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomed((z) => !z)}
                    className="flex items-center justify-center gap-1 border-t border-border py-2 text-xs font-medium text-secondary hover:underline"
                  >
                    {zoomed ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
                    {zoomed ? "Fit to view" : "Zoom in"}
                  </button>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <PaymentStatusBadge status={request.status} variant="request" />
                <span className="text-xs text-muted-foreground">
                  Submitted {new Date(request.submittedAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Student" value={request.studentName} />
                <Field label="Email" value={student?.email ?? "—"} />
                <Field
                  label="Student ID"
                  value={<span className="font-mono text-xs">{student?._id ?? String(request.student)}</span>}
                />
                <Field label="Course" value={`${request.courseName}${batchName ? ` · ${batchName}` : ""}`} />
                <Field label="Total fee" value={inr(request.totalFee)} />
                <Field label="Previously paid" value={inr(request.previousPaidAmount)} />
                <Field label="Submitted amount" value={<span className="text-secondary">{inr(request.amount)}</span>} />
                <Field
                  label="Remaining if approved"
                  value={inr(Math.max(0, request.amountDueAtSubmission - request.amount))}
                />
              </div>

              {balanceChanged && request.currentBalance && (
                <div className="flex items-start gap-2 rounded-lg bg-status-warning/10 px-3 py-2 text-xs text-status-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    The balance changed since submission. Currently paid {inr(request.currentBalance.amountPaid)} of{" "}
                    {inr(request.currentBalance.finalFee)} — remaining {inr(request.currentBalance.amountDue)}.
                  </span>
                </div>
              )}
              {isPending && !request.currentBalance && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>This student is no longer enrolled in this batch. The request can only be rejected.</span>
                </div>
              )}

              {request.status !== "PENDING" && (
                <div className="rounded-lg border border-border p-3 text-xs">
                  <p className="text-muted-foreground">
                    {request.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
                    <span className="font-medium text-foreground">{request.reviewedByName}</span> on{" "}
                    {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "—"}
                  </p>
                  {request.status === "APPROVED" && (
                    <p className="mt-1 text-foreground">
                      Credited {inr(request.approvedAmount)} · Paid {inr(request.paidAfterApproval)} · Remaining{" "}
                      {inr(request.remainingAfterApproval)}
                    </p>
                  )}
                  {request.rejectionReason && <p className="mt-1 text-foreground">Reason: {request.rejectionReason}</p>}
                </div>
              )}

              {isPending && mode === "approve" && (
                <div className="grid gap-2 rounded-lg border border-border p-3">
                  <Label htmlFor="approve-amount">Verified amount (₹)</Label>
                  <Input
                    id="approve-amount"
                    type="number"
                    min={1}
                    step="0.01"
                    value={approvedAmountText}
                    onChange={(e) => setApprovedAmountInput(e.target.value)}
                    disabled={busy}
                  />
                  <p className={approveError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                    {approveError ?? "Defaults to the amount the student entered. Change it only if the screenshot shows otherwise."}
                  </p>
                </div>
              )}

              {isPending && mode === "reject" && (
                <div className="grid gap-2 rounded-lg border border-border p-3">
                  <Label htmlFor="reject-reason">Rejection reason</Label>
                  <Textarea
                    id="reject-reason"
                    rows={3}
                    placeholder="e.g. Payment screenshot is unclear."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={busy}
                  />
                  <p className="text-xs text-muted-foreground">The student will see this reason.</p>
                </div>
              )}

              {previousAttempts.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-foreground">Earlier submissions for this course</p>
                  <ul className="space-y-1">
                    {previousAttempts.map((h) => (
                      <li key={h._id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {new Date(h.submittedAt).toLocaleDateString()} · {inr(h.approvedAmount ?? h.amount)}
                        </span>
                        <PaymentStatusBadge status={h.status} variant="request" className="px-2 py-0.5 text-[10px]" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {request && isPending && (
          <DialogFooter>
            {mode === "view" && (
              <>
                <Button variant="outline" onClick={() => setModeOverride("reject")}>
                  Reject
                </Button>
                <Button onClick={() => setModeOverride("approve")} disabled={!request.currentBalance}>
                  Approve
                </Button>
              </>
            )}
            {mode === "approve" && (
              <>
                <Button variant="outline" onClick={() => setModeOverride("view")} disabled={busy}>
                  Back
                </Button>
                <Button onClick={handleApprove} disabled={busy || !!approveError || !request.currentBalance}>
                  {approveMutation.isPending && <Loader2 className="animate-spin" />}
                  Confirm approval
                </Button>
              </>
            )}
            {mode === "reject" && (
              <>
                <Button variant="outline" onClick={() => setModeOverride("view")} disabled={busy}>
                  Back
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={busy || !!reasonError}>
                  {rejectMutation.isPending && <Loader2 className="animate-spin" />}
                  Confirm rejection
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
