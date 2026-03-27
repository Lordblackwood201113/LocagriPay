import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  searchPlaceholder?: string;
  searchColumn?: string;
  pageSize?: number;
  filterSlot?: React.ReactNode;
}

function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-3 sm:px-4 py-3"><Skeleton className="h-4 w-full" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={100} className="text-center py-12">
        <div className="flex justify-center mb-3">{icon}</div>
        <p className="text-[hsl(var(--muted-foreground))] text-sm">{message}</p>
      </td>
    </tr>
  );
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (!direction) return <span className="opacity-30 ml-1">&#8597;</span>;
  return <span className="ml-1">{direction === "asc" ? "&#9650;" : "&#9660;"}</span>;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Aucune donnée",
  emptyIcon = <Package className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />,
  searchPlaceholder = "Rechercher...",
  searchColumn,
  pageSize = 10,
  filterSlot,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter: searchColumn ? undefined : globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        <Input
          className="w-full sm:max-w-xs"
          placeholder={searchPlaceholder}
          value={searchColumn ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? "" : globalFilter}
          onChange={(e) => {
            if (searchColumn) table.getColumn(searchColumn)?.setFilterValue(e.target.value);
            else setGlobalFilter(e.target.value);
          }}
        />
        {filterSlot}
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-sm border">
        <table className="w-full min-w-max text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-[hsl(var(--muted))]/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 sm:px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] whitespace-nowrap",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-[hsl(var(--foreground))]",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon direction={header.column.getIsSorted()} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows columns={columns.length} />
            ) : table.getRowModel().rows.length === 0 ? (
              <EmptyState message={emptyMessage} icon={emptyIcon} />
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr key={row.id} className={cn("border-b transition-colors hover:bg-[hsl(var(--muted))]/50", i % 2 === 1 && "bg-[hsl(var(--muted))]/25")}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
            {table.getFilteredRowModel().rows.length} résultat{table.getFilteredRowModel().rows.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>&laquo;</Button>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>&lsaquo;</Button>
            <span className="text-xs font-bold px-2 tabular-nums">{currentPage + 1}/{totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>&rsaquo;</Button>
            <Button variant="outline" size="sm" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>&raquo;</Button>
          </div>
        </div>
      )}
    </div>
  );
}
