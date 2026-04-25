import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, getRowKey, emptyMessage = "Nenhum registro encontrado." }: DataTableProps<T>) {
  return (
    <div className="max-w-full overflow-hidden rounded-lg border border-border/70 bg-card/70">
      <div className="w-full overflow-x-auto">
      <Table className="min-w-[760px]">
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("h-11 text-xs font-semibold uppercase tracking-[0.14em]", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={getRowKey(row)} className="border-border/70 hover:bg-muted/25">
                {columns.map((column) => (
                  <TableCell key={column.key} className={cn("align-middle", column.className)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
