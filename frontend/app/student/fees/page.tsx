"use client";

import { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock3,
  TrendingUp,
  HeadphonesIcon,
  Info,
  QrCode,
  Hourglass,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyFeeStatus, useMyPaymentRequests, useMyPayments } from "@/hooks/useFees";
import { MyFeeStatusRow } from "@/types/fee";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { PayFeeDialog } from "@/components/student/pay-fee-dialog";
import { ReceiptDownloadButton } from "@/components/shared/receipt-download-button";

/** What to show in place of Pay Now — driven entirely by backend-computed status. */
function FeeAction({ row, onPay }: { row: MyFeeStatusRow; onPay: () => void }) {
  if (row.paymentStatus === "PAID") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-good">
        <CheckCircle2 className="h-4 w-4" />
        PAID
      </span>
    );
  }
  if (row.paymentStatus === "PAYMENT_UNDER_REVIEW") {
    return (
      <Button size="sm" variant="outline" disabled className="text-secondary">
        <Hourglass />
        Payment Under Review
      </Button>
    );
  }
  if (!row.canPay) return null;
  return (
    <Button size="sm" onClick={onPay}>
      <QrCode />
      {row.paymentStatus === "REJECTED" ? "Pay Again" : "Pay Now"}
    </Button>
  );
}

