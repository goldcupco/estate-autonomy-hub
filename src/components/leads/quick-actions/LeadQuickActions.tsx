
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
        onClick={onOpenCall}
        className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-200"
      >
        <Phone className="h-4 w-4" />
        <span>Quick Call</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onOpenSms}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 border-blue-200"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Quick SMS</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onOpenLetter}
        className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 border-amber-200"
      >
        <FileText className="h-4 w-4" />
        <span>Quick Letter</span>
      </Button>
    </>
  );
}
