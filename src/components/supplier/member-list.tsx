import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { maskMobileNumber, isValidMobileNumber } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Users } from "lucide-react";

interface Member {
  _id: string;
  name: string;
  phone: string;
  mobileMoneyOperator: MobileMoneyOperator;
  mobileMoneyNumber: string;
}

interface MemberListProps {
  cooperativeId: string;
  members: Member[];
  representativeId?: string;
}

export function MemberList({ cooperativeId, members, representativeId }: MemberListProps) {
  const { role } = useCurrentUser();
  const addMember = useMutation(api.mutations.cooperatives.addMember);
  const removeMember = useMutation(api.mutations.cooperatives.removeMember);
  const setRepresentative = useMutation(api.mutations.cooperatives.setRepresentative);

  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [operator, setOperator] = useState<MobileMoneyOperator>("wave");
  const [mobileNumber, setMobileNumber] = useState("");

  const showFull = role === "admin" || role === "agent_bureau";

  const resetForm = () => { setName(""); setPhone(""); setLocation(""); setOperator("wave"); setMobileNumber(""); setError(""); };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) { setError("Nom et téléphone sont obligatoires"); return; }
    if (!mobileNumber.trim() || !isValidMobileNumber(mobileNumber)) { setError("Numéro mobile money invalide (9-10 chiffres)"); return; }

    setLoading(true);
    try {
      await addMember({ cooperativeId: cooperativeId as any, name: name.trim(), phone: phone.trim(), location: location.trim() || undefined, mobileMoneyOperator: operator, mobileMoneyNumber: mobileNumber.trim() });
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (producerId: string) => {
    if (!confirm("Retirer ce membre de la coopérative ?")) return;
    await removeMember({ producerId: producerId as any, cooperativeId: cooperativeId as any });
  };

  const handleSetRepresentative = async (producerId: string) => {
    await setRepresentative({ cooperativeId: cooperativeId as any, producerId: producerId as any });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold">Membres ({members.length})</h3>
        <Button size="sm" onClick={() => { resetForm(); setShowAddForm(true); }}>+ Ajouter</Button>
      </div>

      {showAddForm && (
        <div className="rounded-sm border bg-[hsl(var(--muted))] p-3 sm:p-4">
          <form onSubmit={handleAdd} className="space-y-3">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="grid grid-cols-1 gap-3">
              <Input placeholder="Nom complet *" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input type="tel" placeholder="Téléphone *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Input placeholder="Zone / Localisation" value={location} onChange={(e) => setLocation(e.target.value)} />
              <select
                className="flex h-10 sm:h-9 w-full rounded-sm border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-base sm:text-sm"
                value={operator} onChange={(e) => setOperator(e.target.value as MobileMoneyOperator)}
              >
                {(Object.entries(OPERATOR_LABELS) as [MobileMoneyOperator, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <Input type="tel" placeholder="N° Mobile Money *" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <Button size="sm" type="submit" disabled={loading}>
                {loading && <Spinner size="xs" />} Ajouter
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setShowAddForm(false)}>Annuler</Button>
            </div>
          </form>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <Users className="h-10 w-10 mx-auto mb-2" />
          Aucun membre dans cette coopérative
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b bg-[hsl(var(--muted))]/50">
                <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Nom</th>
                <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Téléphone</th>
                <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Opérateur</th>
                <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">N° Mobile Money</th>
                <th className="px-3 sm:px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b">
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      {member._id === representativeId && <Badge variant="default" className="text-[10px]">Rep.</Badge>}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{member.phone}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap"><Badge variant="outline" className="text-[10px]">{OPERATOR_LABELS[member.mobileMoneyOperator]}</Badge></td>
                  <td className="px-3 sm:px-4 py-3 font-mono text-sm whitespace-nowrap">{showFull ? member.mobileMoneyNumber : maskMobileNumber(member.mobileMoneyNumber)}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1">
                      {member._id !== representativeId && (
                        <Button variant="ghost" size="xs" onClick={() => handleSetRepresentative(member._id)}>Rep.</Button>
                      )}
                      <Button variant="ghost" size="xs" className="text-[hsl(var(--destructive))]" onClick={() => handleRemove(member._id)}>Retirer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
