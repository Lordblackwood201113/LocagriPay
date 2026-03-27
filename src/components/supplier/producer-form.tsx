import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { isValidMobileNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface ProducerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    id: string;
    name: string;
    phone: string;
    location: string;
    mobileMoneyOperator: MobileMoneyOperator;
    mobileMoneyNumber: string;
  };
}

export function ProducerForm({ onSuccess, onCancel, initialData }: ProducerFormProps) {
  const createProducer = useMutation(api.mutations.producers.create);
  const updateProducer = useMutation(api.mutations.producers.update);

  const [name, setName] = useState(initialData?.name ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [operator, setOperator] = useState<MobileMoneyOperator>(
    initialData?.mobileMoneyOperator ?? "wave",
  );
  const [mobileNumber, setMobileNumber] = useState(initialData?.mobileMoneyNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Le nom est obligatoire"); return; }
    if (!phone.trim()) { setError("Le téléphone est obligatoire"); return; }
    if (!mobileNumber.trim() || !isValidMobileNumber(mobileNumber)) {
      setError("Le numéro mobile money doit contenir 9 à 10 chiffres"); return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateProducer({
          id: initialData.id as any, name: name.trim(), phone: phone.trim(),
          location: location.trim() || undefined, mobileMoneyOperator: operator,
          mobileMoneyNumber: mobileNumber.trim(),
        });
      } else {
        await createProducer({
          name: name.trim(), phone: phone.trim(),
          location: location.trim() || undefined, mobileMoneyOperator: operator,
          mobileMoneyNumber: mobileNumber.trim(),
        });
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
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      <div className="space-y-2">
        <Label>Nom complet *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Mamadou Diallo" required />
      </div>

      <div className="space-y-2">
        <Label>Téléphone *</Label>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 771234567" required />
      </div>

      <div className="space-y-2">
        <Label>Localisation</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Kaolack, Zone Nord" />
      </div>

      <div className="space-y-2">
        <Label>Opérateur Mobile Money *</Label>
        <select
          className="flex h-10 sm:h-9 w-full rounded-sm border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
          value={operator}
          onChange={(e) => setOperator(e.target.value as MobileMoneyOperator)}
        >
          {(Object.entries(OPERATOR_LABELS) as [MobileMoneyOperator, string][]).map(
            ([value, label]) => (<option key={value} value={value}>{label}</option>),
          )}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Numéro Mobile Money *</Label>
        <Input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Ex: 771234567" required />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Spinner size="sm" />}
          {isEdit ? "Modifier" : "Créer le producteur"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>Annuler</Button>
        )}
      </div>
    </form>
  );
}
