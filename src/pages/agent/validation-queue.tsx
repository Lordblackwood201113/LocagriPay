import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { CollectionStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface CollectionRow {
  _id: string;
  status: string;
  technicianName: string;
  supplierName: string;
  supplierType: string;
  location?: string;
  estimatedStockKg: number;
  submittedAt?: number;
  createdAt: number;
}

export default function ValidationQueuePage() {
  const navigate = useNavigate();
  const collections = useQuery(api.queries.collections.listByStatus, { status: "soumis" });

  const columns: ColumnDef<CollectionRow, unknown>[] = [
    {
      accessorKey: "submittedAt",
      header: "Date soumission",
      cell: ({ getValue }) => {
        const val = getValue() as number | undefined;
        return val ? formatDate(val) : "—";
      },
    },
    {
      accessorKey: "technicianName",
      header: "Technicien",
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: "supplierName",
      header: "Fournisseur",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.supplierName}</span>
          <span className="inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-semibold">
            {row.original.supplierType === "cooperative" ? "Coop" : "Individuel"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Zone",
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      accessorKey: "estimatedStockKg",
      header: "Stock (kg)",
      cell: ({ getValue }) => (
        <span className="font-mono">
          {(getValue() as number).toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ getValue }) => (
        <CollectionStatusBadge status={getValue() as any} size="xs" />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          onClick={() => navigate(`/validation/${row.original._id}`)}
        >
          Valider
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">File de validation</h1>
        {collections && (
          <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] px-3 py-1 text-sm font-semibold">
            {collections.length} en attente
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(collections as CollectionRow[]) ?? []}
        isLoading={collections === undefined}
        searchColumn="technicianName"
        searchPlaceholder="Rechercher par technicien..."
        emptyMessage="Aucune collecte en attente de validation"
        emptyIcon={<CheckCircle className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </div>
  );
}
