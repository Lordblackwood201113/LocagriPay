import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { User, Building2 } from "lucide-react";

export function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const producers = useQuery(
    api.queries.producers.search,
    term.length >= 2 ? { term } : "skip",
  );
  const cooperatives = useQuery(
    api.queries.cooperatives.search,
    term.length >= 2 ? { term } : "skip",
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const producerResults = (producers ?? []) as Array<{ _id: string; name: string; phone: string }>;
  const coopResults = (cooperatives ?? []) as Array<{ _id: string; name: string }>;
  const hasResults = producerResults.length > 0 || coopResults.length > 0;
  const isSearching = term.length >= 2 && (producers === undefined || cooperatives === undefined);

  const handleSelect = (path: string) => {
    navigate(path);
    setTerm("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative hidden sm:block">
      <Input
        className="w-48 lg:w-64 h-8 text-sm"
        placeholder="Rechercher..."
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => term.length >= 2 && setIsOpen(true)}
      />

      {isOpen && term.length >= 2 && (
        <div className="absolute z-50 top-full right-0 mt-1 w-72 bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center"><Spinner size="sm" /></div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-[hsl(var(--muted-foreground))] text-sm">
              Aucun résultat pour "{term}"
            </div>
          ) : (
            <>
              {producerResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]">
                    Producteurs
                  </div>
                  {producerResults.slice(0, 5).map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-[hsl(var(--muted))] flex items-center gap-2 text-sm"
                      onClick={() => handleSelect("/suppliers")}
                    >
                      <User className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{p.phone}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {coopResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]">
                    Coopératives
                  </div>
                  {coopResults.slice(0, 5).map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-[hsl(var(--muted))] flex items-center gap-2 text-sm"
                      onClick={() => handleSelect(`/suppliers/cooperative/${c._id}`)}
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <span className="font-medium">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
