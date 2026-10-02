"use client";

import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/auth";

/** Shown to students as a send-off when they log out. */
export const STUDENT_QUOTES: { text: string; author: string }[] = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  {
    text: "Dream is not that which you see while sleeping, it is something that does not let you sleep.",
    author: "A. P. J. Abdul Kalam",
  },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B. B. King" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
];

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  /** Index into STUDENT_QUOTES; only used for students. */
  quoteIndex: number;
  isPending: boolean;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  role,
  quoteIndex,
  isPending,
  onConfirm,
}: LogoutConfirmDialogProps) {
  const quote = role === "STUDENT" ? STUDENT_QUOTES[quoteIndex % STUDENT_QUOTES.length] : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent showCloseButton={false} className="gap-5 bg-popover! sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut className="h-5 w-5" aria-hidden />
          </span>
          <DialogTitle className="text-lg font-semibold">Log out?</DialogTitle>
          <DialogDescription>Are you sure you want to log out of SSR Portal?</DialogDescription>
        </DialogHeader>

        {quote && (
          <figure className="px-2 text-center">
            <blockquote className="text-sm italic leading-relaxed text-foreground/80">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-xs text-muted-foreground">— {quote.author}</figcaption>
          </figure>
        )}

        <DialogFooter className="-mx-4 -mb-4 border-t-0 bg-transparent sm:justify-center">
          <Button
            variant="outline"
            className="h-10 rounded-xl sm:min-w-32"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            No, stay
          </Button>
          <Button
            variant="destructive"
            className="h-10 rounded-xl sm:min-w-32"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Logging out..." : "Yes, log out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
