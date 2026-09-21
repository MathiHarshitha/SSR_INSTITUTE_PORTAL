"use client";

import { Wallet, CheckCircle2, Clock3, TrendingUp, HeadphonesIcon, Info, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useMyFeeStatus, useMyPayments } from "@/hooks/useFees";
import { FeeStatus } from "@/types/fee";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

function statusBadgeClassName(status: FeeStatus): string {
  switch (status) {
    case "PAID":
      return "bg-status-good/10 text-status-good";
    case "PARTIALLY_PAID":
      return "bg-status-serious/15 text-status-serious";
    case "PENDING":
      return "bg-status-critical/10 text-status-critical";
  }
}

export default function StudentFeesPage() {
  const { data: statusRows, isLoading: isLoadingStatus } = useMyFeeStatus();
  const { data: payments, isLoading: isLoadingPayments } = useMyPayments();

  const rows = statusRows ?? [];
  const totalPaid = rows.reduce((s, r) => s + r.amountPaid, 0);
  const totalDue = rows.reduce((s, r) => s + r.amountDue, 0);
  const totalFee = rows.reduce((s, r) => s + r.finalFee, 0);
  const overallPct = totalFee ? Math.round((totalPaid / totalFee) * 100) : 0;
  const pendingCount = rows.filter((r) => r.status !== "PAID").length;

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
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Course Fee Overview</p>
            {isLoadingStatus ? (
              <Skeleton className="h-32 w-full rounded-2xl" />
            ) : rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No fee record found.</p>
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
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", statusBadgeClassName(row.status))}>
                          {row.status.replace("_", " ")}
                        </span>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
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
                          <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
                            <Download className="h-3 w-3" />
                            {p.receiptNumber}
                          </span>
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
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <HeadphonesIcon className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm font-semibold text-foreground">Need Help with Payment?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reach out to the administration office for fee-related queries or payment plans.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
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
    </div>
  );
}
