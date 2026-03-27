import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#76c893", "#f9c74f", "#f94144"];

export default function DirectionDashboard() {
  const activeCampaign = useQuery(api.queries.campaigns.active);
  const kpis = useQuery(
    api.queries.reports.dashboardKPIs,
    activeCampaign ? { campaignId: activeCampaign._id } : "skip",
  );

  // Build weekly volume data from technician data for bar chart
  const statusPieData = useMemo(() => {
    if (!kpis) return [];
    return [
      { name: "Payées", value: kpis.paid },
      { name: "En cours", value: kpis.accepted - kpis.paid },
      { name: "Refusées", value: kpis.refused },
    ].filter((d) => d.value > 0);
  }, [kpis]);

  const techBarData = useMemo(() => {
    if (!kpis?.technicians) return [];
    return kpis.technicians.map((t: any) => ({
      name: t.name.split(" ")[0],
      volume: Math.round((t.volumeKg / 1000) * 10) / 10,
      collectes: t.count,
    }));
  }, [kpis]);

  if (kpis === undefined) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full inline-block" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        {activeCampaign && (
          <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] px-3 py-1 text-sm font-semibold">{activeCampaign.name}</span>
        )}
      </div>

      {!activeCampaign && (
        <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/10 px-4 py-3 text-sm">Aucune campagne active</div>
      )}

      {kpis && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Volume total</div>
              <div className="text-xl font-bold mt-1 text-lg text-primary">{kpis.totalVolumeTons} t</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Montant total</div>
              <div className="text-xl font-bold mt-1 text-lg text-[hsl(var(--success))]">
                {kpis.totalAmountFCFA > 0
                  ? `${Math.round(kpis.totalAmountFCFA / 1000)}K`
                  : "0"}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatCurrency(kpis.totalAmountFCFA)}</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Collectes</div>
              <div className="text-xl font-bold mt-1">{kpis.totalCollections}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{kpis.accepted} accept. / {kpis.refused} ref.</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Fournisseurs</div>
              <div className="text-xl font-bold mt-1">{kpis.nbSuppliers}</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Qualité moy.</div>
              <div className={`stat-value text-lg ${kpis.avgQuality >= 3.5 ? "text-[hsl(var(--success))]" : kpis.avgQuality >= 2.5 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--destructive))]"}`}>
                {kpis.avgQuality}/5
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volume par technicien (bar chart) */}
            {techBarData.length > 0 && (
              <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
                <h2 className="text-sm sm:text-lg font-semibold mb-4">Volume par technicien (tonnes)</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={techBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      formatter={(value) => [`${value} t`, "Volume"]}
                    />
                    <Bar dataKey="volume" fill="#82b1d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Répartition statut (pie chart) */}
            {statusPieData.length > 0 && (
              <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
                <h2 className="text-sm sm:text-lg font-semibold mb-4">Répartition des collectes</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusPieData.map((_: any, index: number) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Technician performance table */}
          {kpis.technicians.length > 0 && (
            <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Performance par technicien</h2>
              <div className="-mx-4 sm:mx-0 overflow-x-auto">
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="border-b bg-[hsl(var(--muted))]/50">
                      <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Technicien</th>
                      <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Collectes</th>
                      <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Volume (t)</th>
                      <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.technicians.map((tech: any, i: number) => {
                      const tons = Math.round((tech.volumeKg / 1000) * 10) / 10;
                      const pct = Math.min(Math.round((tons / 300) * 100), 100);
                      return (
                        <tr key={i} className="border-b">
                          <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">{tech.name}</td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{tech.count}</td>
                          <td className="px-3 sm:px-4 py-3 font-mono whitespace-nowrap">{tons}</td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <progress
                                className="h-2 w-16 sm:w-24 overflow-hidden rounded-full bg-[hsl(var(--primary))]/20"
                                value={pct}
                                max={100}
                              />
                              <span className="text-xs whitespace-nowrap">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
