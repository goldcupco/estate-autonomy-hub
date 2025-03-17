
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from './LeadUtils';

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const statusColorClass = getStatusColor(status);
  
  return (
    <Badge className={`${statusColorClass} transition-all duration-200 hover:scale-105 font-medium`}>
      {status}
    </Badge>
  );
}
