import { NavLink } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/constants";
import { ROLE_LABELS } from "@/lib/constants";
import {
  BarChart3,
  PlusCircle,
  Users,
  CheckCircle,
  ClipboardList,
  Search,
  TrendingUp,
  FileText,
  UserCog,
  Calendar,
  Wallet,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
  badgeStatus?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", path: "/", icon: BarChart3, roles: ["technicien", "agent_bureau"] },
  { label: "Nouvelle collecte", path: "/collections/new", icon: PlusCircle, roles: ["technicien", "agent_bureau"] },
  { label: "Fournisseurs", path: "/suppliers", icon: Users, roles: ["technicien", "agent_bureau"] },
  { label: "Validation", path: "/validation", icon: CheckCircle, roles: ["agent_bureau"], badgeStatus: "soumis" },
  { label: "Mes décisions", path: "/my-decisions", icon: ClipboardList, roles: ["agent_bureau"] },
  { label: "Validation direction", path: "/direction/validation", icon: Search, roles: ["direction"], badgeStatus: "en_attente_direction" },
  { label: "Dashboard", path: "/dashboard", icon: TrendingUp, roles: ["direction"] },
  { label: "Rapports", path: "/reports", icon: FileText, roles: ["direction"] },
  { label: "Utilisateurs", path: "/admin/users", icon: UserCog, roles: ["admin"] },
  { label: "Campagnes", path: "/admin/campaigns", icon: Calendar, roles: ["admin"] },
  { label: "Paiements", path: "/admin/payments", icon: Wallet, roles: ["admin"], badgeStatus: "payment_pending" },
  { label: "Audit", path: "/admin/audit", icon: ScrollText, roles: ["admin"] },
];

function NavBadge({ status }: { status: string }) {
  const collectionCount = useQuery(
    api.queries.collections.countByStatus,
    status !== "payment_pending" ? { status: status as any } : "skip",
  );
  const paymentCount = useQuery(
    api.queries.payments.listByStatus,
    status === "payment_pending" ? { status: "en_attente" } : "skip",
  );
  const count =
    status === "payment_pending"
      ? (paymentCount as any[])?.length ?? 0
      : (collectionCount as number) ?? 0;

  if (!count) return null;
  return <Badge variant="default" className="text-[10px] h-5 min-w-5 justify-center">{count}</Badge>;
}

interface SidebarProps {
  userRole: Role | null;
  onNavigate?: () => void;
}

export function Sidebar({ userRole, onNavigate }: SidebarProps) {
  const filteredItems = userRole
    ? NAV_ITEMS.filter((item) => item.roles.includes(userRole))
    : [];

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--sn-neutral))] text-[hsl(var(--sn-neutral-foreground))]">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight uppercase">LOCAGRI PAY</h1>
        {userRole && (
          <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">{ROLE_LABELS[userRole]}</p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "hover:bg-white/10",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badgeStatus && <NavBadge status={item.badgeStatus} />}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-xs opacity-50">
        v0.1.0
      </div>
    </div>
  );
}
