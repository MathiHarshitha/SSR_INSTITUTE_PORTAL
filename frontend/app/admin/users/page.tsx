"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Check, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useApproveUser,
  useBlockUser,
  useReactivateUser,
  useRejectUser,
  useSuspendUser,
  useUnblockUser,
  useUser,
  useUsers,
} from "@/hooks/useUsers";
import { Role, UserStatus } from "@/types/auth";
import { AdminUserListItem } from "@/types/user";

const PRESETS = [
  { key: "all", label: "All" },
  { key: "students", label: "Students" },
  { key: "trainers", label: "Trainers" },
  { key: "pending", label: "Pending Approvals" },
  { key: "blocked", label: "Blocked" },
] as const;
type PresetKey = (typeof PRESETS)[number]["key"];

const STATUS_OPTIONS: UserStatus[] = ["PENDING", "ACTIVE", "REJECTED", "BLOCKED", "SUSPENDED"];

/**
 * Status colors come from the validated status palette (good/warning/serious/critical) —
 * reserved for state chips, always paired with the visible status text, never color alone.
 */
function statusBadgeClassName(status: UserStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-status-good/10 text-status-good";
    case "PENDING":
      return "bg-status-warning/15 text-amber-800 dark:text-status-warning";
    case "SUSPENDED":
      return "bg-status-serious/15 text-orange-800 dark:text-status-serious";
    case "BLOCKED":
      return "bg-status-critical/10 text-status-critical";
    case "REJECTED":
      return "bg-status-neutral/10 text-status-neutral";
  }
}

function presetToFilters(preset: PresetKey): { role?: Role; status?: UserStatus } {
  if (preset === "students") return { role: "STUDENT" };
  if (preset === "trainers") return { role: "TRAINER" };
  if (preset === "pending") return { status: "PENDING" };
  if (preset === "blocked") return { status: "BLOCKED" };
  return {};
}

type DialogAction = "approve" | "reject" | "block" | "unblock" | "suspend" | "reactivate";

/** The action a user's current status calls for, shown as visible buttons (never in a menu). */
function PrimaryUserActions({
  user,
  onAction,
}: {
  user: AdminUserListItem;
  onAction: (user: AdminUserListItem, action: DialogAction) => void;
}) {
  if (user.status === "PENDING") {
    return (
      <>
        <Button size="sm" onClick={() => onAction(user, "approve")}>
          <Check className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onAction(user, "reject")}>
          <X className="h-3.5 w-3.5" />
          Reject
        </Button>
      </>
    );
  }
  if (user.status === "BLOCKED") {
    return (
      <Button size="sm" variant="outline" onClick={() => onAction(user, "unblock")}>
        Unblock
      </Button>
    );
  }
  if (user.status === "SUSPENDED") {
    return (
      <Button size="sm" variant="outline" onClick={() => onAction(user, "reactivate")}>
        Reactivate
      </Button>
    );
  }
  return null;
}

function isPresetKey(value: string | null): value is PresetKey {
  return PRESETS.some((p) => p.key === value);
}

function AdminUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetParam = searchParams.get("preset");
  const viewParam = searchParams.get("view");
  const [preset, setPreset] = useState<PresetKey>(() => (isPresetKey(presetParam) ? presetParam : "all"));
  const [extraStatus, setExtraStatus] = useState<UserStatus | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [viewUserId, setViewUserId] = useState<string | null>(viewParam);
  const [actionTarget, setActionTarget] = useState<AdminUserListItem | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogAction | null>(null);

  // Deep link from a "user awaiting approval" notification (?preset=pending&view=<id>); also
  // re-applied when another such notification is clicked while already on this page.
  const linkKey = `${presetParam ?? ""}:${viewParam ?? ""}`;
  const [appliedLink, setAppliedLink] = useState(linkKey);
  if (linkKey !== appliedLink) {
    setAppliedLink(linkKey);
    if (isPresetKey(presetParam)) {
      setPreset(presetParam);
      setExtraStatus("ALL");
      setPage(1);
    }
    if (viewParam) setViewUserId(viewParam);
  }

  function openProfile(id: string) {
    setViewUserId(id);
  }

  function closeProfile() {
    setViewUserId(null);
    // Drop the deep-link params so the same notification can be opened again later.
    if (viewParam) router.replace(isPresetKey(presetParam) ? `/admin/users?preset=${presetParam}` : "/admin/users");
  }

  const presetFilters = presetToFilters(preset);
  const status = presetFilters.status ?? (extraStatus !== "ALL" ? extraStatus : undefined);

  const query = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      role: presetFilters.role,
      status,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [page, search, presetFilters.role, status]
  );

  const { data, isLoading, isError, isFetching } = useUsers(query);
  const { data: viewUser, isLoading: isLoadingViewUser, isError: isErrorViewUser } = useUser(viewUserId);

  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  const activeMutation =
    dialogAction === "approve"
      ? approveMutation
      : dialogAction === "reject"
        ? rejectMutation
        : dialogAction === "block"
          ? blockMutation
          : dialogAction === "unblock"
            ? unblockMutation
            : dialogAction === "suspend"
              ? suspendMutation
              : dialogAction === "reactivate"
                ? reactivateMutation
                : null;

  function openAction(user: AdminUserListItem, action: DialogAction) {
    setActionTarget(user);
    setDialogAction(action);
  }

  function closeAction() {
    setDialogAction(null);
    setActionTarget(null);
  }

  function confirmAction(reason?: string) {
    if (!actionTarget || !dialogAction) return;
    const variables = { id: actionTarget._id, reason };
    const mutation = activeMutation;
    mutation?.mutate(variables, { onSuccess: closeAction });
  }

  const users = data?.users ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const dialogCopy: Record<DialogAction, { title: string; description: string; confirmLabel: string; destructive?: boolean; reason?: boolean }> = {
    approve: {
      title: "Approve this user?",
      description: `${actionTarget?.name ?? "This user"} will be able to log in immediately.`,
      confirmLabel: "Approve",
    },
    reject: {
      title: "Reject this registration?",
      description: `${actionTarget?.name ?? "This user"} will not be able to log in. You may record a reason.`,
      confirmLabel: "Reject",
      destructive: true,
      reason: true,
    },
    block: {
      title: "Block this user?",
      description: `${actionTarget?.name ?? "This user"} will immediately lose access to their account.`,
      confirmLabel: "Block",
      destructive: true,
    },
    unblock: {
      title: "Unblock this user?",
      description: `${actionTarget?.name ?? "This user"} will regain access to their account.`,
      confirmLabel: "Unblock",
    },
    suspend: {
      title: "Suspend this user?",
      description: `${actionTarget?.name ?? "This user"} will temporarily lose access. You may record a reason.`,
      confirmLabel: "Suspend",
      destructive: true,
      reason: true,
    },
    reactivate: {
      title: "Reactivate this user?",
      description: `${actionTarget?.name ?? "This user"} will regain access to their account.`,
      confirmLabel: "Reactivate",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">User Management</h2>
        <p className="text-sm text-muted-foreground">
          Approve, reject, block, and manage student and trainer accounts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            size="sm"
            variant={preset === p.key ? "secondary" : "ghost"}
            onClick={() => {
              setPreset(p.key);
              setExtraStatus("ALL");
              setPage(1);
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={extraStatus}
              onValueChange={(value) => {
                setExtraStatus(value as UserStatus | "ALL");
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
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">Failed to load users.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No users found for the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} className={cn(isFetching && "opacity-60")}>
                      <TableCell className="font-medium">
                        {user.name} {user.isTestAccount && (
                        <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" title="Test account — excluded from counts and fee totals">
                          TEST
                        </span>
                      )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>{user.email}</div>
                        <div className="text-xs">{user.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadgeClassName(user.status)}>{user.status}</Badge>
                        {user.status === "PENDING" && !user.isEmailVerified && (
                          <p className="mt-1 text-xs text-muted-foreground">Email not verified</p>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <PrimaryUserActions user={user} onAction={openAction} />
                          <Button variant="ghost" size="sm" onClick={() => openProfile(user._id)}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          {user.status === "ACTIVE" ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                aria-label="More actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => openAction(user, "block")}
                                >
                                  Block
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => openAction(user, "suspend")}
                                >
                                  Suspend
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            // Keeps the button column aligned across rows.
                            <span className="inline-block h-8 w-8" aria-hidden />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && !isError && users.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewUserId} onOpenChange={(open) => !open && closeProfile()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User profile</DialogTitle>
            <DialogDescription>Full registration details.</DialogDescription>
          </DialogHeader>
          {isLoadingViewUser ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : viewUser ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground">Name</span>
                <span className="col-span-2 min-w-0 break-words font-medium">{viewUser.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground">Email</span>
                <span className="col-span-2 min-w-0 break-all">{viewUser.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground">Phone</span>
                <span className="col-span-2 min-w-0 break-words">{viewUser.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground">Role</span>
                <span className="col-span-2">{viewUser.role}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground">Status</span>
                <span className="col-span-2">
                  <Badge className={statusBadgeClassName(viewUser.status)}>{viewUser.status}</Badge>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-muted-foreground">Registered</span>
                <span className="col-span-2">{new Date(viewUser.createdAt).toLocaleString()}</span>
              </div>
              {viewUser.rejectionReason && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="col-span-2">{viewUser.rejectionReason}</span>
                </div>
              )}
              {viewUser.profile && Object.keys(viewUser.profile).length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="mb-2 font-medium text-foreground">Profile details</p>
                  <div className="space-y-1.5">
                    {Object.entries(viewUser.profile)
                      .filter(([key, value]) => !["_id", "user", "__v", "createdAt", "updatedAt"].includes(key) && value)
                      .map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-1">
                          <span className="capitalize text-muted-foreground">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="col-span-2 break-words">
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : isErrorViewUser ? (
            <p className="text-sm text-muted-foreground">Failed to load this user.</p>
          ) : null}

          {viewUser?.status === "PENDING" && (
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  closeProfile();
                  openAction(viewUser, "reject");
                }}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  closeProfile();
                  openAction(viewUser, "approve");
                }}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {dialogAction && (
        <ConfirmDialog
          open={!!dialogAction}
          onOpenChange={(open) => !open && closeAction()}
          title={dialogCopy[dialogAction].title}
          description={dialogCopy[dialogAction].description}
          confirmLabel={dialogCopy[dialogAction].confirmLabel}
          destructive={dialogCopy[dialogAction].destructive}
          showReasonInput={dialogCopy[dialogAction].reason}
          isLoading={activeMutation?.isPending}
          onConfirm={confirmAction}
        />
      )}
    </div>
  );
}

// useSearchParams (for the deep link from approval notifications) needs a Suspense boundary.
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdminUsersContent />
    </Suspense>
  );
}
