"use client";

import {
  Award,
  Briefcase,
  CalendarCheck,
  Download,
  GraduationCap,
  IndianRupee,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportsOverview } from "@/hooks/useReports";
import { downloadCsv } from "@/lib/csv";
import { StatCard } from "@/components/shared/stat-card";
import {
  ApplicationsByStatusChart,
  AttendanceByBatchChart,
  EnrollmentsByCourseChart,
  EnrollmentsOverTimeChart,
  FeeCollectionChart,
} from "@/components/admin/reports-charts";

function ChartCard({
  title,
  description,
  onExport,
  children,
}: {
  title: string;
  description?: string;
  onExport?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function AdminReportsPage() {
  const { data, isLoading, isError } = useReportsOverview();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Enrollment, attendance, fee collection, and placement analytics across the institute.
        </p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Failed to load reports.
          </CardContent>
        </Card>
      ) : isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-14" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Students"
              value={data.summary.totalStudents}
              icon={GraduationCap}
              color="primary"
            />
            <StatCard label="Active Trainers" value={data.summary.totalTrainers} icon={Users} color="secondary" />
            <StatCard
              label="Revenue Collected"
              value={`₹${data.summary.revenueCollectedTotal.toLocaleString("en-IN")}`}
              icon={Wallet}
              color="green"
            />
            <StatCard
              label="Revenue Pending"
              value={`₹${data.summary.totalRevenuePending.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              color="critical"
            />
            <StatCard
              label="Overall Attendance"
              value={`${data.summary.overallAttendance}%`}
              icon={CalendarCheck}
              color="accent"
            />
            <StatCard
              label="Certificates Issued"
              value={data.summary.totalCertificatesIssued}
              icon={Award}
              color="violet"
            />
            <StatCard
              label="Job Applications"
              value={data.summary.totalApplications}
              icon={Briefcase}
              color="secondary"
            />
            <StatCard
              label="Placement Selection Rate"
              value={`${data.summary.placementSelectionRate}%`}
              icon={Briefcase}
              color="primary"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Enrollments by course"
              onExport={() =>
                downloadCsv(
                  "enrollments-by-course.csv",
                  data.enrollmentsByCourse.map((r) => ({
                    course: r.courseName,
                    enrolled: r.enrolledCount,
                  }))
                )
              }
            >
              {data.enrollmentsByCourse.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No enrollments yet.</p>
              ) : (
                <EnrollmentsByCourseChart data={data.enrollmentsByCourse} />
              )}
            </ChartCard>

            <ChartCard
              title="Fee collection by batch"
              description="Collected vs. pending, computed live from payments and enrollment discounts."
              onExport={() =>
                downloadCsv(
                  "fee-collection-by-batch.csv",
                  data.feeCollectionByBatch.map((r) => ({
                    batch: r.batchName,
                    collected: r.collected,
                    pending: r.pending,
                  }))
                )
              }
            >
              {data.feeCollectionByBatch.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No fee records yet.</p>
              ) : (
                <FeeCollectionChart data={data.feeCollectionByBatch} />
              )}
            </ChartCard>

            <ChartCard
              title="Attendance by batch"
              onExport={() =>
                downloadCsv(
                  "attendance-by-batch.csv",
                  data.attendanceByBatch.map((r) => ({
                    batch: r.batchName,
                    averagePercent: r.averagePercent,
                  }))
                )
              }
            >
              {data.attendanceByBatch.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No attendance recorded yet.
                </p>
              ) : (
                <AttendanceByBatchChart data={data.attendanceByBatch} />
              )}
            </ChartCard>

            <ChartCard
              title="Applications by status"
              onExport={() =>
                downloadCsv(
                  "applications-by-status.csv",
                  data.applicationsByStatus.map((r) => ({ status: r.status, count: r.count }))
                )
              }
            >
              {data.applicationsByStatus.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No applications yet.</p>
              ) : (
                <ApplicationsByStatusChart data={data.applicationsByStatus} />
              )}
            </ChartCard>

            <ChartCard
              title="Enrollments over time"
              description="Monthly, last 12 months with data."
              onExport={() =>
                downloadCsv(
                  "enrollments-over-time.csv",
                  data.enrollmentsOverTime.map((r) => ({ month: r.month, count: r.count }))
                )
              }
            >
              {data.enrollmentsOverTime.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No enrollments yet.</p>
              ) : (
                <EnrollmentsOverTimeChart data={data.enrollmentsOverTime} />
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
