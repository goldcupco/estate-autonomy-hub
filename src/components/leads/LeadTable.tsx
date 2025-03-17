
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
  onToggleDoNotContact?: (leadId: string, doNotContact: boolean) => void; 
}

export function LeadTable({ 
  data, 
  onEditLead, 
  onAddNote, 
  onMoveToNextStage,
  onFlagLead,
  onToggleDoNotContact 
}: LeadTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Simplified data processing - no more complex ready to move calculations
  const processedData = data;

  // Custom filter function to handle the "Do Not Contact" filter
  const fuzzyFilter: FilterFn<Lead> = (row, columnId, value, addMeta) => {
    // If no value is set, return true for all rows
    if (!value) return true;

    // Check for doNotContact specific filters
    const doNotContactTrueFilter = value.includes("doNotContact:true");
    const doNotContactFalseFilter = value.includes("doNotContact:false");
    
    if (doNotContactTrueFilter || doNotContactFalseFilter) {
      const leadDoNotContact = row.original.doNotContact === true;
      
      // If we're filtering for doNotContact:true, then we only want records where doNotContact is true
      if (doNotContactTrueFilter && !leadDoNotContact) {
        return false;
      }
      
      // If we're filtering for doNotContact:false, then we only want records where doNotContact is false or undefined
      if (doNotContactFalseFilter && leadDoNotContact) {
        return false;
      }
      
      // For other filter criteria, continue processing below
      // First, remove the doNotContact filter parts from the value
      const cleanValue = value
        .replace(/doNotContact:true\s*/g, '')
        .replace(/doNotContact:false\s*/g, '')
        .trim();
        
      if (!cleanValue) {
        // If there's nothing left in the filter after removing doNotContact parts,
        // and we passed the doNotContact check above, this row is a match
        return true;
      }
      
      // If there's more filter criteria, continue with normal text search
      value = cleanValue;
    }
    
    // For regular text search
    const searchText = String(row.getValue(columnId) || "").toLowerCase();
    return searchText.includes(value.toLowerCase());
  };

  // Create table columns
  const columns = createLeadColumns({
    onEditLead,
    onAddNote,
    onMoveToNextStage,
    onFlagLead,
    onToggleDoNotContact
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
