
import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";
import { LeadTableHeader } from './LeadTableHeader';
import { LeadTableHeaderRow } from './LeadTableHeaderRow';
import { LeadTableBody } from './LeadTableBody';
import { LeadTablePagination } from './LeadTablePagination';
import { createLeadColumns } from './LeadTableColumns';
import { Lead, Note } from './types';

// Re-export the types for backward compatibility
export type { Lead, Note };

interface LeadTableProps {
  data: Lead[];
  onEditLead?: (updatedLead: Lead) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
  onMoveToNextStage?: (lead: Lead) => void;
  onFlagLead?: (leadId: string, flagged: boolean) => void;
  onToggleDoNotContact?: (leadId: string, doNotContact: boolean) => void; // Renamed from onToggleDoNotCall
}

export function LeadTable({ 
  data, 
  onEditLead, 
  onAddNote, 
  onMoveToNextStage,
  onFlagLead,
  onToggleDoNotContact // Renamed from onToggleDoNotCall
}: LeadTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Simplified data processing - no more complex ready to move calculations
  const processedData = data;

  // Custom filter function to handle the "Do Not Contact" filter
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // If no value is set, return true for all rows
    if (!value) return true;

    // Handle the custom "Do Not Contact" filter
    if (value.includes("doNotContact:true") && row.original.doNotContact === true) { // Renamed from doNotCall
      return true;
    }

    if (value.includes("doNotContact:false") && row.original.doNotContact === false) { // Renamed from doNotCall
      return true;
    }

    // For other filter strings, do a basic text search on all columns
    const cleanValue = value
      .replace(/doNotContact:true\s*/g, '') // Renamed from doNotCall:true
      .replace(/doNotContact:false\s*/g, '') // Renamed from doNotCall:false
      .trim()
      .toLowerCase();
      
    if (!cleanValue) return true;
    
    const searchText = String(row.getValue(columnId) || "").toLowerCase();
    return searchText.includes(cleanValue);
  };

  // Create table columns
  const columns = createLeadColumns({
    onEditLead,
    onAddNote,
    onMoveToNextStage,
    onFlagLead,
    onToggleDoNotContact // Renamed from onToggleDoNotCall
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
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: fuzzyFilter,
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
