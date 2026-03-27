import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { ShieldCheck, Phone, Wallet } from "lucide-react";

export interface PaymentToVerify {
  _id: string;
  beneficiaryName: string;
  operator: MobileMoneyOperator;
  mobileMoneyNumber: string;
  amount: number;
  supplierType?: "individual" | "cooperative";
  payRepresentative?: boolean;
}

interface PaymentVerificationDialogProps {
  payment: PaymentToVerify | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentId: string) => void;
  loading?: boolean;
}

export function PaymentVerificationDialog({
  payment,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: PaymentVerificationDialogProps) {
  const [checks, setChecks] = useState<boolean[]>([]);

  const isRepresentative = payment?.supplierType === "cooperative" && payment?.payRepresentative === true;

  // Build checklist items based on payment type
  const checklistItems = payment ? getChecklistItems(payment, isRepresentative) : [];

  // Reset checks when dialog opens or payment changes
  useEffect(() => {
    if (open) {
      setChecks(new Array(checklistItems.length).fill(false));
    }
  }, [open, payment?._id, checklistItems.length]);

  const allChecked = checks.length > 0 && checks.every(Boolean);

  const toggleCheck = (index: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[hsl(var(--warning))]" />
            Vérification avant paiement
          </DialogTitle>
        </DialogHeader>

        {/* Beneficiary info */}
        <div className="rounded-sm border bg-[hsl(var(--muted))] p-3 sm:p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-base">{payment.beneficiaryName}</span>
            {isRepresentative && <Badge variant="warning">Représentant coopérative</Badge>}
            {payment.supplierType === "individual" && <Badge variant="outline">Producteur individuel</Badge>}
            {payment.supplierType === "cooperative" && !payment.payRepresentative && <Badge variant="outline">Membre coopérative</Badge>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span>{OPERATOR_LABELS[payment.operator]} — {payment.mobileMoneyNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="font-bold">{formatCurrency(payment.amount)}</span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Checklist obligatoire
          </p>
          {checklistItems.map((item, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-3 rounded-sm border cursor-pointer hover:bg-[hsl(var(--muted))]/50 transition-colors"
            >
              <Checkbox
                checked={checks[index] ?? false}
                onCheckedChange={() => toggleCheck(index)}
                className="mt-0.5"
              />
              <span className="text-sm leading-relaxed">{item}</span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={() => onConfirm(payment._id)}
            disabled={!allChecked || loading}
          >
            {loading && <Spinner size="sm" />}
            Initier le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getChecklistItems(payment: PaymentToVerify, isRepresentative: boolean): string[] {
  const name = payment.beneficiaryName;
  const operator = OPERATOR_LABELS[payment.operator];
  const number = payment.mobileMoneyNumber;
  const amount = formatCurrency(payment.amount);

  if (isRepresentative) {
    return [
      `J'ai appelé le représentant ${name} pour confirmer son identité`,
      `J'ai vérifié que le numéro ${operator} ${number} appartient bien à ${name}`,
      `J'ai appelé au moins 2 membres de la coopérative pour confirmer qu'ils savent que ${name} reçoit la totalité du paiement`,
      `J'ai confirmé le montant total de ${amount} avec le représentant`,
    ];
  }

  return [
    `J'ai appelé ${name} pour confirmer son identité`,
    `J'ai vérifié que le numéro ${operator} ${number} appartient bien à ${name}`,
    `J'ai confirmé le montant de ${amount} avec le bénéficiaire`,
  ];
}
