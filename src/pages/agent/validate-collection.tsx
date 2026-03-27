import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CollectionStatusBadge } from "@/components/shared/status-badge";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { formatDateTime, maskMobileNumber } from "@/lib/utils";
import { QualityForm } from "@/components/quality/quality-form";
import { DecisionForm } from "@/components/quality/decision-form";
import { formatCurrency } from "@/lib/utils";

export default function ValidateCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const data = useQuery(api.queries.collections.getDetail, id ? { id: id as any } : "skip");

  if (data === undefined) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full inline-block" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-6 text-center">
        <p className="text-[hsl(var(--destructive))]">Collecte non trouvée</p>
        <button className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] mt-4" onClick={() => navigate("/validation")}>
          Retour à la file
        </button>
      </div>
    );
  }

  const supplierData = data.supplierData as any;
  const members = supplierData?.members ?? [];
  const allocations = (data as any).memberAllocations as { memberId: string; memberName: string; stockKg: number }[] | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm hover:bg-[hsl(var(--accent))]" onClick={() => navigate("/validation")}>
          &larr; Retour
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">Collecte</h1>
        <CollectionStatusBadge status={data.status as any} size="md" />
      </div>

      {/* Identification */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Identification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="text-[hsl(var(--muted-foreground))]">Technicien</p>
            <p className="font-medium">{data.technicianName}</p>
          </div>
          <div>
            <p className="text-[hsl(var(--muted-foreground))]">Date de soumission</p>
            <p className="font-medium">
              {data.submittedAt ? formatDateTime(data.submittedAt) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[hsl(var(--muted-foreground))]">Fournisseur</p>
            <p className="font-medium">
              {data.supplierName}{" "}
              <span className="inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-semibold">
                {data.supplierType === "cooperative" ? "Coopérative" : "Individuel"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[hsl(var(--muted-foreground))]">Localisation</p>
            <p className="font-medium">{data.location || "—"}</p>
          </div>
          {data.gpsLat && data.gpsLng && (
            <div>
              <p className="text-[hsl(var(--muted-foreground))]">GPS</p>
              <p className="font-mono text-xs">
                {data.gpsLat.toFixed(5)}, {data.gpsLng.toFixed(5)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Échantillonnage */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Échantillonnage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Sacs en stock</div>
            <div className="text-xl font-bold mt-1">{data.bagsInStock}</div>
          </div>
          <div className="stat">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Stock estimé</div>
            <div className="text-xl font-bold mt-1">
              {data.estimatedStockKg.toLocaleString("fr-FR")} kg
            </div>
          </div>
          <div className="stat">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Sacs échantillonnés</div>
            <div className="text-xl font-bold mt-1">{data.bagsSampled}</div>
          </div>
          <div className="stat">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Poids moyen/sac</div>
            <div className="text-xl font-bold mt-1">
              {data.bagsInStock > 0
                ? Math.round(data.estimatedStockKg / data.bagsInStock)
                : 0}{" "}
              kg
            </div>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Photos ({data.photoIds.length})
        </h2>
        <PhotoGallery storageIds={data.photoIds} />
      </div>

      {/* Fournisseur détails */}
      {data.supplierType === "cooperative" && members.length > 0 && (
        <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Membres ({members.length})
          </h2>
          {data.payRepresentative && (
            <div className="rounded-lg border border-[hsl(var(--info))]/50 bg-[hsl(var(--info))]/10 px-4 py-3 text-sm mb-4 text-sm">
              Le représentant reçoit le paiement
            </div>
          )}
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b bg-[hsl(var(--muted))]/50">
                  <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Nom</th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Opérateur</th>
                  <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">N° Mobile Money</th>
                  {allocations && allocations.length > 0 && (
                    <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Stock (kg)</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => {
                  const alloc = allocations?.find((a) => a.memberId === m._id);
                  return (
                  <tr key={m._id} className="border-b">
                    <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">
                      {m.name}
                      {m._id === supplierData?.representativeId && (
                        <span className="inline-flex items-center rounded-sm border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-1.5 py-0 text-[10px] font-bold ml-2">Rep.</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-sm border px-1.5 py-0 text-[10px] font-bold">
                        {OPERATOR_LABELS[m.mobileMoneyOperator as MobileMoneyOperator]}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-sm whitespace-nowrap">
                      {maskMobileNumber(m.mobileMoneyNumber)}
                    </td>
                    {allocations && allocations.length > 0 && (
                      <td className="px-3 sm:px-4 py-3 font-bold whitespace-nowrap">
                        {alloc ? `${alloc.stockKg.toLocaleString("fr-FR")} kg` : "—"}
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality assessment */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Analyse qualité</h2>
        {data.quality ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="stat">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Aspect visuel</div>
                <div className="text-xl font-bold mt-1">{data.quality.visualAspect}/5</div>
              </div>
              <div className="stat">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Humidité</div>
                <div className="text-xl font-bold mt-1">{data.quality.humidity}%</div>
              </div>
              <div className="stat">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Homogénéité</div>
                <div className="text-xl font-bold mt-1">{data.quality.homogeneity}/5</div>
              </div>
              <div className="stat">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Propreté</div>
                <div className="text-xl font-bold mt-1">{data.quality.cleanliness}/5</div>
              </div>
              <div className="stat">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Décorticage</div>
                <div className="text-xl font-bold mt-1">{data.quality.husking}/5</div>
              </div>
              <div className="stat">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Score global</div>
                <div className="text-xl font-bold mt-1">{data.quality.globalScore}/5</div>
              </div>
            </div>
            {(data.status === "soumis" || data.status === "en_validation") && (
              <details className="rounded-lg border bg-[hsl(var(--muted))]">
                <summary className="collapse-title text-sm font-medium">
                  Modifier l'évaluation
                </summary>
                <div className="collapse-content">
                  <QualityForm
                    collectionId={data._id}
                    existingScores={{
                      visualAspect: data.quality.visualAspect,
                      humidity: data.quality.humidity,
                      homogeneity: data.quality.homogeneity,
                      cleanliness: data.quality.cleanliness,
                      husking: data.quality.husking,
                    }}
                  />
                </div>
              </details>
            )}
          </div>
        ) : (data.status === "soumis" || data.status === "en_validation") ? (
          <QualityForm collectionId={data._id} />
        ) : (
          <p className="text-[hsl(var(--muted-foreground))]">Pas d'évaluation qualité</p>
        )}
      </div>

      {/* Existing decision display */}
      {data.decision && (
        <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Décision de l'agent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[hsl(var(--muted-foreground))]">Décision</p>
              <p className="font-medium">
                {data.decision.decision === "accepte" && (
                  <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-2.5 py-0.5 text-xs font-semibold">Accepté</span>
                )}
                {data.decision.decision === "refuse" && (
                  <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] px-2.5 py-0.5 text-xs font-semibold">Refusé</span>
                )}
                {data.decision.decision === "negocie" && (
                  <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] px-2.5 py-0.5 text-xs font-semibold">En négociation</span>
                )}
              </p>
            </div>
            {data.decision.pricePerKg && (
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Prix négocié</p>
                <p className="font-medium">{formatCurrency(data.decision.pricePerKg)}/KG</p>
              </div>
            )}
            {data.decision.finalWeightKg && (
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Poids final</p>
                <p className="font-medium">
                  {data.decision.finalWeightKg.toLocaleString("fr-FR")} KG
                </p>
              </div>
            )}
            {data.decision.totalAmount && (
              <div>
                <p className="text-[hsl(var(--muted-foreground))]">Montant total</p>
                <p className="font-bold text-lg text-[hsl(var(--success))]">
                  {formatCurrency(data.decision.totalAmount)}
                </p>
              </div>
            )}
            {data.decision.comment && (
              <div className="sm:col-span-2">
                <p className="text-[hsl(var(--muted-foreground))]">Commentaire</p>
                <p className="font-medium">{data.decision.comment}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision form — only show if quality assessed and no decision yet */}
      {data.quality &&
        !data.decision &&
        (data.status === "soumis" || data.status === "en_validation") && (
          <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Prendre une décision</h2>
            <DecisionForm
              collectionId={data._id}
              qualityAssessmentId={data.quality._id}
            />
          </div>
        )}
    </div>
  );
}
