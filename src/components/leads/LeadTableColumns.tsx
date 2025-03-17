
import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BanIcon, Flag } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadStageActions } from './LeadStageActions';
import { LeadActions } from './LeadActions';
import { Lead, Note } from './types';
import { ActionButton } from './action-buttons/ActionButton';

interface CreateLeadColumnsProps {
  onEditLead?: (updatedLead: Lead) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
  onMoveToNextStage?: (lead: Lead) => void;
  onFlagLead?: (leadId: string, flagged: boolean) => void;
  onToggleDoNotContact?: (leadId: string) => void;
}

export const createLeadColumns = ({
  onEditLead,
  onAddNote,
  onMoveToNextStage,
  onFlagLead,
  onToggleDoNotContact
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
      const lead = row.original;
      return (
        <div className="flex items-center gap-2">
          {onToggleDoNotContact && (
            <ActionButton 
              onClick={() => onToggleDoNotContact(lead.id)}
              icon={Flag}
              label={lead.doNotContact ? "Remove Do Not Contact Flag" : "Flag as Do Not Contact"}
              colorClasses={lead.doNotContact ? "text-red-600 hover:text-red-700 hover:bg-red-100 fill-red-500" : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"}
            />
          )}
          <LeadActions 
            lead={lead} 
            onEdit={onEditLead || (() => {})}
            onAddNote={onAddNote || (() => {})}
          />
        </div>
      );
    },
  },
];
