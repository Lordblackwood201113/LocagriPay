import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ExportExcelButton } from "@/components/shared/export-button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, FlaskConical, Wallet, UserCog } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

// ─── Types ───

interface TechRow {
  id: string;
  name: string;
  zone: string;
  totalCollections: number;
  totalVolumeTons: number;
  accepted: number;
  refused: number;
  acceptRate: number;
}

interface QualityRow {
  collectionId: string;
  supplierName: string;
  supplierType: string;
  location: string;
  visualAspect: number;
  humidity: number;
  homogeneity: number;
  cleanliness: number;
  husking: number;
  globalScore: number;
  decision: string | null;
}

// ─── Technicians Tab ───

function TechniciansTab({ campaignId }: { campaignId?: string }) {
  const techPerf = useQuery(
    api.queries.reports.technicianPerformance,
    campaignId ? { campaignId: campaignId as any } : "skip",
  );

  const columns: ColumnDef<TechRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Technicien",
      cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
    },
    { accessorKey: "zone", header: "Zone" },
    { accessorKey: "totalCollections", header: "Collectes" },
    {
      accessorKey: "totalVolumeTons",
      header: "Volume (t)",
      cell: ({ getValue }) => <span className="font-mono">{getValue() as number}</span>,
    },
    {
      accessorKey: "acceptRate",
      header: "Taux accept.",
      cell: ({ getValue }) => {
        const r = getValue() as number;
        return <span className={r >= 80 ? "text-[hsl(var(--success))]" : r >= 50 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--destructive))]"}>{r}%</span>;
      },
    },
    {
      id: "progress",
      header: "Obj. 300t/mois",
      cell: ({ row }) => {
        const pct = Math.min(Math.round((row.original.totalVolumeTons / 300) * 100), 100);
        return (
          <div className="flex items-center gap-2">
            <progress className="h-2 w-12 sm:w-20 overflow-hidden rounded-full bg-[hsl(var(--primary))]/20" value={pct} max={100} />
            <span className="text-xs font-mono whitespace-nowrap">{pct}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "accepted",
      header: "Accept.",
      cell: ({ getValue }) => <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-2 py-0.5 text-xs font-semibold">{getValue() as number}</span>,
    },
    {
      accessorKey: "refused",
      header: "Refus.",
      cell: ({ getValue }) => {
        const v = getValue() as number;
        return v > 0 ? <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] px-2 py-0.5 text-xs font-semibold">{v}</span> : <span className="text-[hsl(var(--muted-foreground))]">0</span>;
      },
    },
  ];

  const exportData = ((techPerf as TechRow[]) ?? []).map((t) => ({
    "Technicien": t.name,
    "Zone": t.zone,
    "Collectes": t.totalCollections,
    "Volume (tonnes)": t.totalVolumeTons,
    "Taux acceptation (%)": t.acceptRate,
    "Acceptées": t.accepted,
    "Refusées": t.refused,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ExportExcelButton data={exportData} filename="rapport-techniciens" sheetName="Techniciens" />
      </div>
      <DataTable
        columns={columns}
        data={(techPerf as TechRow[]) ?? []}
        isLoading={techPerf === undefined}
        searchColumn="name"
        searchPlaceholder="Rechercher par technicien..."
        emptyMessage="Aucune donnée de performance"
        emptyIcon={<BarChart3 className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </div>
  );
}

// ─── Quality Tab ───

function scoreColor(score: number) {
  if (score >= 4) return "text-[hsl(var(--success))]";
  if (score >= 3) return "text-[hsl(var(--info))]";
  if (score >= 2) return "text-[hsl(var(--warning))]";
  return "text-[hsl(var(--destructive))]";
}

function QualityTab({ campaignId }: { campaignId?: string }) {
  const report = useQuery(
    api.queries.reports.qualityReport,
    campaignId ? { campaignId: campaignId as any } : "skip",
  );

  const columns: ColumnDef<QualityRow, unknown>[] = [
    {
      accessorKey: "supplierName",
      header: "Fournisseur",
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{getValue() as string}</span>
          <span className="inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-semibold">
            {row.original.supplierType === "cooperative" ? "Coop" : "Ind."}
          </span>
        </div>
      ),
    },
    { accessorKey: "location", header: "Zone" },
    {
      accessorKey: "globalScore",
      header: "Score",
      cell: ({ getValue }) => {
        const s = getValue() as number;
        return <span className={`font-bold ${scoreColor(s)}`}>{s}/5</span>;
      },
    },
    {
      accessorKey: "visualAspect",
      header: "Aspect",
      cell: ({ getValue }) => <span>{getValue() as number}/5</span>,
    },
    {
      accessorKey: "humidity",
      header: "Humid. %",
      cell: ({ getValue }) => {
        const h = getValue() as number;
        return <span className={h <= 14 ? "text-[hsl(var(--success))]" : h <= 17 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--destructive))]"}>{h}%</span>;
      },
    },
    {
      accessorKey: "homogeneity",
      header: "Homog.",
      cell: ({ getValue }) => <span>{getValue() as number}/5</span>,
    },
    {
      accessorKey: "cleanliness",
      header: "Propre.",
      cell: ({ getValue }) => <span>{getValue() as number}/5</span>,
    },
    {
      accessorKey: "husking",
      header: "Décort.",
      cell: ({ getValue }) => <span>{getValue() as number}/5</span>,
    },
    {
      accessorKey: "decision",
      header: "Décision",
      cell: ({ getValue }) => {
        const d = getValue() as string | null;
        if (d === "accepte") return <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-1.5 py-0 text-[10px] font-semibold">Accepté</span>;
        if (d === "refuse") return <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] px-1.5 py-0 text-[10px] font-semibold">Refusé</span>;
        if (d === "negocie") return <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] px-1.5 py-0 text-[10px] font-semibold">Négocié</span>;
        return <span className="text-[hsl(var(--muted-foreground))]">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Averages summary */}
      {report && report.rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Score moyen</div>
            <div className={`stat-value text-base ${scoreColor(report.averages.globalScore)}`}>
              {report.averages.globalScore}/5
            </div>
          </div>
          <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Humidité moy.</div>
            <div className="text-lg font-bold mt-1">{report.averages.humidity}%</div>
          </div>
          <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Taux accept.</div>
            <div className="text-xl font-bold mt-1 text-base text-[hsl(var(--success))]">{report.acceptRate}%</div>
          </div>
          <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Taux refus</div>
            <div className="text-xl font-bold mt-1 text-base text-[hsl(var(--destructive))]">{report.refuseRate}%</div>
          </div>
          <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Évaluations</div>
            <div className="text-lg font-bold mt-1">{report.rows.length}</div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <ExportExcelButton
          data={(report?.rows ?? []).map((r) => ({
            "Fournisseur": r.supplierName,
            "Type": r.supplierType === "cooperative" ? "Coopérative" : "Individuel",
            "Zone": r.location,
            "Score global (/5)": r.globalScore,
            "Aspect visuel (/5)": r.visualAspect,
            "Humidité (%)": r.humidity,
            "Homogénéité (/5)": r.homogeneity,
            "Propreté (/5)": r.cleanliness,
            "Décorticage (/5)": r.husking,
            "Décision": r.decision ?? "—",
          }))}
          filename="rapport-qualite"
          sheetName="Qualité"
        />
      </div>
      <DataTable
        columns={columns}
        data={(report?.rows as QualityRow[]) ?? []}
        isLoading={report === undefined}
        searchColumn="supplierName"
        searchPlaceholder="Rechercher par fournisseur..."
        emptyMessage="Aucune évaluation qualité"
        emptyIcon={<FlaskConical className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
      />
    </div>
  );
}

