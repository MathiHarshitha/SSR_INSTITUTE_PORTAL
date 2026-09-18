import { GraduationCap, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-sm font-semibold text-foreground">SSR Portal</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Certificate Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
            <ShieldAlert className="h-4 w-4 shrink-0 text-accent" />
            <span>
              Verification for ID <span className="font-mono text-foreground">{certificateId}</span>{" "}
              will be available once the certificate module ships (Phase 9). No private student
              information is exposed on this page — only name, course, batch, issue date and status.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
