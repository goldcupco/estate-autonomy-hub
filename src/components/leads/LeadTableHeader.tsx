
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, PhoneOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadTableHeaderProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

export function LeadTableHeader({ globalFilter, setGlobalFilter }: LeadTableHeaderProps) {
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [doNotContactFilter, setDoNotContactFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const clearFilter = () => {
    setGlobalFilter("");
    setDoNotContactFilter("all");
    setStatusFilter([]);
  };

  const handleDoNotContactFilterChange = (value: string) => {
    setDoNotContactFilter(value);
    
    // Create a new filter string without any previous doNotContact filters
    let newFilter = globalFilter
      .replace(/doNotContact:true\s*/g, '')
      .replace(/doNotContact:false\s*/g, '')
      .trim();
    
    // Add the appropriate filter based on the selected value
    if (value === "donotcontact") {
      newFilter = newFilter ? `${newFilter} doNotContact:true` : "doNotContact:true";
    } else if (value === "cancontact") {
      newFilter = newFilter ? `${newFilter} doNotContact:false` : "doNotContact:false";
    }
    
    // Update the global filter
    setGlobalFilter(newFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    let newStatusFilter: string[];
    
    // Check if status is already in the filter
    if (statusFilter.includes(status)) {
      // If it is, remove it
      newStatusFilter = statusFilter.filter(s => s !== status);
    } else {
      // If it's not, add it
      newStatusFilter = [...statusFilter, status];
    }
    
    setStatusFilter(newStatusFilter);
    
    // Remove any existing status filters from the global filter
    let newFilter = globalFilter
      .replace(/status:(New|Contacted|Qualified|Negotiating|Closed|Lost)\s*/g, '')
      .trim();
    
    // Add each selected status to the filter
    if (newStatusFilter.length > 0) {
      const statusFilterString = newStatusFilter
        .map(s => `status:${s}`)
        .join(' ');
      
      newFilter = newFilter 
        ? `${newFilter} ${statusFilterString}` 
        : statusFilterString;
    }
    
    // Update the global filter
    setGlobalFilter(newFilter);
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
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <PhoneOff className="h-4 w-4 mr-2 text-muted-foreground" />
          <Select value={doNotContactFilter} onValueChange={handleDoNotContactFilterChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Contact Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="donotcontact">Do Not Contact</SelectItem>
              <SelectItem value="cancontact">Can Contact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={statusFilter.length > 0 ? "bg-primary text-primary-foreground" : ""}>
              <Filter className="mr-2 h-4 w-4" />
              Filter {statusFilter.length > 0 && `(${statusFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem 
              checked={statusFilter.includes('New')}
              onCheckedChange={() => handleStatusFilterChange('New')}
            >
              New
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter.includes('Contacted')}
              onCheckedChange={() => handleStatusFilterChange('Contacted')}
            >
              Contacted
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter.includes('Qualified')}
              onCheckedChange={() => handleStatusFilterChange('Qualified')}
            >
              Qualified
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter.includes('Negotiating')}
              onCheckedChange={() => handleStatusFilterChange('Negotiating')}
            >
              Negotiating
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter.includes('Closed')}
              onCheckedChange={() => handleStatusFilterChange('Closed')}
            >
              Closed
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={statusFilter.includes('Lost')}
              onCheckedChange={() => handleStatusFilterChange('Lost')}
            >
              Lost
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
