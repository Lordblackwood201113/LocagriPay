import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { DataTable } from "@/components/shared/data-table";
import { CollectionStatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface DecisionRow {
  _id: string;
  collectionId: string;
  decision: "accepte" | "refuse" | "negocie";
  pricePerKg?: number;
  finalWeightKg?: number;
  totalAmount?: number;
  comment?: string;
  createdAt: number;
  technicianName: string;
  supplierName: string;
  collectionStatus: string;
  estimatedStockKg: number;
}

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "accepte") return <Badge variant="success">Accepté</Badge>;
  if (decision === "refuse") return <Badge variant="destructive">Refusé</Badge>;
  return <Badge variant="warning">Négocié</Badge>;
}

export default function MyDecisionsPage() {
  const { user } = useCurrentUser();

  const decisions = useQuery(
    api.queries.decisions.listByAgent,
    user?._id ? { agentId: user._id as any } : "skip",
  );

  const columns: ColumnDef<DecisionRow, unknown>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => formatDate(getValue() as number),
    },
    {
      accessorKey: "technicianName",
      header: "Technicien",
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: "supplierName",
      header: "Fournisseur",
    },
    {
      accessorKey: "estimatedStockKg",
      header: "Stock (kg)",
      cell: ({ getValue }) => <span className="font-mono">{(getValue() as number).toLocaleString("fr-FR")}</span>,
    },
    {
      accessorKey: "decision",
      header: "Décision",
      cell: ({ getValue }) => <DecisionBadge decision={getValue() as string} />,
    },
    {
      accessorKey: "totalAmount",
      header: "Montant",
      cell: ({ getValue }) => {
        const v = getValue() as number | undefined;
        return v ? <span className="font-semibold">{formatCurrency(v)}</span> : "—";
      },
    },
    {
      accessorKey: "collectionStatus",
      header: "Statut collecte",
      cell: ({ getValue }) => <CollectionStatusBadge status={getValue() as any} size="xs" />,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Mes décisions</h1>

      <DataTable
        columns={columns}
        data={(decisions as DecisionRow[]) ?? []}
        isLoading={decisions === undefined}
        searchColumn="supplierName"
        searchPlaceholder="Rechercher par fournisseur..."
        emptyMessage="Aucune décision prise"
        emptyIcon={<ClipboardList className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </div>
  );
}
