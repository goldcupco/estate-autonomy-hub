
import React from 'react';
import { Button } from "@/components/ui/button";
import { Flag, ArrowRight, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lead } from './LeadTable';
import { getNextStage } from './LeadUtils';

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

  const handleFlagLead = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("LeadStageActions: handleFlagLead", lead.id, !lead.flaggedForNextStage);
    if (onFlagLead) {
      onFlagLead(lead.id, !lead.flaggedForNextStage);
    } else {
      console.error("onFlagLead callback is not provided");
    }
  };

  const handleMoveToNextStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("LeadStageActions: handleMoveToNextStage", lead);
    if (onMoveToNextStage) {
      onMoveToNextStage(lead);
    } else {
      console.error("onMoveToNextStage callback is not provided");
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{nextStage}</span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-7 w-7 transition-colors duration-200 ${lead.flaggedForNextStage ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' : 'hover:bg-slate-100'}`}
              onClick={handleFlagLead}
            >
              <Flag className={`h-4 w-4 transition-colors duration-200 ${lead.flaggedForNextStage ? 'fill-amber-500' : ''}`} />
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
                className="h-7 w-7 bg-green-100 text-green-800 border-green-300 hover:bg-green-200 transition-colors duration-200"
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
      
      {!lead.readyToMove && !lead.flaggedForNextStage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 text-muted-foreground cursor-help">
                <AlertCircle className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Not ready to move to next stage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
