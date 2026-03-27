import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CampaignsPage() {
  const campaigns = useQuery(api.queries.campaigns.list);
  const createCampaign = useMutation(api.mutations.campaigns.create);
  const closeCampaign = useMutation(api.mutations.campaigns.close);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeCampaign = campaigns?.find((c) => c.status === "active");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!name.trim()) { setError("Le nom est obligatoire"); return; }
    if (!startDate || !endDate) { setError("Les dates sont obligatoires"); return; }
    setLoading(true);
    try {
      await createCampaign({ name: name.trim(), startDate: new Date(startDate).getTime(), endDate: new Date(endDate).getTime() });
      setShowForm(false); setName(""); setStartDate(""); setEndDate("");
    } catch (err) { setError(err instanceof Error ? err.message : "Erreur"); } finally { setLoading(false); }
  };

  const handleClose = async (id: string) => {
    if (!confirm("Clôturer cette campagne ? Aucune nouvelle collecte ne sera possible.")) return;
    try { await closeCampaign({ id: id as any }); } catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Campagnes d'achat</h1>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={!!activeCampaign}>+ Nouvelle campagne</Button>
      </div>

      {activeCampaign && (
        <Alert variant="info"><AlertDescription>Campagne active : <strong>{activeCampaign.name}</strong> — {formatDate(activeCampaign.startDate)} au {formatDate(activeCampaign.endDate)}</AlertDescription></Alert>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle campagne</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Campagne Hivernage 2026" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date début *</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Date fin *</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>{loading && <Spinner size="sm" />} Créer la campagne</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="-mx-4 sm:mx-0 overflow-x-auto rounded-sm border">
        <table className="w-full min-w-max text-sm">
          <thead><tr className="border-b bg-[hsl(var(--muted))]/50"><th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Nom</th><th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Début</th><th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Fin</th><th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Statut</th><th className="px-3 sm:px-4 py-2.5"></th></tr></thead>
          <tbody>
            {campaigns === undefined ? (
              Array.from({ length: 3 }).map((_, i) => (<tr key={i}>{Array.from({ length: 5 }).map((_, j) => (<td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>))}</tr>))
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12"><Calendar className="h-10 w-10 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" /><p className="text-[hsl(var(--muted-foreground))] text-sm">Aucune campagne créée</p></td></tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="px-3 sm:px-4 py-3 font-medium whitespace-nowrap">{c.name}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{formatDate(c.startDate)}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{formatDate(c.endDate)}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{c.status === "active" ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Clôturée</Badge>}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">{c.status === "active" && <Button variant="warning" size="xs" onClick={() => handleClose(c._id)}>Clôturer</Button>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
