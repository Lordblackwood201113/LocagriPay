import { Badge } from "@/components/ui/badge";
import {
  STATUS_LABELS,
  STATUS_VARIANTS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_VARIANTS,
  type CollectionStatus,
  type PaymentStatus,
} from "@/lib/constants";

interface CollectionStatusBadgeProps {
  status: CollectionStatus;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = { xs: "text-[10px] px-1.5 py-0", sm: "text-xs", md: "text-sm", lg: "text-sm px-3 py-1" };

export function CollectionStatusBadge({ status, size = "sm" }: CollectionStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status] as any} className={sizeClasses[size]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "xs" | "sm" | "md" | "lg";
}

export function PaymentStatusBadge({ status, size = "sm" }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANTS[status] as any} className={sizeClasses[size]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
