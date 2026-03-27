import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { PaymentStatusBadge } from "@/components/shared/status-badge";
import {
  OPERATOR_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  type PaymentStatus,
  type MobileMoneyOperator,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExportPaymentsButton } from "@/components/shared/export-button";
import { PaymentVerificationDialog, type PaymentToVerify } from "@/components/shared/payment-verification-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface PaymentRow {
  _id: string;
  beneficiaryName: string;
  operator: MobileMoneyOperator;
  mobileMoneyNumber: string;
  amount: number;
  status: PaymentStatus;
  supplierType?: "individual" | "cooperative";
  payRepresentative?: boolean;
  createdAt: number;
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const payments = useQuery(
    api.queries.payments.listByStatus,
    statusFilter ? { status: statusFilter as any } : {},
  );
  const updateStatus = useMutation(api.mutations.payments.updateStatus);

  const [loading, setLoading] = useState(false);
  const [verifyPayment, setVerifyPayment] = useState<PaymentToVerify | null>(null);

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      await updateStatus({ paymentId: paymentId as any, newStatus: newStatus as any });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleInitiateWithVerification = (payment: PaymentRow) => {
    setVerifyPayment(payment);
  };

  const handleVerifiedInitiate = async (paymentId: string) => {
    setLoading(true);
    try {
      await updateStatus({ paymentId: paymentId as any, newStatus: "initie" as any });
      setVerifyPayment(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<PaymentRow, unknown>[] = [
    {
      accessorKey: "beneficiaryName",
      header: "Bénéficiaire",
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{getValue() as string}</span>
          {row.original.supplierType === "cooperative" && row.original.payRepresentative && (
            <Badge variant="warning" className="text-[8px]">Rep.</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "operator",
      header: "Opérateur",
      cell: ({ getValue }) => (
        <Badge variant="outline">
          {OPERATOR_LABELS[getValue() as MobileMoneyOperator]}
        </Badge>
      ),
    },
    {
      accessorKey: "mobileMoneyNumber",
      header: "N° MoMo",
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span>,
    },
    {
      accessorKey: "amount",
      header: "Montant",
      cell: ({ getValue }) => (
        <span className="font-semibold">{formatCurrency(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ getValue }) => <PaymentStatusBadge status={getValue() as PaymentStatus} size="xs" />,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => formatDate(getValue() as number),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <div className="flex gap-1">
            {s === "en_attente" && (
              <Button
                variant="info"
                size="xs"
                onClick={() => handleInitiateWithVerification(row.original)}
              >
                Initier
              </Button>
            )}
            {s === "initie" && (
              <>
                <Button
                  variant="success"
                  size="xs"
                  onClick={() => handleStatusUpdate(row.original._id, "confirme")}
                >
                  Confirmer
                </Button>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => handleStatusUpdate(row.original._id, "echoue")}
                >
                  Échoué
                </Button>
              </>
            )}
            {s === "echoue" && (
              <Button
                variant="info"
                size="xs"
                onClick={() => handleInitiateWithVerification(row.original)}
              >
                Réessayer
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const pendingCount = (payments as PaymentRow[])?.filter((p) => p.status === "en_attente").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Paiements</h1>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} en attente</Badge>
          )}
          <ExportPaymentsButton payments={(payments as PaymentRow[]) ?? []} />
        </div>
      </div>

      <PaymentVerificationDialog
        payment={verifyPayment}
        open={!!verifyPayment}
        onOpenChange={(open) => { if (!open) setVerifyPayment(null); }}
        onConfirm={handleVerifiedInitiate}
        loading={loading}
      />

      <DataTable
        columns={columns}
        data={(payments as PaymentRow[]) ?? []}
        isLoading={payments === undefined}
        searchColumn="beneficiaryName"
        searchPlaceholder="Rechercher par bénéficiaire..."
        emptyMessage="Aucun paiement"
        emptyIcon={<Wallet className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
        filterSlot={
          <select
            className="flex h-8 rounded-sm border border-[hsl(var(--input))] bg-transparent px-2 py-1 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "")}
          >
            <option value="">Tous les statuts</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        }
      />
    </div>
  );
}
