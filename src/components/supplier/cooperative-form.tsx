import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface CooperativeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: { id: string; name: string; phone: string; location: string };
}

export function CooperativeForm({ onSuccess, onCancel, initialData }: CooperativeFormProps) {
  const createCooperative = useMutation(api.mutations.cooperatives.create);
  const updateCooperative = useMutation(api.mutations.cooperatives.update);

  const [name, setName] = useState(initialData?.name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Le nom de la coopérative est obligatoire"); return; }
    if (!phone.trim()) { setError("Le téléphone est obligatoire"); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await updateCooperative({ id: initialData.id as any, name: name.trim(), phone: phone.trim(), location: location.trim() || undefined });
      } else {
        await createCooperative({ name: name.trim(), phone: phone.trim(), location: location.trim() || undefined });
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-2">
        <Label>Nom de la coopérative *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Coopérative Rizicole de Kaolack" required />
      </div>

      <div className="space-y-2">
        <Label>Téléphone *</Label>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 771234567" required />
      </div>

      <div className="space-y-2">
        <Label>Localisation</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Kaolack, Zone Nord" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Spinner size="sm" />}
          {isEdit ? "Modifier" : "Créer la coopérative"}
        </Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Annuler</Button>}
      </div>
    </form>
  );
}
