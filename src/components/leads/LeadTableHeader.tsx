
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface LeadTableHeaderProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function LeadTableHeader({ globalFilter, setGlobalFilter }: LeadTableHeaderProps) {
  return (
    <div className="flex justify-between">
      <div className="relative w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8 text-sm"
        />
      </div>
    </div>
  );
}
