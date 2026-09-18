"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RoleStatCounts } from "@/types/user";

interface UserStatusChartProps {
  students: RoleStatCounts;
  trainers: RoleStatCounts;
}

const STATUS_ORDER: { key: keyof RoleStatCounts; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "suspended", label: "Suspended" },
  { key: "blocked", label: "Blocked" },
  { key: "rejected", label: "Rejected" },
];

export function UserStatusChart({ students, trainers }: UserStatusChartProps) {
  const data = STATUS_ORDER.map(({ key, label }) => ({
    status: label,
    Students: students[key],
    Trainers: trainers[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="status"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />
        <Bar dataKey="Students" fill="var(--series-student)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Trainers" fill="var(--series-trainer)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
