"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyFeeStatus, useMyPayments } from "@/hooks/useFees";
import { FeeStatus } from "@/types/fee";

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

export default function StudentFeesPage() {
  const [tab, setTab] = useState<"status" | "history">("status");
  const { data: statusRows, isLoading: isLoadingStatus } = useMyFeeStatus();
  const { data: payments, isLoading: isLoadingPayments } = useMyPayments();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Fees</h2>
        <p className="text-sm text-muted-foreground">Your fee status and payment history.</p>
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

      <Card>
        <CardContent>
          {tab === "status" ? (
            isLoadingStatus ? (
              <Skeleton className="h-24 w-full" />
            ) : !statusRows || statusRows.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No fee record found.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Final fee</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusRows.map((row) => (
                      <TableRow key={row.enrollmentId}>
                        <TableCell className="font-medium">{row.batch.name}</TableCell>
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
            )
          ) : isLoadingPayments ? (
            <Skeleton className="h-24 w-full" />
          ) : !payments || payments.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
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
        </CardContent>
      </Card>
    </div>
  );
}