// ─── Financial Tab ───

const OPERATOR_COLORS = ["#82b1d4", "#f9a825"];

function FinancialTab({ campaignId }: { campaignId?: string }) {
  const report = useQuery(
    api.queries.reports.financialReport,
    campaignId ? { campaignId: campaignId as any } : "skip",
  );

  if (report === undefined) {
    return <div className="flex justify-center py-8"><span className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full inline-block" /></div>;
  }

  if (!report || report.totalPayments === 0) {
    return <div className="text-center py-8 text-[hsl(var(--muted-foreground))]"><Wallet className="h-10 w-10 mx-auto mb-2" />Aucune donnée financière</div>;
  }

  const operatorData = [
    { name: "Wave", value: report.byOperator.wave.amount },
    { name: "Orange Money", value: report.byOperator.orange_money.amount },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Montant total</div>
          <div className="text-xl font-bold mt-1">{formatCurrency(report.totalAmount)}</div>
        </div>
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Payé</div>
          <div className="text-xl font-bold mt-1 text-lg text-[hsl(var(--success))]">{formatCurrency(report.totalPaid)}</div>
        </div>
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">En attente</div>
          <div className="text-xl font-bold mt-1 text-lg text-[hsl(var(--warning))]">{formatCurrency(report.totalPending)}</div>
        </div>
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Prix moyen/KG</div>
          <div className="text-xl font-bold mt-1">{report.avgPricePerKg} FCFA</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operator pie */}
        {operatorData.length > 0 && (
          <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-6">
            <h3 className="font-semibold mb-4">Répartition par opérateur</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={operatorData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name }) => name}>
                  {operatorData.map((_: any, i: number) => (
                    <Cell key={i} fill={OPERATOR_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-center">
              <div>
                <div className="font-bold">{report.byOperator.wave.count}</div>
                <div className="text-[hsl(var(--muted-foreground))]">paiements Wave</div>
              </div>
              <div>
                <div className="font-bold">{report.byOperator.orange_money.count}</div>
                <div className="text-[hsl(var(--muted-foreground))]">paiements Orange Money</div>
              </div>
            </div>
          </div>
        )}

        {/* Status breakdown */}
        <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-6">
          <h3 className="font-semibold mb-4">Statuts des paiements</h3>
          <div className="space-y-3">
            {[
              { label: "En attente", count: report.byStatus.en_attente, color: "bg-[hsl(var(--warning))]" },
              { label: "Initiés", count: report.byStatus.initie, color: "bg-[hsl(var(--info))]" },
              { label: "Confirmés", count: report.byStatus.confirme, color: "bg-[hsl(var(--success))]" },
              { label: "Échoués", count: report.byStatus.echoue, color: "bg-[hsl(var(--destructive))]" },
              { label: "Annulés", count: report.byStatus.annule, color: "bg-[hsl(var(--sn-neutral))]" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${s.color}`} />
                <span className="flex-1 text-sm">{s.label}</span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="divider my-2" />
          <div className="flex justify-between font-bold">
            <span>Total paiements</span>
            <span>{report.totalPayments}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ExportExcelButton
          data={[{
            "Montant total (FCFA)": report.totalAmount,
            "Payé (FCFA)": report.totalPaid,
            "En attente (FCFA)": report.totalPending,
            "Prix moyen/KG (FCFA)": report.avgPricePerKg,
            "Wave - Nb": report.byOperator.wave.count,
            "Wave - Montant": report.byOperator.wave.amount,
            "Orange Money - Nb": report.byOperator.orange_money.count,
            "Orange Money - Montant": report.byOperator.orange_money.amount,
            "En attente": report.byStatus.en_attente,
            "Initiés": report.byStatus.initie,
            "Confirmés": report.byStatus.confirme,
            "Échoués": report.byStatus.echoue,
            "Annulés": report.byStatus.annule,
          }]}
          filename="rapport-financier"
          sheetName="Financier"
        />
      </div>
    </div>
  );
}

// ─── Main Reports Page ───

export default function ReportsPage() {
  const activeCampaign = useQuery(api.queries.campaigns.active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Rapports</h1>
        {activeCampaign && <Badge variant="info">{activeCampaign.name}</Badge>}
      </div>

      {!activeCampaign && <Alert variant="warning"><AlertDescription>Aucune campagne active</AlertDescription></Alert>}

      <Tabs defaultValue="techniciens">
        <TabsList>
          <TabsTrigger value="techniciens"><UserCog className="h-4 w-4 mr-1.5" /> Techniciens</TabsTrigger>
          <TabsTrigger value="qualite"><FlaskConical className="h-4 w-4 mr-1.5" /> Qualité</TabsTrigger>
          <TabsTrigger value="financier"><Wallet className="h-4 w-4 mr-1.5" /> Financier</TabsTrigger>
        </TabsList>
        <TabsContent value="techniciens"><TechniciansTab campaignId={activeCampaign?._id} /></TabsContent>
        <TabsContent value="qualite"><QualityTab campaignId={activeCampaign?._id} /></TabsContent>
        <TabsContent value="financier"><FinancialTab campaignId={activeCampaign?._id} /></TabsContent>
      </Tabs>
    </div>
  );
}
