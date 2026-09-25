"use client";

import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl, paymentApprovedMessage, toWhatsAppNumber } from "@/lib/whatsapp";

interface SendWhatsAppButtonProps {
  /** The student as returned by the admin payment APIs — `phone` is their registered number. */
  student: { name?: string; phone?: string } | string | null | undefined;
  fallbackName?: string;
}

/**
 * Opens WhatsApp (Web or app) in a new tab with the payment-approved message pre-filled for the
 * student's registered number. A communication shortcut only: it makes no API call and changes
 * no payment data, and the admin still has to press Send inside WhatsApp.
 */
export function SendWhatsAppButton({ student, fallbackName }: SendWhatsAppButtonProps) {
  const info = typeof student === "object" && student ? student : null;

  function handleClick() {
    if (!info?.phone) {
      toast.error("Student WhatsApp number is not available.");
      return;
    }
    const number = toWhatsAppNumber(info.phone);
    if (!number) {
      toast.error("Please update the student's registered mobile number before sending WhatsApp.");
      return;
    }
    const url = buildWhatsAppUrl(number, paymentApprovedMessage(info.name ?? fallbackName));
    window.open(url, "_blank", "noopener,noreferrer");
    toast.info("WhatsApp opened with the payment confirmation message.", {
      description: "Review it and press Send in WhatsApp.",
    });
  }

  return (
    <Button size="sm" variant="ghost" className="text-status-good" onClick={handleClick}>
      <MessageCircle />
      Send WhatsApp
    </Button>
  );
}
