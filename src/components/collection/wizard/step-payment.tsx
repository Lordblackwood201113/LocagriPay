import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { maskMobileNumber, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import type { StepProps } from "./types";

interface Member { _id: string; name: string; mobileMoneyOperator: MobileMoneyOperator; mobileMoneyNumber: string; }

export function StepPayment({ data, onChange }: StepProps) {
  const isCooperative = data.supplier?.type === "cooperative";
  const coopData = useQuery(api.queries.cooperatives.getWithMembers, isCooperative && data.supplier ? { id: data.supplier.id as any } : "skip");
  const producerData = useQuery(api.queries.producers.getById, !isCooperative && data.supplier ? { id: data.supplier.id as any } : "skip");

  const members = (coopData?.members ?? []) as Member[];
  const representative = members.find((m) => m._id === coopData?.representativeId);

  // Initialize memberAllocations when members load and no allocations exist yet
  useEffect(() => {
    if (members.length > 0 && data.memberAllocations.length === 0 && !data.payRepresentative) {
      onChange({
        memberAllocations: members.map((m) => ({
          memberId: m._id,
          memberName: m.name,
          stockKg: 0,
        })),
      });
    }
  }, [members.length, data.memberAllocations.length, data.payRepresentative]);

  const updateMemberStock = (memberId: string, stockKg: number) => {
    onChange({
      memberAllocations: data.memberAllocations.map((a) =>
        a.memberId === memberId ? { ...a, stockKg } : a,
      ),
    });
  };

  const totalMemberStock = data.memberAllocations.reduce((sum, a) => sum + a.stockKg, 0);
  const estimatedStock = typeof data.estimatedStockKg === "number" ? data.estimatedStockKg : 0;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">Paiement & Récapitulatif</h3>

      <Card className="p-3 sm:p-4 space-y-4">
        <h4 className="font-medium">Informations de paiement</h4>

        {!data.supplier ? (
          <p className="text-[hsl(var(--destructive))] text-sm">Aucun fournisseur sélectionné</p>
        ) : isCooperative ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch checked={data.payRepresentative} onCheckedChange={(checked) => onChange({ payRepresentative: checked })} />
              <Label>Le représentant reçoit le paiement</Label>
            </div>

            {data.payRepresentative ? (
              representative ? (
                <Alert variant="info"><AlertDescription><p className="font-medium">{representative.name}</p><p className="text-sm">{OPERATOR_LABELS[representative.mobileMoneyOperator]} — {maskMobileNumber(representative.mobileMoneyNumber)}</p></AlertDescription></Alert>
              ) : (
                <Alert variant="warning"><AlertDescription>Aucun représentant désigné pour cette coopérative.</AlertDescription></Alert>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Indiquez le stock (kg) apporté par chaque membre :</p>
                {members.length === 0 ? (
                  <Alert variant="warning"><AlertDescription>Aucun membre dans cette coopérative.</AlertDescription></Alert>
                ) : (
                  <>
                    <div className="-mx-3 sm:mx-0 overflow-x-auto">
                      <table className="w-full min-w-max text-sm">
                        <thead>
                          <tr className="border-b bg-[hsl(var(--muted))]/50">
                            <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Membre</th>
                            <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Opérateur</th>
                            <th className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap">Stock (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m) => {
                            const allocation = data.memberAllocations.find((a) => a.memberId === m._id);
                            return (
                              <tr key={m._id} className="border-b">
                                <td className="px-3 sm:px-4 py-2 font-medium whitespace-nowrap">
                                  {m.name}
                                  <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2 hidden sm:inline">
                                    {OPERATOR_LABELS[m.mobileMoneyOperator]}
                                  </span>
                                </td>
                                <td className="px-3 sm:px-4 py-2 whitespace-nowrap sm:hidden">
                                  <Badge variant="outline" className="text-[8px]">{OPERATOR_LABELS[m.mobileMoneyOperator]}</Badge>
                                </td>
                                <td className="px-3 sm:px-4 py-2 whitespace-nowrap hidden sm:table-cell">
                                  <Badge variant="outline">{OPERATOR_LABELS[m.mobileMoneyOperator]}</Badge>
                                </td>
                                <td className="px-3 sm:px-4 py-2">
                                  <Input
                                    type="number"
                                    className="w-24 sm:w-28 h-8"
                                    min={0}
                                    placeholder="0"
                                    value={allocation?.stockKg || ""}
                                    onChange={(e) => updateMemberStock(m._id, e.target.value ? Number(e.target.value) : 0)}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Total row */}
                    <div className="flex items-center justify-between px-1 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                        Total membres
                      </span>
                      <span className={`font-bold ${totalMemberStock > 0 && Math.abs(totalMemberStock - estimatedStock) > estimatedStock * 0.1 ? "text-[hsl(var(--warning))]" : ""}`}>
                        {totalMemberStock.toLocaleString("fr-FR")} kg
                      </span>
                    </div>
                    {estimatedStock > 0 && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Stock total estimé : {estimatedStock.toLocaleString("fr-FR")} kg
                        {totalMemberStock > 0 && Math.abs(totalMemberStock - estimatedStock) > estimatedStock * 0.1 && (
                          <span className="text-[hsl(var(--warning))] ml-1">(écart &gt; 10%)</span>
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Les informations de tous les membres sont collectées quel que soit le mode de paiement.</p>
          </div>
        ) : (
          producerData ? (
            <Alert variant="info"><AlertDescription><p className="font-medium">{producerData.name}</p><p className="text-sm">{OPERATOR_LABELS[producerData.mobileMoneyOperator as MobileMoneyOperator]} — {maskMobileNumber(producerData.mobileMoneyNumber)}</p></AlertDescription></Alert>
          ) : (
            <div className="flex justify-center py-2"><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block" /></div>
          )
        )}
      </Card>

      <Card className="p-3 sm:p-4 space-y-3">
        <h4 className="font-medium">Récapitulatif de la collecte</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-[hsl(var(--muted-foreground))]">Date :</span> <span className="font-medium">{formatDate(new Date(data.date).getTime())}</span></div>
          <div><span className="text-[hsl(var(--muted-foreground))]">Fournisseur :</span> <span className="font-medium">{data.supplier?.name ?? "—"}</span>
            {data.supplier && <Badge variant="outline" className="ml-1 text-[10px]">{data.supplier.type === "cooperative" ? "Coop" : "Individuel"}</Badge>}
          </div>
          <div><span className="text-[hsl(var(--muted-foreground))]">Localisation :</span> <span className="font-medium">{data.location || "—"}</span></div>
          <div><span className="text-[hsl(var(--muted-foreground))]">Sacs en stock :</span> <span className="font-medium">{data.bagsInStock || "—"}</span></div>
          <div><span className="text-[hsl(var(--muted-foreground))]">Stock estimé :</span> <span className="font-medium">{data.estimatedStockKg ? `${Number(data.estimatedStockKg).toLocaleString("fr-FR")} kg` : "—"}</span></div>
          <div><span className="text-[hsl(var(--muted-foreground))]">Sacs échantillonnés :</span> <span className="font-medium">{data.bagsSampled || "—"}</span></div>
          <div><span className="text-[hsl(var(--muted-foreground))]">Photos :</span> <span className="font-medium">{data.photos.length} photo{data.photos.length > 1 ? "s" : ""}</span></div>
          {isCooperative && <div><span className="text-[hsl(var(--muted-foreground))]">Paiement :</span> <span className="font-medium">{data.payRepresentative ? "Au représentant" : "Individuel par membre"}</span></div>}
        </div>
      </Card>
    </div>
  );
}
