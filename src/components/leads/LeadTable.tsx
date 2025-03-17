
import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LeadTableHeader } from './LeadTableHeader';
import { createLeadColumns } from './LeadTableColumns';
import { isLeadReadyToMove } from './LeadUtils';

export interface Note {
  id: string;
  text: string;
  type: 'sms' | 'call' | 'letter' | 'contract' | 'other';
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Negotiating' | 'Closed' | 'Lost';
  source: string;
  dateAdded: string;
  lastContact: string;
  notes?: Note[];
  flaggedForNextStage?: boolean;
  readyToMove?: boolean;
}

interface LeadTableProps {
  data: Lead[];
  onEditLead?: (updatedLead: Lead) => void;
  onDeleteLead?: (id: string) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
  onMoveToNextStage?: (lead: Lead) => void;
  onFlagLead?: (leadId: string, flagged: boolean) => void;
}

export function LeadTable({ 
  data, 
  onEditLead, 
  onDeleteLead, 
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
    onDeleteLead,
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
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr 
                  key={headerGroup.id}
                  className="border-b bg-secondary/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th 
                      key={header.id}
                      className="px-4 py-3 text-left font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => {
                  const lead = row.original;
                  const isReadyToMove = lead.readyToMove;
                  const isFlagged = lead.flaggedForNextStage;
                  
                  let highlightClass = '';
                  if (isReadyToMove && !isFlagged) {
                    highlightClass = 'bg-blue-50';
                  } else if (isFlagged) {
                    highlightClass = 'bg-amber-50';
                  }
                  
                  return (
                    <tr
                      key={row.id}
                      className={`border-b hover:bg-muted/50 transition-colors ${highlightClass}`}
                      style={{ 
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getFilteredRowModel().rows.length} of {data.length} leads
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadTable;
