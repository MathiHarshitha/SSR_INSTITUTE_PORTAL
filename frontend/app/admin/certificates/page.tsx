"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Ban } from "lucide-react";
import { cn } from "cn";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCertificates, useRevokeCertificate } from "@/hooks/useCertificates";
import { IssueCertificateDialog } from "@/components/admin/issue-certificate-dialog";
import { AdminCertificate, CertificateStatus } from "@/types/certificate";

const STATUS_OPTIONS: CertificateStatus[] = ["ISSUED", "REVOKED"];

function statusBadgeClassName(status: CertificateStatus): string {
  return status === "ISSUED"
    ? "bg-status-good/10 text-status-good"
    : "bg-status-critical/10 text-status-critical";
}

export default function AdminCertificatesPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<CertificateStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [issueOpen, setIssueOpen] = useState(false);
  const [revoking, setRevoking] = useState<AdminCertificate | null>(null);

  const query = useMemo(
    () => ({ page, limit, search: search || undefined, status: status !== "ALL" ? status : undefined }),
    [page, search, status]
  );

  const { data, isLoading, isError, isFetching } = useCertificates(query);
  const revokeMutation = useRevokeCertificate();

  const certificates = data?.certificates ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Certificates</h2>
          <p className="text-sm text-muted-foreground">
            Issue, revoke, and track certificates for eligible students.
          </p>
        </div>
        <Button onClick={() => setIssueOpen(true)}>
          <Plus className="h-4 w-4" />
          Issue certificate
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name or certificate number..."
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
                setStatus(v as CertificateStatus | "ALL");
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
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isError ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Failed to load certificates.</p>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No certificates issued yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert._id} className={cn(isFetching && "opacity-60")}>
                      <TableCell className="font-mono text-xs">{cert.certificateNumber}</TableCell>
                      <TableCell className="font-medium">{cert.studentName}</TableCell>
                      <TableCell className="text-muted-foreground">{cert.courseName}</TableCell>
                      <TableCell className="text-muted-foreground">{cert.batchName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(cert.status)}>{cert.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {cert.status === "ISSUED" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem variant="destructive" onClick={() => setRevoking(cert)}>
                                <Ban className="h-4 w-4" />
                                Revoke
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !isError && certificates.length > 0 && (
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

      <IssueCertificateDialog open={issueOpen} onOpenChange={setIssueOpen} />

      <ConfirmDialog
        open={!!revoking}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Revoke this certificate?"
        description={`Certificate ${revoking?.certificateNumber} will be marked revoked. It still appears on the public verification page, but as revoked.`}
        confirmLabel="Revoke"
        destructive
        showReasonInput
        reasonLabel="Reason (optional)"
        isLoading={revokeMutation.isPending}
        onConfirm={(reason) => {
          if (revoking) {
            revokeMutation.mutate({ id: revoking._id, reason }, { onSuccess: () => setRevoking(null) });
          }
        }}
      />
    </div>
  );
}
