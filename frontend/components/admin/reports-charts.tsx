"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ApplicationsByStatusRow,
  AttendanceByBatchRow,
  EnrollmentsByCourseRow,
  EnrollmentsOverTimeRow,
  FeeCollectionByBatchRow,
} from "@/types/report";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

const axisTick = { fill: "var(--muted-foreground)", fontSize: 12 };

function currency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function EnrollmentsByCourseChart({ data }: { data: EnrollmentsByCourseRow[] }) {
  const chartData = data.map((d) => ({ name: d.courseName, Enrolled: d.enrolledCount }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={axisTick} />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="Enrolled" fill="var(--series-student)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FeeCollectionChart({ data }: { data: FeeCollectionByBatchRow[] }) {
  const chartData = data.map((d) => ({ name: d.batchName, Collected: d.collected, Pending: d.pending }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={axisTick}
          tickFormatter={(v: number) => currency(v)}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={tooltipStyle}
          formatter={(value) => currency(Number(value))}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
        <Bar dataKey="Collected" fill="var(--series-student)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Pending" fill="var(--series-trainer)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceByBatchChart({ data }: { data: AttendanceByBatchRow[] }) {
  const chartData = data.map((d) => ({ name: d.batchName, "Attendance %": d.averagePercent }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          width={36}
          tick={axisTick}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={tooltipStyle}
          formatter={(value) => `${value}%`}
        />
        <Bar dataKey="Attendance %" fill="var(--series-student)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ApplicationsByStatusChart({ data }: { data: ApplicationsByStatusRow[] }) {
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ name: STATUS_LABELS[d.status] ?? d.status, Applications: d.count }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={130}
          tick={axisTick}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Bar dataKey="Applications" fill="var(--series-student)" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EnrollmentsOverTimeChart({ data }: { data: EnrollmentsOverTimeRow[] }) {
  const chartData = data.map((d) => ({ name: d.month, Enrollments: d.count }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={axisTick} />
        <Tooltip cursor={{ stroke: "var(--border)" }} contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="Enrollments"
          stroke="var(--series-student)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--series-student)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
