import { cn } from "cn";
import { FeeDisplayStatus, PaymentRequestStatus } from "@/types/fee";

type AnyPaymentStatus = FeeDisplayStatus | PaymentRequestStatus;

const STYLES: Record<AnyPaymentStatus, { label: string; className: string }> = {
  PAID: { label: "PAID", className: "bg-status-good/10 text-status-good" },
  APPROVED: { label: "APPROVED", className: "bg-status-good/10 text-status-good" },
  PENDING: { label: "PENDING", className: "bg-status-warning/10 text-status-warning" },
  PAYMENT_UNDER_REVIEW: { label: "PAYMENT UNDER REVIEW", className: "bg-secondary/10 text-secondary" },
  REJECTED: { label: "REJECTED", className: "bg-destructive/10 text-destructive" },
};

/** Fee / verification status pill. For payment *requests*, PENDING means awaiting review. */
export function PaymentStatusBadge({
  status,
  variant = "fee",
  className,
}: {
  status: AnyPaymentStatus;
  variant?: "fee" | "request";
  className?: string;
}) {
  const style =
    variant === "request" && status === "PENDING" ? STYLES.PAYMENT_UNDER_REVIEW : STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
        style.className,
        className
      )}
    >
      {variant === "request" && status === "PENDING" ? "UNDER REVIEW" : style.label}
    </span>
  );
}
