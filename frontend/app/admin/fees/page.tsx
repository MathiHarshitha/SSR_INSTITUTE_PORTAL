"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFeeStatus, usePaymentRequests, usePayments } from "@/hooks/useFees";
import { RecordPaymentDialog } from "@/components/admin/record-payment-dialog";
import { PaymentRequestDialog } from "@/components/admin/payment-request-dialog";
import { PaymentQrSettings } from "@/components/admin/payment-qr-settings";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { ReceiptDownloadButton } from "@/components/shared/receipt-download-button";
import { SendWhatsAppButton } from "@/components/admin/send-whatsapp-button";
import { FeeStatus, PaymentRequestStatus } from "@/types/fee";

const STATUS_OPTIONS: FeeStatus[] = ["PENDING", "PARTIALLY_PAID", "PAID"];

function statusBadgeClassName(status: FeeStatus): string {
  switch (status) {
    case "PAID":
      return "bg-status-good/10 text-status-good";
    case "PARTIALLY_PAID":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "PENDING":
      return "bg-status-critical/10 text-status-critical";
  }
}

function FeeStatusTab() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<FeeStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const query = useMemo(
    () => ({ page, limit, search: search || undefined, status: status !== "ALL" ? status : undefined }),
    [page, search, status]
  );

  const { data, isLoading, isError } = useFeeStatus(query);
  const rows = data?.rows ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as FeeStatus | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Failed to load fee status.</p>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No enrollments found for the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Final fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.enrollmentId}>
                    <TableCell className="font-medium">{row.student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.batch.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{row.finalFee.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{row.amountPaid.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{row.amountDue.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadgeClassName(row.status)}>
                        {row.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !isError && rows.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentHistoryTab() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const query = useMemo(() => ({ page, limit }), [page]);
  const { data, isLoading, isError } = usePayments(query);
  const payments = data?.payments ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <Card>
      <CardContent className="space-y-4">
        {isError ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Failed to load payments.</p>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Every row here is a recorded (approved) Payment — pending/rejected screenshot
                    submissions never reach this ledger. */}
                {payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="text-xs">
                      <ReceiptDownloadButton payment={p} />
                    </TableCell>
                    <TableCell className="font-medium">{p.student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.batch.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.paymentMethod.replace("_", " ")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <SendWhatsAppButton student={p.student} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !isError && payments.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const REQUEST_STATUS_OPTIONS: PaymentRequestStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function inr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function PaymentVerificationTab() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<PaymentRequestStatus | "ALL">("PENDING");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<{ id: string; mode: "view" | "approve" | "reject" } | null>(null);
  const limit = 10;

  const query = useMemo(
    () => ({ page, limit, search: search || undefined, status: status !== "ALL" ? status : undefined }),
    [page, search, status]
  );
  const { data, isLoading, isError } = usePaymentRequests(query);
  const requests = data?.requests ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student or course..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as PaymentRequestStatus | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {REQUEST_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "PENDING" ? "Pending review" : s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Failed to load payment requests.</p>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {status === "PENDING" ? "No payments are waiting for verification." : "No payment requests found."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Total fee</TableHead>
                  <TableHead>Prev. paid</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => {
                  const student = typeof r.student === "object" ? r.student : null;
                  return (
                    <TableRow key={r._id}>
                      <TableCell>
                        <p className="font-medium">{r.studentName}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {student?._id ?? String(r.student)}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.courseName}</TableCell>
                      <TableCell className="text-muted-foreground">{inr(r.totalFee)}</TableCell>
                      <TableCell className="text-muted-foreground">{inr(r.previousPaidAmount)}</TableCell>
                      <TableCell className="font-medium">{inr(r.approvedAmount ?? r.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {inr(r.remainingAfterApproval ?? Math.max(0, r.amountDueAtSubmission - r.amount))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={r.status} variant="request" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setOpen({ id: r._id, mode: "view" })}>
                            <Eye />
                            View
                          </Button>
                          {r.status === "APPROVED" && (
                            <SendWhatsAppButton student={r.student} fallbackName={r.studentName} />
                          )}
                          {r.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="ghost" className="text-status-good" onClick={() => setOpen({ id: r._id, mode: "approve" })}>
                                <Check />
                                Approve
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setOpen({ id: r._id, mode: "reject" })}>
                                <X />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <PaymentRequestDialog
        key={open ? `${open.id}:${open.mode}` : "closed"}
        requestId={open?.id ?? null}
        initialMode={open?.mode}
        onOpenChange={(next) => !next && setOpen(null)}
      />
    </Card>
  );
}

type FeesTab = "status" | "history" | "verification" | "qr";
const FEES_TABS: FeesTab[] = ["status", "history", "verification", "qr"];

function AdminFeesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as FeesTab | null;
  const tab: FeesTab = tabParam && FEES_TABS.includes(tabParam) ? tabParam : "status";
  const setTab = (next: FeesTab) => router.replace(next === "status" ? "/admin/fees" : `/admin/fees?tab=${next}`);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: pendingData } = usePaymentRequests({ page: 1, limit: 1, status: "PENDING" });
  const pendingCount = pendingData?.meta.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Fees &amp; Payments</h2>
          <p className="text-sm text-muted-foreground">
            Track fee status per student, verify submitted payment screenshots, and record payments.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Record payment
        </Button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={tab === "status" ? "secondary" : "ghost"} onClick={() => setTab("status")}>
          Fee Status
        </Button>
        <Button
          size="sm"
          variant={tab === "history" ? "secondary" : "ghost"}
          onClick={() => setTab("history")}
        >
          Payment History
        </Button>
        <Button
          size="sm"
          variant={tab === "verification" ? "secondary" : "ghost"}
          onClick={() => setTab("verification")}
        >
          Payment Verification
          {pendingCount > 0 && (
            <Badge className="ml-1 h-4 min-w-4 justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
              {pendingCount > 99 ? "99+" : pendingCount}
            </Badge>
          )}
        </Button>
        <Button size="sm" variant={tab === "qr" ? "secondary" : "ghost"} onClick={() => setTab("qr")}>
          Payment QR
        </Button>
      </div>

      {tab === "status" && <FeeStatusTab />}
      {tab === "history" && <PaymentHistoryTab />}
      {tab === "verification" && <PaymentVerificationTab />}
      {tab === "qr" && <PaymentQrSettings />}

      <RecordPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

// useSearchParams (for the ?tab= deep link from payment notifications) needs a Suspense boundary.
export default function AdminFeesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdminFeesContent />
    </Suspense>
  );
}
