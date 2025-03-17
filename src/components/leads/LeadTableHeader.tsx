
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadTableHeaderProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function LeadTableHeader({ globalFilter, setGlobalFilter }: LeadTableHeaderProps) {
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  
  const clearFilter = () => {
    setGlobalFilter("");
  };

  return (
    <div className="flex justify-between items-center">
      <div className="relative w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8 text-sm"
        />
        {globalFilter && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full" 
            onClick={clearFilter}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem>
            New
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Contacted
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Qualified
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Negotiating
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Closed
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Lost
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
