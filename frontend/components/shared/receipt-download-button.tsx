"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { downloadPaymentReceipt } from "@/lib/receipt";
import { PaymentRecord } from "@/types/fee";

export function ReceiptDownloadButton({
  payment,
  label,
  className,
}: {
  payment: PaymentRecord;
  label?: string;
  className?: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleClick() {
    setIsGenerating(true);
    try {
      await downloadPaymentReceipt(payment);
    } catch {
      toast.error("Couldn't generate the receipt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isGenerating}
      title={`Download receipt ${payment.receiptNumber}`}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-secondary hover:underline disabled:opacity-60",
        className
      )}
    >
      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
      {label ?? payment.receiptNumber}
    </button>
  );
}
