
import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadStageActions } from './LeadStageActions';
import { LeadActions } from './LeadActions';
import { Lead, Note } from './LeadTable';

interface CreateLeadColumnsProps {
  onEditLead?: (updatedLead: Lead) => void;
  onDeleteLead?: (id: string) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
  onMoveToNextStage?: (lead: Lead) => void;
  onFlagLead?: (leadId: string, flagged: boolean) => void;
}

export const createLeadColumns = ({
  onEditLead,
  onDeleteLead,
  onAddNote,
  onMoveToNextStage,
  onFlagLead
}: CreateLeadColumnsProps): ColumnDef<Lead>[] => [
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
      return <LeadStatusBadge status={status} />;
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
      return (
        <LeadStageActions 
          lead={lead} 
          onFlagLead={onFlagLead} 
          onMoveToNextStage={onMoveToNextStage} 
        />
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
