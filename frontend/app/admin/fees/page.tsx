"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
import { useFeeStatus, usePayments } from "@/hooks/useFees";
import { RecordPaymentDialog } from "@/components/admin/record-payment-dialog";
import { FeeStatus } from "@/types/fee";

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                    <TableCell className="font-medium">{p.student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.batch.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.paymentMethod.replace("_", " ")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.paymentDate).toLocaleDateString()}
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

export default function AdminFeesPage() {
  const [tab, setTab] = useState<"status" | "history">("status");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Fees &amp; Payments</h2>
          <p className="text-sm text-muted-foreground">
            Track fee status per student and record payments as they come in.
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
      </div>

      {tab === "status" ? <FeeStatusTab /> : <PaymentHistoryTab />}

      <RecordPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
