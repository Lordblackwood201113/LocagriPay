import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CancelCollectionButtonProps {
  collectionId: string;
  currentStatus: string;
  redirectTo?: string;
}

export function CancelCollectionButton({ collectionId, currentStatus, redirectTo = "/" }: CancelCollectionButtonProps) {
  const cancelCollection = useMutation(api.mutations.collections.cancel);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (currentStatus !== "valide" && currentStatus !== "en_paiement") return null;

  const handleCancel = async () => {
    if (!reason.trim()) { setError("Le motif d'annulation est obligatoire"); return; }
    setLoading(true); setError("");
    try {
      const result = await cancelCollection({ collectionId: collectionId as any, reason: reason.trim() });
      if ((result as any)?.hasConfirmedPayment) {
        alert("La collecte a été annulée. Attention : certains paiements déjà confirmés nécessitent une annulation manuelle.");
      }
      setShowModal(false);
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setShowModal(true)}>
        Annuler la collecte
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-[hsl(var(--destructive))]">Annuler la collecte</DialogTitle></DialogHeader>
          <Alert variant="warning"><AlertDescription>Cette action est irréversible. Les paiements non confirmés seront automatiquement annulés.</AlertDescription></Alert>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2">
            <Label>Motif d'annulation *</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Indiquez la raison de l'annulation..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={loading}>Fermer</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading && <Spinner size="sm" />} Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
