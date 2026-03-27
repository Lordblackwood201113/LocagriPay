import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface CollectionRow {
  _id: string;
  technicianName: string;
  supplierName: string;
  supplierType: string;
  estimatedStockKg: number;
  submittedAt?: number;
}

export default function DirectionValidationQueuePage() {
  const navigate = useNavigate();
  const collections = useQuery(api.queries.collections.listByStatus, {
    status: "en_attente_direction",
  });

  const columns: ColumnDef<CollectionRow, unknown>[] = [
    {
      accessorKey: "submittedAt",
      header: "Date",
      cell: ({ getValue }) => {
        const val = getValue() as number | undefined;
        return val ? formatDate(val) : "—";
      },
    },
    {
      accessorKey: "technicianName",
      header: "Technicien",
    },
    {
      accessorKey: "supplierName",
      header: "Fournisseur",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.supplierName}</span>
          <span className="inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-semibold">
            {row.original.supplierType === "cooperative" ? "Coop" : "Individuel"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "estimatedStockKg",
      header: "Stock (kg)",
      cell: ({ getValue }) => (
        <span className="font-mono">{(getValue() as number).toLocaleString("fr-FR")}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          onClick={() => navigate(`/direction/validation/${row.original._id}`)}
        >
          Examiner
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Validation direction</h1>
        {collections && (
          <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] px-3 py-1 text-sm font-semibold">
            {collections.length} en attente
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(collections as CollectionRow[]) ?? []}
        isLoading={collections === undefined}
        searchColumn="supplierName"
        searchPlaceholder="Rechercher par fournisseur..."
        emptyMessage="Aucune collecte en attente de validation"
        emptyIcon={<Search className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </div>
  );
}
