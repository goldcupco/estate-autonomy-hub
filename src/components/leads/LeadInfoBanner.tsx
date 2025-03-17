
import React from 'react';
import { Info, Flag, ArrowRight } from 'lucide-react';

export function LeadInfoBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
      <div>
        <h3 className="font-medium text-blue-800">Lead stage progression</h3>
        <p className="text-sm text-blue-700 mt-1">
          Leads that are ready to move to the next stage are lightly highlighted. 
          You can manually flag leads using the <Flag className="h-3.5 w-3.5 inline mx-1" /> icon, 
          and move them to the next stage using the <ArrowRight className="h-3.5 w-3.5 inline mx-1" /> icon.
        </p>
      </div>
    </div>
  );
}
