import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "@/components/shared/data-table";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCog } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface UserRow { _id: string; name: string; email: string; role: Role; zone?: string; isActive: boolean; createdAt: number; }

export default function UsersPage() {
  const users = useQuery(api.queries.users.list, {});
  const updateUser = useMutation(api.mutations.users.updateUser);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState<Role>("technicien");
  const [editZone, setEditZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  const handleEdit = (user: UserRow) => { setEditUser(user); setEditRole(user.role); setEditZone(user.zone ?? ""); };

  const handleSave = async () => {
    if (!editUser) return;
    setLoading(true);
    try { await updateUser({ userId: editUser._id as any, role: editRole, zone: editZone.trim() || undefined }); setEditUser(null); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setLoading(false); }
  };

  const handleToggleActive = async (user: UserRow) => {
    if (!confirm(`Voulez-vous ${user.isActive ? "désactiver" : "réactiver"} le compte de ${user.name} ?`)) return;
    try { await updateUser({ userId: user._id as any, isActive: !user.isActive }); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
  };

  const filteredUsers = roleFilter ? (users as UserRow[])?.filter((u) => u.role === roleFilter) ?? [] : (users as UserRow[]) ?? [];

  const columns: ColumnDef<UserRow, unknown>[] = [
    { accessorKey: "name", header: "Nom", cell: ({ getValue, row }) => (
      <div className="flex items-center gap-2">
        <span className={`font-medium ${!row.original.isActive ? "opacity-50 line-through" : ""}`}>{getValue() as string}</span>
        {!row.original.isActive && <Badge variant="destructive" className="text-[10px]">Inactif</Badge>}
      </div>
    )},
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Rôle", cell: ({ getValue }) => <Badge variant="outline">{ROLE_LABELS[getValue() as Role]}</Badge> },
    { accessorKey: "zone", header: "Zone", cell: ({ getValue }) => (getValue() as string) || "—" },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="xs" onClick={() => handleEdit(row.original)}>Modifier</Button>
        <Button variant={row.original.isActive ? "warning" : "success"} size="xs" onClick={() => handleToggleActive(row.original)}>
          {row.original.isActive ? "Désactiver" : "Réactiver"}
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Gestion des utilisateurs</h1>

      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier {editUser?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rôle</Label>
              <select className="flex h-10 sm:h-9 w-full rounded-sm border border-[hsl(var(--input))] bg-transparent px-3 py-1 text-base sm:text-sm" value={editRole} onChange={(e) => setEditRole(e.target.value as Role)}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Zone d'intervention</Label>
              <Input value={editZone} onChange={(e) => setEditZone(e.target.value)} placeholder="Ex: Kaolack, Zone Nord" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditUser(null)} disabled={loading}>Annuler</Button>
            <Button onClick={handleSave} disabled={loading}>{loading && <Spinner size="sm" />} Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns} data={filteredUsers} isLoading={users === undefined}
        searchColumn="name" searchPlaceholder="Rechercher par nom..." emptyMessage="Aucun utilisateur" emptyIcon={<UserCog className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />}
        filterSlot={
          <select className="flex h-8 rounded-md border border-[hsl(var(--input))] bg-transparent px-2 py-1 text-xs" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tous les rôles</option>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        }
      />
    </div>
  );
}
