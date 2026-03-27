import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CollectionStatusBadge } from "@/components/shared/status-badge";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { CancelCollectionButton } from "@/components/collection/cancel-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export default function ValidateDecisionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const data = useQuery(api.queries.collections.getDetail, id ? { id: id as any } : "skip");
  const validateDirection = useMutation(api.mutations.directionValidations.validate);

  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

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
        <button className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] mt-4" onClick={() => navigate("/direction/validation")}>
          Retour
        </button>
      </div>
    );
  }

  const decision = data.decision as any;

  const handleValidation = async (validation: "approuve" | "rejete") => {
    if (validation === "rejete" && !comment.trim()) {
      setError("Un commentaire est obligatoire pour un rejet");
      return;
    }
    if (!decision) {
      setError("Aucune décision d'agent trouvée");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await validateDirection({
        collectionId: id as any,
        decisionId: decision._id,
        validation,
        comment: comment.trim() || undefined,
      });
      navigate("/direction/validation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm hover:bg-[hsl(var(--accent))]" onClick={() => navigate("/direction/validation")}>
          &larr; Retour
        </button>
        <h1 className="text-xl sm:text-2xl font-bold">Validation direction</h1>
        <CollectionStatusBadge status={data.status as any} size="md" />
        <div className="flex-1" />
        <CancelCollectionButton
          collectionId={data._id}
          currentStatus={data.status}
          redirectTo="/direction/validation"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Collection info */}
        <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-5">
          <h3 className="font-semibold mb-3">Collecte</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Technicien</span>
              <span className="font-medium">{data.technicianName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Fournisseur</span>
              <span className="font-medium">{data.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Localisation</span>
              <span className="font-medium">{data.location || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Stock estimé</span>
              <span className="font-medium">{data.estimatedStockKg.toLocaleString("fr-FR")} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Soumis le</span>
              <span className="font-medium">
                {data.submittedAt ? formatDateTime(data.submittedAt) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Agent decision */}
        {decision && (
          <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-5">
            <h3 className="font-semibold mb-3">Décision de l'agent</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Décision</span>
                <span className="inline-flex items-center rounded-md border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] px-2.5 py-0.5 text-xs font-semibold">Accepté</span>
              </div>
              {decision.pricePerKg && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Prix</span>
                  <span className="font-medium">{formatCurrency(decision.pricePerKg)}/KG</span>
                </div>
              )}
              {decision.finalWeightKg && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Poids final</span>
                  <span className="font-medium">{decision.finalWeightKg.toLocaleString("fr-FR")} KG</span>
                </div>
              )}
              {decision.totalAmount && (
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Montant total</span>
                  <span className="font-bold text-[hsl(var(--success))] text-lg">
                    {formatCurrency(decision.totalAmount)}
                  </span>
                </div>
              )}
              {decision.comment && (
                <div className="mt-2">
                  <span className="text-[hsl(var(--muted-foreground))]">Commentaire : </span>
                  <span>{decision.comment}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quality scores */}
      {data.quality && (
        <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-5">
          <h3 className="font-semibold mb-3">Qualité</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Aspect</div>
              <div className="text-lg font-bold mt-1">{(data.quality as any).visualAspect}/5</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Humidité</div>
              <div className="text-lg font-bold mt-1">{(data.quality as any).humidity}%</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Homogénéité</div>
              <div className="text-lg font-bold mt-1">{(data.quality as any).homogeneity}/5</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Propreté</div>
              <div className="text-lg font-bold mt-1">{(data.quality as any).cleanliness}/5</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Décorticage</div>
              <div className="text-lg font-bold mt-1">{(data.quality as any).husking}/5</div>
            </div>
            <div className="rounded-lg border bg-[hsl(var(--card))] p-3">
              <div className="text-xs text-[hsl(var(--muted-foreground))]">Global</div>
              <div className="text-lg font-bold mt-1">{(data.quality as any).globalScore}/5</div>
            </div>
          </div>
        </div>
      )}

      {/* Photos */}
      {data.photoIds.length > 0 && (
        <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-5">
          <h3 className="font-semibold mb-3">Photos ({data.photoIds.length})</h3>
          <PhotoGallery storageIds={data.photoIds} />
        </div>
      )}

      {/* Direction action */}
      {data.status === "en_attente_direction" && (
        <div className="rounded-lg border bg-[hsl(var(--card))] shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Votre décision</h2>

          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

          <div className="space-y-2 mb-4">
            <Label>Commentaire (obligatoire si rejet)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Remarques ou motif de rejet..." rows={3} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="success" className="flex-1" onClick={() => handleValidation("approuve")} disabled={loading}>
              {loading && <Spinner size="sm" />} Approuver
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => handleValidation("rejete")} disabled={loading}>
              {loading && <Spinner size="sm" />} Rejeter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
