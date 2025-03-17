import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { LeadTableHeader } from './LeadTableHeader';
import { LeadTableHeaderRow } from './LeadTableHeaderRow';
import { LeadTableBody } from './LeadTableBody';
import { LeadTablePagination } from './LeadTablePagination';
import { createLeadColumns } from './LeadTableColumns';
import { isLeadReadyToMove } from './LeadUtils';
import { Lead, Note } from './types';

// Re-export the types for backward compatibility
export type { Lead, Note };

interface LeadTableProps {
  data: Lead[];
  onEditLead?: (updatedLead: Lead) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
  onMoveToNextStage?: (lead: Lead) => void;
  onFlagLead?: (leadId: string, flagged: boolean) => void;
}

export function LeadTable({ 
  data, 
  onEditLead, 
  onAddNote, 
  onMoveToNextStage,
  onFlagLead
}: LeadTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const { toast } = useToast();

  // Process data to check if leads are ready to move
  const processedData = data.map(lead => ({
    ...lead,
    readyToMove: isLeadReadyToMove(lead)
  }));

  // Create table columns
  const columns = createLeadColumns({
    onEditLead,
    onAddNote,
    onMoveToNextStage,
    onFlagLead
  });

  // Initialize table
  const table = useReactTable({
    data: processedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <LeadTableHeader 
        globalFilter={globalFilter} 
        setGlobalFilter={setGlobalFilter} 
      />

      <div className="glass-card rounded-lg border animate-scale-in">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <LeadTableHeaderRow headerGroups={table.getHeaderGroups()} />
            <LeadTableBody 
              getRowModel={table.getRowModel} 
              columnsLength={columns.length}
            />
          </table>
        </div>
        <LeadTablePagination 
          tableRowCount={table.getFilteredRowModel().rows.length}
          totalRowCount={data.length}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
        />
      </div>
    </div>
  );
}

export default LeadTable;
