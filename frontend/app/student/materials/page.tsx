"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Video,
  Image as ImageIcon,
  Link2,
  Files,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMaterials } from "@/hooks/useMaterials";
import { MaterialType } from "@/types/material";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { PageBanner } from "@/components/shared/page-banner";

const TYPE_META: Record<MaterialType, { label: string; icon: typeof FileText; chip: string }> = {
  DOCUMENT: { label: "Documents", icon: FileText, chip: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" },
  VIDEO: { label: "Videos", icon: Video, chip: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
  IMAGE: { label: "Images", icon: ImageIcon, chip: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" },
  LINK: { label: "Links", icon: Link2, chip: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" },
  OTHER: { label: "Other", icon: Files, chip: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" },
};

const TYPE_ORDER: MaterialType[] = ["DOCUMENT", "VIDEO", "IMAGE", "LINK", "OTHER"];

export default function StudentMaterialsPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [typeFilter, setTypeFilter] = useState<MaterialType | "ALL">("ALL");

  const query = useMemo(() => ({ page: 1, limit: 100, search: search || undefined }), [search]);
  const { data, isLoading, isError } = useMaterials(query);
  const materials = data?.materials ?? [];

  const counts = useMemo(() => {
    const c: Record<MaterialType, number> = { DOCUMENT: 0, VIDEO: 0, IMAGE: 0, LINK: 0, OTHER: 0 };
    materials.forEach((m) => c[m.fileType]++);
    return c;
  }, [materials]);

  const filtered = typeFilter === "ALL" ? materials : materials.filter((m) => m.fileType === typeFilter);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Your Learning Resources"
        eyebrowIcon={Sparkles}
        title="Materials"
        titleAccent=""
        subtitle="Notes, recordings, and resources to help you learn better."
        quote="Good materials create great minds."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {TYPE_ORDER.map((t) => (
          <button key={t} type="button" onClick={() => setTypeFilter(typeFilter === t ? "ALL" : t)}>
            <StatCard label={TYPE_META[t].label} value={counts[t]} icon={TYPE_META[t].icon} color="primary" />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search materials, topics, files..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {typeFilter !== "ALL" && (
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear filter: {TYPE_META[typeFilter].label} ✕
          </button>
        )}
      </div>

      <div className="clay p-4">
        {isError ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Failed to load materials.</p>
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {materials.length === 0 ? "No materials shared yet." : "No materials match this filter."}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((material) => {
              const meta = TYPE_META[material.fileType];
              const Icon = meta.icon;
              return (
                <a
                  key={material._id}
                  href={material.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col rounded-2xl border border-border p-3 transition-colors hover:border-secondary/40 hover:bg-muted/40"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", meta.chip)}>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">{material.title}</p>
                  {material.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{material.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                    <span>{material.module?.name ?? meta.label}</span>
                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <PageBanner
        icon={Files}
        title="Download. Learn. Practice. Grow."
        subtitle="All the resources shared by your trainers, in one place."
      />
    </div>
  );
}
