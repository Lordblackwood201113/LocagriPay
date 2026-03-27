import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MemberList } from "@/components/supplier/member-list";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CooperativeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const data = useQuery(api.queries.cooperatives.getWithMembers, id ? { id: id as any } : "skip");

  if (data === undefined) {
    return (
      <div className="flex justify-center py-12">
        <span className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full inline-block" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6 text-center">
        <p className="text-[hsl(var(--destructive))]">Coopérative non trouvée</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate("/suppliers")}>
          Retour aux fournisseurs
        </Button>
      </div>
    );
  }

  const { members, ...cooperative } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/suppliers")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-lg sm:text-2xl font-bold truncate">{cooperative.name}</h1>
        <Badge variant="secondary">Coopérative</Badge>
      </div>

      {/* Info card */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Téléphone</p>
            <p className="font-medium mt-0.5">{cooperative.phone}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Localisation</p>
            <p className="font-medium mt-0.5">{cooperative.location || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Créée le</p>
            <p className="font-medium mt-0.5">{formatDate(cooperative.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-sm border bg-[hsl(var(--card))] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-4 sm:p-6">
        <MemberList
          cooperativeId={cooperative._id}
          members={members}
          representativeId={cooperative.representativeId}
        />
      </div>
    </div>
  );
}
