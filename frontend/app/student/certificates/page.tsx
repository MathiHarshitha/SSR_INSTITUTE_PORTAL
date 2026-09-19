"use client";

import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCertificates } from "@/hooks/useCertificates";
import { CertificateStatus } from "@/types/certificate";

function statusBadgeClassName(status: CertificateStatus): string {
  return status === "ISSUED"
    ? "bg-status-good/10 text-status-good"
    : "bg-status-critical/10 text-status-critical";
}

export default function StudentCertificatesPage() {
  const { data: certificates, isLoading, isError } = useMyCertificates();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Certificates</h2>
        <p className="text-sm text-muted-foreground">
          Certificates issued to you, and their public verification links.
        </p>
      </div>

      {isError ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Failed to load certificates.</p>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !certificates || certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <Award className="h-8 w-8 text-muted-foreground" />
            No certificates issued yet. Your trainer or admin will issue one once you complete a batch.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <Card key={cert._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{cert.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.batchName} · Issued {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{cert.certificateNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusBadgeClassName(cert.status)}>{cert.status}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/verify-certificate/${cert.certificateNumber}`} target="_blank" />}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Verify
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
