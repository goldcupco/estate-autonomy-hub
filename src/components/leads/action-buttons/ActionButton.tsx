
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  onClick: (e: React.MouseEvent) => void;
  icon: LucideIcon;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  colorClasses?: string;
}

export function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant = "ghost",
  colorClasses = ""
}: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="button"
            variant={variant}
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
            className={`h-8 w-8 inline-flex items-center justify-center ${colorClasses}`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
