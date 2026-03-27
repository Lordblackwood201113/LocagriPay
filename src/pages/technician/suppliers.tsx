import { useState } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { ProducerForm } from "@/components/supplier/producer-form";
import { CooperativeForm } from "@/components/supplier/cooperative-form";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { maskMobileNumber, formatDate } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCog, Building2, Pencil } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

// ─── Types ───

interface Producer {
  _id: string;
  name: string;
  phone: string;
  location?: string;
  mobileMoneyOperator: MobileMoneyOperator;
  mobileMoneyNumber: string;
  createdAt: number;
}

interface Cooperative {
  _id: string;
  name: string;
  phone: string;
  location?: string;
  createdAt: number;
}

const canSeeFullNumber = (role: string | null) => role === "admin" || role === "agent_bureau";

// ─── Producers Tab ───

function ProducersTab() {
  const { role } = useCurrentUser();
  const navigate = useNavigate();
  const producers = useQuery(api.queries.producers.list, {});
  const [showForm, setShowForm] = useState(false);
  const [editProducer, setEditProducer] = useState<Producer | null>(null);

  const showFull = canSeeFullNumber(role);

  const columns: ColumnDef<Producer, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ getValue, row }) => (
        <button
          className="font-medium text-[hsl(var(--primary))] hover:underline"
          onClick={() => navigate(`/suppliers/producer/${row.original._id}`)}
        >
          {getValue() as string}
        </button>
      ),
    },
    {
      accessorKey: "phone",
      header: "Tél.",
    },
    {
      accessorKey: "location",
      header: "Zone",
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      accessorKey: "mobileMoneyOperator",
      header: "Opérateur",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-[10px]">
          {OPERATOR_LABELS[getValue() as MobileMoneyOperator]}
        </Badge>
      ),
    },
    {
      accessorKey: "mobileMoneyNumber",
      header: "N° MoMo",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">
          {showFull ? (getValue() as string) : maskMobileNumber(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Créé le",
      cell: ({ getValue }) => formatDate(getValue() as number),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditProducer(row.original);
            setShowForm(true);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => { setEditProducer(null); setShowForm(true); }}>+ Nouveau producteur</Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{editProducer ? "Modifier le producteur" : "Nouveau producteur"}</DialogTitle>
          </DialogHeader>
          <ProducerForm
            initialData={editProducer ? {
              id: editProducer._id, name: editProducer.name, phone: editProducer.phone,
              location: editProducer.location ?? "", mobileMoneyOperator: editProducer.mobileMoneyOperator,
              mobileMoneyNumber: editProducer.mobileMoneyNumber,
            } : undefined}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={(producers as Producer[]) ?? []}
        isLoading={producers === undefined}
        searchColumn="name"
        searchPlaceholder="Rechercher par nom..."
        emptyMessage="Aucun producteur enregistré"
        emptyIcon={<UserCog className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </>
  );
}

// ─── Cooperatives Tab ───

function CooperativesTab() {
  const cooperatives = useQuery(api.queries.cooperatives.list);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editCoop, setEditCoop] = useState<Cooperative | null>(null);

  const columns: ColumnDef<Cooperative, unknown>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ getValue, row }) => (
        <button
          className="font-medium text-[hsl(var(--primary))] hover:underline"
          onClick={() => navigate(`/suppliers/cooperative/${row.original._id}`)}
        >
          {getValue() as string}
        </button>
      ),
    },
    {
      accessorKey: "phone",
      header: "Tél.",
    },
    {
      accessorKey: "location",
      header: "Zone",
      cell: ({ getValue }) => (getValue() as string) || "—",
    },
    {
      accessorKey: "createdAt",
      header: "Créée le",
      cell: ({ getValue }) => formatDate(getValue() as number),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditCoop(row.original);
            setShowForm(true);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => { setEditCoop(null); setShowForm(true); }}>+ Nouvelle coopérative</Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>{editCoop ? "Modifier la coopérative" : "Nouvelle coopérative"}</DialogTitle>
          </DialogHeader>
          <CooperativeForm
            initialData={editCoop ? { id: editCoop._id, name: editCoop.name, phone: editCoop.phone, location: editCoop.location ?? "" } : undefined}
            onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={(cooperatives as Cooperative[]) ?? []}
        isLoading={cooperatives === undefined}
        searchColumn="name"
        searchPlaceholder="Rechercher par nom..."
        emptyMessage="Aucune coopérative enregistrée"
        emptyIcon={<Building2 className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </>
  );
}

// ─── Main Page with Tabs ───

export default function SuppliersPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Fournisseurs</h1>

      <Tabs defaultValue="producers">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="producers" className="flex-1 sm:flex-initial"><UserCog className="h-4 w-4 mr-1.5" /> Producteurs</TabsTrigger>
          <TabsTrigger value="cooperatives" className="flex-1 sm:flex-initial"><Building2 className="h-4 w-4 mr-1.5" /> Coopératives</TabsTrigger>
        </TabsList>
        <TabsContent value="producers"><ProducersTab /></TabsContent>
        <TabsContent value="cooperatives"><CooperativesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