export default function StudentFeesPage() {
  const { data: statusRows, isLoading: isLoadingStatus, isError: isStatusError } = useMyFeeStatus();
  const { data: payments, isLoading: isLoadingPayments } = useMyPayments();
  const { data: paymentRequests, isLoading: isLoadingRequests } = useMyPaymentRequests();
  const [payingEnrollmentId, setPayingEnrollmentId] = useState<string | null>(null);

  const rows = statusRows ?? [];
  const totalPaid = rows.reduce((s, r) => s + r.amountPaid, 0);
  const totalDue = rows.reduce((s, r) => s + r.amountDue, 0);
  const totalFee = rows.reduce((s, r) => s + r.finalFee, 0);
  const overallPct = totalFee ? Math.round((totalPaid / totalFee) * 100) : 0;
  const pendingCount = rows.filter((r) => r.status !== "PAID").length;
  // Look the row up from fresh server data each render, so the modal never works off stale figures.
  const payingRow = rows.find((r) => r.enrollmentId === payingEnrollmentId && r.canPay) ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Fees & Payments"
        eyebrowIcon={Wallet}
        title="Fees &"
        titleAccent="Payments"
        subtitle="Track your course fees and manage your payments easily."
        quote="An investment in knowledge always pays the best interest."
      />

      {isLoadingStatus ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[52px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Amount Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} icon={CheckCircle2} color="green" />
          <StatCard label="Remaining Fee" value={`₹${totalDue.toLocaleString("en-IN")}`} icon={Clock3} color="accent" />
          <StatCard label="Pending Enrollments" value={pendingCount} icon={Info} color="secondary" />
          <StatCard label="Payment Completed" value={`${overallPct}%`} icon={TrendingUp} color="primary" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="clay p-4">
            <p className="mb-3 text-sm font-semibold text-foreground">Course Fee Overview</p>
            {isLoadingStatus ? (
              <Skeleton className="h-32 w-full rounded-2xl" />
            ) : isStatusError ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Couldn&apos;t load your fee details. Please check your connection and refresh.
              </p>
            ) : rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You aren&apos;t enrolled in any course yet.
              </p>
            ) : (
              <div className="space-y-3">
                {rows.map((row) => {
                  const pct = row.finalFee ? Math.round((row.amountPaid / row.finalFee) * 100) : 0;
                  return (
                    <div key={row.enrollmentId} className="rounded-2xl border border-border p-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{row.course.name}</p>
                          <p className="text-xs text-muted-foreground">{row.batch.name}</p>
                        </div>
                        <PaymentStatusBadge status={row.paymentStatus} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total Fee: ₹{row.finalFee.toLocaleString("en-IN")}</span>
                        <span className="font-semibold text-foreground">{pct}% Completed</span>
                      </div>
                      <Progress value={pct} className="mt-1.5" />
                      <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-2">
                        <div className="rounded-xl bg-status-good/5 py-2">
                          <p className="text-xs font-bold text-status-good">₹{row.amountPaid.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-muted-foreground">Paid</p>
                        </div>
                        <div className="rounded-xl bg-accent/5 py-2">
                          <p className="text-xs font-bold text-accent">₹{row.amountDue.toLocaleString("en-IN")}</p>
                          <p className="text-[10px] text-muted-foreground">Remaining</p>
                        </div>
                      </div>
                      {row.paymentStatus === "REJECTED" && row.lastRejection && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/5 px-3 py-2 text-xs text-destructive">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            Your last payment could not be verified. Reason: {row.lastRejection.reason}. Please
                            submit a valid payment screenshot again.
                          </span>
                        </div>
                      )}
                      {row.paymentStatus === "PAYMENT_UNDER_REVIEW" && row.pendingRequest && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          ₹{row.pendingRequest.amount.toLocaleString("en-IN")} submitted on{" "}
                          {new Date(row.pendingRequest.submittedAt).toLocaleDateString()} — waiting for Admin
                          verification.
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <FeeAction row={row} onPay={() => setPayingEnrollmentId(row.enrollmentId)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="clay p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Payment History</p>
              {payments && payments.length > 0 && (
                <span className="text-xs text-muted-foreground">{payments.length} receipts</span>
              )}
            </div>
            {isLoadingPayments ? (
              <Skeleton className="h-24 w-full" />
            ) : !payments || payments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 font-medium">Date</th>
                      <th className="py-2 font-medium">Amount</th>
                      <th className="py-2 font-medium">Method</th>
                      <th className="py-2 font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id} className="border-b border-border last:border-0">
                        <td className="py-2 text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="py-2 font-medium text-foreground">₹{p.amount.toLocaleString("en-IN")}</td>
                        <td className="py-2 text-muted-foreground">{p.paymentMethod.replace("_", " ")}</td>
                        <td className="py-2">
                          <ReceiptDownloadButton payment={p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="clay p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Payment Submissions</p>
              {paymentRequests && paymentRequests.length > 0 && (
                <span className="text-xs text-muted-foreground">{paymentRequests.length} submitted</span>
              )}
            </div>
            {isLoadingRequests ? (
              <Skeleton className="h-24 w-full" />
            ) : !paymentRequests || paymentRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No payment screenshots submitted yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 font-medium">Submitted</th>
                      <th className="py-2 font-medium">Course</th>
                      <th className="py-2 font-medium">Amount</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRequests.map((r) => (
                      <tr key={r._id} className="border-b border-border align-top last:border-0">
                        <td className="py-2 text-muted-foreground">{new Date(r.submittedAt).toLocaleDateString()}</td>
                        <td className="py-2 text-foreground">{r.courseName}</td>
                        <td className="py-2 font-medium text-foreground">
                          ₹{(r.approvedAmount ?? r.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2">
                          <PaymentStatusBadge status={r.status} variant="request" />
                          {r.status === "REJECTED" && r.rejectionReason && (
                            <p className="mt-1 max-w-56 text-[11px] text-muted-foreground">{r.rejectionReason}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="clay p-4">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <HeadphonesIcon className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm font-semibold text-foreground">Need Help with Payment?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reach out to the administration office for fee-related queries or payment plans.
            </p>
          </div>

          <div className="clay p-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4 text-secondary" />
              Important Notes
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• Please complete your payments on time to avoid late fees.</li>
              <li>• Keep your payment receipts for your records.</li>
              <li>• For any issues, contact the administration office.</li>
            </ul>
          </div>
        </div>
      </div>

      <PayFeeDialog row={payingRow} onOpenChange={(open) => !open && setPayingEnrollmentId(null)} />
    </div>
  );
}
