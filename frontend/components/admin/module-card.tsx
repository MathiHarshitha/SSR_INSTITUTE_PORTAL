"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TopicFormDialog } from "@/components/admin/topic-form-dialog";
import { TopicCard } from "@/components/admin/topic-card";
import {
  useCreateTopic,
  useDeleteTopic,
  useReorderTopics,
  useTopics,
  useUpdateTopic,
} from "@/hooks/useTopics";
import { AdminModule, AdminTopic, TopicFormInput } from "@/types/module";

interface ModuleCardProps {
  courseId: string;
  module: AdminModule;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ModuleCard({
  courseId,
  module,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ModuleCardProps) {
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<AdminTopic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<AdminTopic | null>(null);

  const { data: topics, isLoading } = useTopics(module._id);
  const createTopic = useCreateTopic(module._id);
  const updateTopic = useUpdateTopic(module._id);
  const deleteTopic = useDeleteTopic(module._id, courseId);
  const reorderTopics = useReorderTopics(module._id);

  function openAddTopic() {
    setEditingTopic(null);
    setTopicDialogOpen(true);
  }

  function openEditTopic(topic: AdminTopic) {
    setEditingTopic(topic);
    setTopicDialogOpen(true);
  }

  function handleTopicSubmit(input: TopicFormInput) {
    if (editingTopic) {
      updateTopic.mutate({ id: editingTopic._id, input }, { onSuccess: () => setTopicDialogOpen(false) });
    } else {
      createTopic.mutate(input, { onSuccess: () => setTopicDialogOpen(false) });
    }
  }

  function moveTopic(index: number, direction: -1 | 1) {
    if (!topics) return;
    const next = [...topics];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    reorderTopics.mutate(next.map((t) => t._id));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{module.name}</CardTitle>
          {module.estimatedDuration && (
            <p className="text-xs text-muted-foreground">{module.estimatedDuration}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" disabled={isFirst} onClick={onMoveUp} aria-label="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={isLast} onClick={onMoveDown} aria-label="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit module">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete module"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : !topics || topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">No topics yet.</p>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <TopicCard
                key={topic._id}
                moduleId={module._id}
                topic={topic}
                isFirst={index === 0}
                isLast={index === topics.length - 1}
                onMoveUp={() => moveTopic(index, -1)}
                onMoveDown={() => moveTopic(index, 1)}
                onEdit={() => openEditTopic(topic)}
                onDelete={() => setDeletingTopic(topic)}
              />
            ))}
          </div>
        )}

        <Button variant="outline" size="sm" onClick={openAddTopic}>
          <Plus className="h-3.5 w-3.5" />
          Add topic
        </Button>
      </CardContent>

      <TopicFormDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
        topic={editingTopic}
        isSubmitting={createTopic.isPending || updateTopic.isPending}
        onSubmit={handleTopicSubmit}
      />

      <ConfirmDialog
        open={!!deletingTopic}
        onOpenChange={(open) => !open && setDeletingTopic(null)}
        title="Delete this topic?"
        description={`"${deletingTopic?.name}" and all its lessons will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteTopic.isPending}
        onConfirm={() => {
          if (deletingTopic) {
            deleteTopic.mutate(deletingTopic._id, { onSuccess: () => setDeletingTopic(null) });
          }
        }}
      />
    </Card>
  );
}
