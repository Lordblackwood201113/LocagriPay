import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CollectionStatusBadge } from "@/components/shared/status-badge";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { CancelCollectionButton } from "@/components/collection/cancel-button";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { formatDateTime, maskMobileNumber, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const data = useQuery(api.queries.collections.getDetail, id ? { id: id as any } : "skip");

  if (data === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6 text-center">
        <p className="text-[hsl(var(--destructive))]">Collecte non trouvée</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate("/")}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const supplierData = data.supplierData as any;
  const members = supplierData?.members ?? [];
  const quality = data.quality as any;
  const decision = data.decision as any;
  const directionValidation = (data as any).directionValidation as any;
  const allocations = (data as any).memberAllocations as { memberId: string; memberName: string; stockKg: number }[] | undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-lg sm:text-2xl font-bold">Ma collecte</h1>
        <CollectionStatusBadge status={data.status as any} size="md" />
        <div className="flex-1" />
        <CancelCollectionButton
          collectionId={data._id}
          currentStatus={data.status}
          redirectTo="/"
        />
      </div>

      {/* Identification */}
      <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Identification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <Field label="Date de collecte" value={formatDateTime(data.createdAt)} />
          <Field label="Date de soumission" value={data.submittedAt ? formatDateTime(data.submittedAt) : "—"} />
          <Field label="Fournisseur">
            {data.supplierName}{" "}
            <Badge variant="outline" className="ml-1">
              {data.supplierType === "cooperative" ? "Coop" : "Individuel"}
            </Badge>
          </Field>
          <Field label="Localisation" value={data.location || "—"} />
          {data.gpsLat && data.gpsLng && (
            <Field label="GPS">
              <span className="font-mono text-xs">
                {data.gpsLat.toFixed(5)}, {data.gpsLng.toFixed(5)}
              </span>
            </Field>
          )}
        </div>
      </section>

      {/* Échantillonnage */}
      <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Échantillonnage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Sacs en stock" value={data.bagsInStock} />
          <Stat label="Stock estimé" value={`${data.estimatedStockKg.toLocaleString("fr-FR")} kg`} />
          <Stat label="Sacs échantillonnés" value={data.bagsSampled} />
          <Stat label="Poids moyen/sac" value={`${data.bagsInStock > 0 ? Math.round(data.estimatedStockKg / data.bagsInStock) : 0} kg`} />
        </div>
      </section>

      {/* Photos */}
      <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Photos ({data.photoIds.length})
        </h2>
        <PhotoGallery storageIds={data.photoIds} />
      </section>

      {/* Membres coopérative */}
      {data.supplierType === "cooperative" && members.length > 0 && (
        <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Membres ({members.length})
          </h2>
          {data.payRepresentative && (
            <div className="rounded-sm border border-[hsl(var(--info))]/50 bg-[hsl(var(--info))]/10 px-4 py-3 text-sm mb-4">
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
                        <Badge variant="default" className="ml-2">Rep.</Badge>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline">{OPERATOR_LABELS[m.mobileMoneyOperator as MobileMoneyOperator]}</Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-xs whitespace-nowrap">
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
        </section>
      )}

      {/* Analyse qualité (lecture seule) */}
      {quality && (
        <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Analyse qualité</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Stat label="Aspect visuel" value={`${quality.visualAspect}/5`} />
            <Stat label="Humidité" value={`${quality.humidity}%`} />
            <Stat label="Homogénéité" value={`${quality.homogeneity}/5`} />
            <Stat label="Propreté" value={`${quality.cleanliness}/5`} />
            <Stat label="Décorticage" value={`${quality.husking}/5`} />
            <Stat label="Score global" value={`${quality.globalScore}/5`} highlight />
          </div>
        </section>
      )}

      {/* Décision agent (lecture seule) */}
      {decision && (
        <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Décision de l'agent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <Field label="Décision">
              {decision.decision === "accepte" && <Badge variant="success">Accepté</Badge>}
              {decision.decision === "refuse" && <Badge variant="destructive">Refusé</Badge>}
              {decision.decision === "negocie" && <Badge variant="warning">En négociation</Badge>}
            </Field>
            {decision.pricePerKg && (
              <Field label="Prix négocié" value={`${formatCurrency(decision.pricePerKg)}/KG`} />
            )}
            {decision.finalWeightKg && (
              <Field label="Poids final" value={`${decision.finalWeightKg.toLocaleString("fr-FR")} KG`} />
            )}
            {decision.totalAmount && (
              <Field label="Montant total">
                <span className="font-bold text-lg text-[hsl(var(--success))]">
                  {formatCurrency(decision.totalAmount)}
                </span>
              </Field>
            )}
            {decision.comment && (
              <div className="sm:col-span-2">
                <Field label="Commentaire" value={decision.comment} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Validation direction (lecture seule) */}
      {directionValidation && (
        <section className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Validation direction</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <Field label="Décision">
              {directionValidation.decision === "approuve" && <Badge variant="success">Approuvé</Badge>}
              {directionValidation.decision === "rejete" && <Badge variant="destructive">Rejeté</Badge>}
            </Field>
            {directionValidation.comment && (
              <div className="sm:col-span-2">
                <Field label="Commentaire" value={directionValidation.comment} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Helper components ───

function Field({ label, value, children }: { label: string; value?: string | number; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="font-medium mt-0.5">{children ?? value}</p>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</div>
      <div className={`text-xl font-bold mt-1 ${highlight ? "text-[hsl(var(--primary))]" : ""}`}>{value}</div>
    </div>
  );
}
