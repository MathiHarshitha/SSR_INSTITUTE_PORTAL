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
import { moduleFormSchema, ModuleFormValues } from "@/schemas/module.schema";
import { AdminModule, ModuleFormInput } from "@/types/module";

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module?: AdminModule | null;
  isSubmitting?: boolean;
  onSubmit: (input: ModuleFormInput) => void;
}

const EMPTY: ModuleFormValues = { name: "", description: "", estimatedDuration: "" };

export function ModuleFormDialog({ open, onOpenChange, module, isSubmitting, onSubmit }: ModuleFormDialogProps) {
  const form = useForm<ModuleFormValues>({ resolver: zodResolver(moduleFormSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;
    form.reset(
      module
        ? {
            name: module.name,
            description: module.description ?? "",
            estimatedDuration: module.estimatedDuration ?? "",
          }
        : EMPTY
    );
  }, [open, module, form]);

  function handleSubmit(values: ModuleFormValues) {
    onSubmit({
      name: values.name,
      description: values.description || undefined,
      estimatedDuration: values.estimatedDuration || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{module ? "Edit module" : "Add module"}</DialogTitle>
          <DialogDescription>Modules group related lessons within this course.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module name</FormLabel>
                  <FormControl>
                    <Input placeholder="JavaScript Fundamentals" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated duration</FormLabel>
                  <FormControl>
                    <Input placeholder="2 weeks" {...field} />
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
                {isSubmitting ? "Saving..." : module ? "Save changes" : "Add module"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
