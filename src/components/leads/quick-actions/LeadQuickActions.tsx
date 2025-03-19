
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, FileText } from 'lucide-react';

interface LeadQuickActionsProps {
  onOpenCall: () => void;
  onOpenSms: () => void;
  onOpenLetter: () => void;
}

export function LeadQuickActions({ onOpenCall, onOpenSms, onOpenLetter }: LeadQuickActionsProps) {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenCall();
        }}
        className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-200 whitespace-nowrap"
      >
        <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Quick Call</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenSms();
        }}
        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 border-blue-200 whitespace-nowrap"
      >
        <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Quick SMS</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenLetter();
        }}
        className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-100 border-amber-200 whitespace-nowrap"
      >
        <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Quick Letter</span>
      </Button>
    </>
  );
}
