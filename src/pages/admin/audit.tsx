import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { formatDateTime } from "@/lib/utils";
import { ScrollText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface AuditRow {
  _id: string;
  entityType: string;
  entityId: string;
  action: string;
  userName: string;
  details?: string;
  createdAt: number;
}

const ENTITY_LABELS: Record<string, string> = {
  collection: "Collecte",
  payment: "Paiement",
  decision: "Décision",
  validation: "Validation",
  campaign: "Campagne",
};

export default function AuditPage() {
  const logs = useQuery((api as any).queries?.audit?.list, { limit: 200 });

  const columns: ColumnDef<AuditRow, unknown>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) => (
        <span className="text-sm">{formatDateTime(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "userName",
      header: "Utilisateur",
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    {
      accessorKey: "entityType",
      header: "Type",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">
          {ENTITY_LABELS[getValue() as string] ?? (getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ getValue }) => {
        const action = getValue() as string;
        if (action.includes("→")) {
          const [from, to] = action.replace("status:", "").split("→");
          return (
            <span className="text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">{from}</span>
              {" → "}
              <span className="font-medium">{to}</span>
            </span>
          );
        }
        return <span className="text-sm">{action}</span>;
      },
    },
    {
      accessorKey: "details",
      header: "Détails",
      cell: ({ getValue }) => {
        const d = getValue() as string | undefined;
        return d ? (
          <span className="text-sm text-[hsl(var(--muted-foreground))] max-w-[200px] truncate block">{d}</span>
        ) : (
          <span className="text-[hsl(var(--muted-foreground))]">—</span>
        );
      },
    },
    {
      accessorKey: "entityId",
      header: "ID Entité",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">
          {(getValue() as string).slice(-8)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Journal d'audit</h1>

      <DataTable
        columns={columns}
        data={(logs as AuditRow[]) ?? []}
        isLoading={logs === undefined}
        searchColumn="userName"
        searchPlaceholder="Rechercher par utilisateur..."
        emptyMessage="Aucune entrée d'audit"
        emptyIcon={<ScrollText className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
        pageSize={20}
      />
    </div>
  );
}
