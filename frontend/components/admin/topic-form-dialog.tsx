"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { topicFormSchema, TopicFormValues } from "@/schemas/module.schema";
import { AdminTopic, TopicFormInput } from "@/types/module";

interface TopicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic?: AdminTopic | null;
  isSubmitting?: boolean;
  onSubmit: (input: TopicFormInput) => void;
}

const EMPTY: TopicFormValues = { name: "", description: "" };

export function TopicFormDialog({ open, onOpenChange, topic, isSubmitting, onSubmit }: TopicFormDialogProps) {
  const form = useForm<TopicFormValues>({ resolver: zodResolver(topicFormSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    form.reset(topic ? { name: topic.name, description: topic.description ?? "" } : EMPTY);
  }, [open, topic, form]);

  function handleSubmit(values: TopicFormValues) {
    onSubmit({ name: values.name, description: values.description || undefined });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit topic" : "Add topic"}</DialogTitle>
          <DialogDescription>Topics group related lessons within this module.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic name</FormLabel>
                  <FormControl>
                    <Input placeholder="Functions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : topic ? "Save changes" : "Add topic"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
