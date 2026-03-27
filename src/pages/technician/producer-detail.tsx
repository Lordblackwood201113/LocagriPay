import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OPERATOR_LABELS, type MobileMoneyOperator } from "@/lib/constants";
import { formatDate, maskMobileNumber } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, User, Phone, MapPin, Wallet, Calendar } from "lucide-react";

export default function ProducerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useCurrentUser();
  const producer = useQuery(api.queries.producers.getById, id ? { id: id as any } : "skip");

  const showFullNumber = role === "admin" || role === "agent_bureau";

  if (producer === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (producer === null) {
    return (
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6 text-center">
        <p className="text-[hsl(var(--destructive))]">Producteur non trouvé</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate("/suppliers")}>
          Retour aux fournisseurs
        </Button>
      </div>
    );
  }

  const p = producer as any;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/suppliers")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-lg sm:text-2xl font-bold truncate">{p.name}</h1>
        <Badge variant="outline">Producteur individuel</Badge>
      </div>

      {/* Info card */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <InfoItem icon={Phone} label="Téléphone" value={p.phone} />
          <InfoItem icon={MapPin} label="Localisation" value={p.location || "—"} />
          <InfoItem
            icon={Wallet}
            label="Mobile Money"
            value={`${OPERATOR_LABELS[p.mobileMoneyOperator as MobileMoneyOperator]} — ${showFullNumber ? p.mobileMoneyNumber : maskMobileNumber(p.mobileMoneyNumber)}`}
          />
          <InfoItem icon={Calendar} label="Enregistré le" value={formatDate(p.createdAt)} />
          {p.cooperativeId && (
            <InfoItem icon={User} label="Coopérative">
              <button
                className="font-medium text-[hsl(var(--primary))] hover:underline"
                onClick={() => navigate(`/suppliers/cooperative/${p.cooperativeId}`)}
              >
                Voir la coopérative
              </button>
            </InfoItem>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, children }: { icon: any; label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-sm bg-[hsl(var(--muted))] p-2 shrink-0">
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</p>
        {children ?? <p className="font-medium mt-0.5">{value}</p>}
      </div>
    </div>
  );
}
