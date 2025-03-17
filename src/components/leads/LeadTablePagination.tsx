
import React from 'react';
import { Button } from "@/components/ui/button";

interface LeadTablePaginationProps {
  tableRowCount: number;
  totalRowCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function LeadTablePagination({
  tableRowCount,
  totalRowCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage
}: LeadTablePaginationProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="text-sm text-muted-foreground">
        Showing {tableRowCount} of {totalRowCount} leads
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
