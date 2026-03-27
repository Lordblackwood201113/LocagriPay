import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { User, Building2, ChevronDown } from "lucide-react";

export interface SelectedSupplier {
  id: string;
  type: "individual" | "cooperative";
  name: string;
}

interface SupplierPickerProps {
  value: SelectedSupplier | null;
  onChange: (supplier: SelectedSupplier | null) => void;
}

interface SearchResult { _id: string; name: string; phone?: string; location?: string; }

export function SupplierPicker({ value, onChange }: SupplierPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Always load all suppliers for the dropdown
  const allProducers = useQuery(api.queries.producers.list, {});
  const allCooperatives = useQuery(api.queries.cooperatives.list);

  // Search queries for when user types 2+ chars (faster search index)
  const searchedProducers = useQuery(api.queries.producers.search, searchTerm.length >= 2 ? { term: searchTerm } : "skip");
  const searchedCooperatives = useQuery(api.queries.cooperatives.search, searchTerm.length >= 2 ? { term: searchTerm } : "skip");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (supplier: SelectedSupplier) => { onChange(supplier); setSearchTerm(""); setIsOpen(false); };
  const handleClear = () => { onChange(null); setSearchTerm(""); };

  // Use search results if user typed 2+ chars, else filter from full list
  let producerResults: SearchResult[];
  let cooperativeResults: SearchResult[];

  if (searchTerm.length >= 2) {
    producerResults = (searchedProducers ?? []) as SearchResult[];
    cooperativeResults = (searchedCooperatives ?? []) as SearchResult[];
  } else if (searchTerm.length === 1) {
    // Client-side filter on first character
    const term = searchTerm.toLowerCase();
    producerResults = ((allProducers ?? []) as SearchResult[]).filter((p) => p.name.toLowerCase().includes(term));
    cooperativeResults = ((allCooperatives ?? []) as SearchResult[]).filter((c) => c.name.toLowerCase().includes(term));
  } else {
    // No search term — show all
    producerResults = (allProducers ?? []) as SearchResult[];
    cooperativeResults = (allCooperatives ?? []) as SearchResult[];
  }

  const hasResults = producerResults.length > 0 || cooperativeResults.length > 0;
  const isLoading = allProducers === undefined || allCooperatives === undefined;

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 h-10 sm:h-9 rounded-sm border border-[hsl(var(--input))] px-3 text-sm min-w-0">
          <Badge variant="outline" className="text-[10px] shrink-0">
            {value.type === "cooperative" ? <><Building2 className="h-3 w-3 mr-0.5 inline" /> Coop</> : <><User className="h-3 w-3 mr-0.5 inline" /> Ind.</>}
          </Badge>
          <span className="font-medium truncate">{value.name}</span>
        </div>
        <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={handleClear}>Changer</Button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Sélectionner un fournisseur..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          onClick={() => { setIsOpen(!isOpen); inputRef.current?.focus(); }}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[hsl(var(--popover))] border rounded-sm shadow-lg max-h-[60vh] sm:max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center"><Spinner size="sm" /></div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-[hsl(var(--muted-foreground))] text-sm">
              Aucun fournisseur trouvé{searchTerm && ` pour "${searchTerm}"`}
            </div>
          ) : (
            <>
              {producerResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] sticky top-0">
                    <User className="h-3 w-3 mr-1 inline" /> Producteurs ({producerResults.length})
                  </div>
                  {producerResults.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted))]/80 flex items-center gap-2 text-sm border-b border-[hsl(var(--border))]/50 last:border-0"
                      onClick={() => handleSelect({ id: p._id, type: "individual", name: p.name })}
                    >
                      <User className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{p.name}</span>
                        {p.location && <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2">{p.location}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {cooperativeResults.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] sticky top-0">
                    <Building2 className="h-3 w-3 mr-1 inline" /> Coopératives ({cooperativeResults.length})
                  </div>
                  {cooperativeResults.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-[hsl(var(--muted))] active:bg-[hsl(var(--muted))]/80 flex items-center gap-2 text-sm border-b border-[hsl(var(--border))]/50 last:border-0"
                      onClick={() => handleSelect({ id: c._id, type: "cooperative", name: c.name })}
                    >
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{c.name}</span>
                        {c.location && <span className="text-xs text-[hsl(var(--muted-foreground))] ml-2">{c.location}</span>}
                      </div>
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
