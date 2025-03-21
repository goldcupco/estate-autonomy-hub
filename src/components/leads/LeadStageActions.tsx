
import React from 'react';
import { Button } from "@/components/ui/button";
import { Flag, ArrowRight, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lead } from './types';
import { getNextStage } from './LeadData';

interface LeadStageActionsProps {
  lead: Lead;
  onFlagLead?: (leadId: string, flagged: boolean) => void;
  onMoveToNextStage?: (lead: Lead) => void;
}

export function LeadStageActions({ 
  lead, 
  onFlagLead, 
  onMoveToNextStage 
}: LeadStageActionsProps) {
  const nextStage = getNextStage(lead.status);
  
  if (!nextStage) return null;

  // Simplified logic - no more complex conditions that might cause re-renders
  const isReady = Boolean(lead.flaggedForNextStage);

  const handleFlagLead = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!onFlagLead) return;
    onFlagLead(lead.id, !lead.flaggedForNextStage);
  };

  const handleMoveToNextStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!onMoveToNextStage) return;
    onMoveToNextStage(lead);
  };
  
  return (
    <div className="flex items-center gap-1 h-7">
      <span className="text-sm font-medium truncate">{nextStage}</span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              size="icon" 
              className={`h-7 w-7 p-0 ${lead.flaggedForNextStage ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' : 'hover:bg-slate-100'}`}
              onClick={handleFlagLead}
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
      
      {isReady && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button"
                variant="outline" 
                size="icon" 
                className="h-7 w-7 p-0 bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                onClick={handleMoveToNextStage}
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
      
      {!isReady && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-muted-foreground cursor-help">
                <AlertCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flag the lead to move it to the next stage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
