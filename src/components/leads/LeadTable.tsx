import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Flag, 
  ArrowRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LeadActions } from './LeadActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";

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

const getNextStage = (currentStatus: Lead['status']): Lead['status'] | null => {
  const statusFlow: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed', 'Lost'];
  const currentIndex = statusFlow.indexOf(currentStatus);
  
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 2) {
    return null;
  }
  
  return statusFlow[currentIndex + 1];
};

const isLeadReadyToMove = (lead: Lead): boolean => {
  if (!lead.notes || lead.notes.length === 0) return false;
  
  switch (lead.status) {
    case 'New':
      return lead.notes.some(note => ['sms', 'call', 'letter'].includes(note.type));
    case 'Contacted':
      const communicationTypes = new Set(lead.notes
        .filter(note => ['sms', 'call', 'letter'].includes(note.type))
        .map(note => note.type));
      return communicationTypes.size >= 2;
    case 'Qualified':
      return lead.notes.some(note => note.type === 'contract');
    case 'Negotiating':
      return lead.notes.filter(note => note.type === 'contract').length >= 2;
    default:
      return false;
  }
};

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

  const processedData = data.map(lead => ({
    ...lead,
    readyToMove: isLeadReadyToMove(lead)
  }));

  const handleMoveToNextStage = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    console.log("LeadTable: handleMoveToNextStage", lead);
    if (onMoveToNextStage) {
      onMoveToNextStage(lead);
    } else {
      console.error("onMoveToNextStage callback is not provided");
    }
  };

  const handleFlagLead = (e: React.MouseEvent, leadId: string, flagged: boolean) => {
    e.stopPropagation();
    console.log("LeadTable: handleFlagLead", leadId, flagged);
    if (onFlagLead) {
      onFlagLead(leadId, flagged);
    } else {
      console.error("onFlagLead callback is not provided");
    }
  };

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Name
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Qualified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Negotiating': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Closed': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
            case 'Lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
          }
        };
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "dateAdded",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Date Added
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        );
      },
    },
    {
      accessorKey: "lastContact",
      header: "Last Contact",
    },
    {
      id: 'nextStage',
      header: "Next Stage",
      cell: ({ row }) => {
        const lead = row.original;
        const nextStage = getNextStage(lead.status);
        
        if (!nextStage) return null;
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{nextStage}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={`h-7 w-7 ${lead.flaggedForNextStage ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}`}
                    onClick={(e) => handleFlagLead(e, lead.id, !lead.flaggedForNextStage)}
                  >
                    <Flag className={`h-4 w-4 ${lead.flaggedForNextStage ? 'fill-amber-500' : ''}`} />
                    <span className="sr-only">Flag for {nextStage}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{lead.flaggedForNextStage ? 'Unflag' : 'Flag'} for {nextStage}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {(lead.readyToMove || lead.flaggedForNextStage) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7 bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                      onClick={(e) => handleMoveToNextStage(e, lead)}
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="sr-only">Move to {nextStage}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Move to {nextStage}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return onEditLead && onDeleteLead && onAddNote ? (
          <LeadActions 
            lead={row.original} 
            onEdit={onEditLead} 
            onDelete={onDeleteLead}
            onAddNote={onAddNote}
          />
        ) : null;
      },
    },
  ];

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
      <div className="flex justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

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
