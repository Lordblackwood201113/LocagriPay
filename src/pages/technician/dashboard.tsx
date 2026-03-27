import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { CollectionStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package, Users } from "lucide-react";

const TH = "px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap";

export default function TechnicianDashboard() {
  const { user, role } = useCurrentUser();
  const navigate = useNavigate();
  const isAgent = role === "agent_bureau";

  const activeCampaign = useQuery(api.queries.campaigns.active);

  // Personal stats (technicien) or global stats (agent bureau)
  const personalStats = useQuery(
    (api as any).queries?.reports?.technicianStats,
    user?._id && activeCampaign
      ? { technicianId: user._id, campaignId: activeCampaign._id }
      : "skip",
  );
  const globalStats = useQuery(
    (api as any).queries?.reports?.globalStats,
    isAgent && activeCampaign
      ? { campaignId: activeCampaign._id }
      : "skip",
  );
  const stats = isAgent ? globalStats : personalStats;

  const collections = useQuery(
    api.queries.collections.listByTechnician,
    user?._id ? { technicianId: user._id as any } : "skip",
  );

  // Agent bureau: also load all recent collections
  const allRecent = useQuery(
    api.queries.collections.listRecent,
    isAgent ? { limit: 20 } : "skip",
  );

  const recentCollections = (collections ?? []).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Tableau de bord</h1>
        <button className="inline-flex items-center justify-center rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[hsl(var(--primary))]/90 active:scale-95 transition-all" onClick={() => navigate("/collections/new")}>
          + Nouvelle collecte
        </button>
      </div>

      {/* Campaign info */}
      {activeCampaign ? (
        <div className="rounded-lg border border-[hsl(var(--info))]/50 bg-[hsl(var(--info))]/10 px-4 py-3 text-sm">
          Campagne active : <strong>{activeCampaign.name}</strong>
        </div>
      ) : (
        <div className="rounded-lg border border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/10 px-4 py-3 text-sm">
          Aucune campagne active. Contactez l'administrateur.
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Collectes du jour</div>
          <div className="text-xl font-bold mt-1 text-primary">{stats?.collectionsToday ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Volume total</div>
          <div className="text-xl font-bold mt-1">
            {stats?.totalVolumeTons ?? 0} <span className="text-sm font-normal">tonnes</span>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {stats ? `${Math.round((stats.totalVolumeTons / (isAgent ? 1200 : 300)) * 100)}% de l'objectif ${isAgent ? "1 200" : "300"}t` : "—"}
          </div>
        </div>
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">En attente</div>
          <div className="text-xl font-bold mt-1 text-[hsl(var(--warning))]">{stats?.pendingValidation ?? 0}</div>
        </div>
        <div className="rounded-lg border bg-[hsl(var(--card))] p-4">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Total collectes</div>
          <div className="text-xl font-bold mt-1">{stats?.totalCollections ?? 0}</div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {stats ? `${stats.accepted} acceptées, ${stats.refused} refusées` : "—"}
          </div>
        </div>
      </div>

      {/* Progress toward target */}
      {stats && stats.totalVolumeTons > 0 && (
        <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{isAgent ? "Objectif global entreprise" : "Progression mensuelle"}</span>
            <span className="font-bold">{stats.totalVolumeTons} / {isAgent ? "1 200" : "300"} tonnes</span>
          </div>
          <progress
            className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--primary))]/20"
            value={Math.min(stats.totalVolumeTons, isAgent ? 1200 : 300)}
            max={isAgent ? 1200 : 300}
          />
        </div>
      )}

      {/* My recent collections */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Mes collectes récentes</h2>
        {recentCollections.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
            <Package className="h-10 w-10 mx-auto mb-2" />
            <p className="text-sm">Aucune collecte pour l'instant</p>
            <button
              className="inline-flex items-center justify-center rounded-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 h-8 text-xs font-bold uppercase tracking-wider mt-4 active:scale-95 transition-all"
              onClick={() => navigate("/collections/new")}
            >
              Créer ma première collecte
            </button>
          </div>
        ) : (
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b bg-[hsl(var(--muted))]/50">
                  <th className={TH}>Date</th>
                  <th className={TH}>Stock (kg)</th>
                  <th className={TH}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentCollections.map((c: any) => (
                  <tr key={c._id} className="cursor-pointer border-b hover:bg-[hsl(var(--muted))]/50 active:bg-[hsl(var(--muted))]" onClick={() => navigate(`/collections/${c._id}`)}>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="px-3 sm:px-4 py-3 font-mono whitespace-nowrap">{c.estimatedStockKg.toLocaleString("fr-FR")}</td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <CollectionStatusBadge status={c.status} size="xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent bureau: all technicians' recent collections */}
      {isAgent && (
        <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <h2 className="text-lg font-semibold">Toutes les collectes</h2>
            <Badge variant="info">{(allRecent as any[])?.length ?? 0}</Badge>
          </div>
          {allRecent === undefined ? (
            <div className="flex justify-center py-8">
              <span className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full inline-block" />
            </div>
          ) : (allRecent as any[]).length === 0 ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <Package className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Aucune collecte enregistrée</p>
            </div>
          ) : (
            <div className="-mx-4 sm:mx-0 overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b bg-[hsl(var(--muted))]/50">
                    <th className={TH}>Technicien</th>
                    <th className={TH}>Fournisseur</th>
                    <th className={TH}>Date</th>
                    <th className={TH}>Stock (kg)</th>
                    <th className={TH}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {(allRecent as any[]).map((c: any) => (
                    <tr
                      key={c._id}
                      className="cursor-pointer border-b hover:bg-[hsl(var(--muted))]/50 active:bg-[hsl(var(--muted))]"
                      onClick={() => navigate(
                        c.status === "soumis" || c.status === "en_validation"
                          ? `/validation/${c._id}`
                          : `/collections/${c._id}`,
                      )}
                    >
                      <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">{c.technicianName}</td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{c.supplierName}</td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                      <td className="px-3 sm:px-4 py-3 font-mono whitespace-nowrap">{c.estimatedStockKg.toLocaleString("fr-FR")}</td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <CollectionStatusBadge status={c.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
