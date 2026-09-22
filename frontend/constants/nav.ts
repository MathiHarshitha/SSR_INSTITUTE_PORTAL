import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  Wallet,
  Briefcase,
  Award,
  BarChart3,
  Megaphone,
  ShieldCheck,
  User,
  CalendarClock,
  FileText,
  ClipboardList,
  CheckSquare,
  Video,
  ListChecks,
  GraduationCap,
  Bell,
  Search,
  FileSearch,
} from "lucide-react";
import { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Batches", href: "/admin/batches", icon: Layers },
    { label: "Fees", href: "/admin/fees", icon: Wallet },
    { label: "Placements", href: "/admin/placements", icon: Briefcase },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    { label: "Profile", href: "/admin/profile", icon: User },
  ],
  TRAINER: [
    { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
    { label: "My Batches", href: "/trainer/batches", icon: Layers },
    { label: "Curriculum", href: "/trainer/curriculum", icon: BookOpen },
    { label: "Schedule", href: "/trainer/schedule", icon: CalendarClock },
    { label: "Materials", href: "/trainer/materials", icon: FileText },
    { label: "Tasks", href: "/trainer/tasks", icon: ClipboardList },
    { label: "Submissions", href: "/trainer/submissions", icon: CheckSquare },
    { label: "Attendance", href: "/trainer/attendance", icon: ListChecks },
    { label: "Mock Interviews", href: "/trainer/interviews", icon: Video },
    { label: "Profile", href: "/trainer/profile", icon: User },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/student/courses", icon: GraduationCap },
    { label: "Search", href: "/student/search", icon: Search },
    { label: "Materials", href: "/student/materials", icon: FileText },
    { label: "Tasks", href: "/student/tasks", icon: ClipboardList },
    { label: "Attendance", href: "/student/attendance", icon: ListChecks },
    { label: "Schedule", href: "/student/schedule", icon: CalendarClock },
    { label: "Mock Interviews", href: "/student/interviews", icon: Video },
    { label: "Interview Resources", href: "/student/interview-resources", icon: FileSearch },
    { label: "Jobs", href: "/student/jobs", icon: Briefcase },
    { label: "Fees", href: "/student/fees", icon: Wallet },
    { label: "Certificates", href: "/student/certificates", icon: Award },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
};

export const NOTIFICATIONS_ICON = Bell;
