import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, PhoneOff, Phone } from 'lucide-react';
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
  onToggleDoNotContact?: (leadId: string, doNotContact: boolean) => void;
  onDeleteLead?: (leadId: string) => void;
}

export const createLeadColumns = ({
  onEditLead,
  onAddNote,
  onMoveToNextStage,
  onFlagLead,
  onToggleDoNotContact,
  onDeleteLead
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
    id: 'doNotContact',
    header: "Do Not Contact",
    cell: ({ row }) => {
      const lead = row.original;
      const doNotContact = lead.doNotContact || false;
      
      return (
        <div className="flex justify-center">
          <ActionButton
            icon={doNotContact ? PhoneOff : Phone}
            label={doNotContact ? "Remove Do Not Contact flag" : "Mark as Do Not Contact"}
            onClick={() => {
              if (onToggleDoNotContact) {
                onToggleDoNotContact(lead.id, !doNotContact);
              }
            }}
            colorClasses={doNotContact ? 'text-red-500' : 'text-gray-400'}
          />
        </div>
      );
    },
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
        <div className="flex items-center justify-end gap-1 h-7">
          <LeadActions 
            lead={lead} 
            onEdit={onEditLead}
            onAddNote={onAddNote}
            onDelete={onDeleteLead}
          />
        </div>
      );
    },
  },
];
