
import React from 'react';
import { flexRender, RowModel } from "@tanstack/react-table";
import { Lead } from './types';
import { useNavigate } from 'react-router-dom';

interface LeadTableBodyProps {
  getRowModel: () => RowModel<Lead>;
  columnsLength: number;
}

export function LeadTableBody({ 
  getRowModel, 
  columnsLength
}: LeadTableBodyProps) {
  const navigate = useNavigate();

  // Handle click on lead data
  const handleLeadClick = (leadId: string) => {
    navigate(`/lead/${leadId}`);
  };

  return (
    <tbody>
      {getRowModel().rows.length ? (
        getRowModel().rows.map((row, i) => {
          const lead = row.original;
          const isFlagged = Boolean(lead.flaggedForNextStage);
          
          // Simplified row highlighting
          const highlightClass = isFlagged ? 'bg-amber-50' : '';
          
          return (
            <tr
              key={row.id}
              className={`border-b hover:bg-muted/50 transition-colors ${highlightClass}`}
              style={{ 
                animationDelay: `${i * 50}ms`,
              }}
            >
              {row.getVisibleCells().map((cell) => {
                // Make specific columns clickable to navigate to lead detail
                const isClickableColumn = ['name', 'email', 'phone', 'status', 'source', 'dateAdded', 'lastContact'].includes(cell.column.id);
                
                return (
                  <td 
                    key={cell.id} 
                    className={`px-4 py-3 min-w-[80px] ${isClickableColumn ? 'cursor-pointer hover:text-primary hover:underline' : ''}`}
                    onClick={isClickableColumn ? () => handleLeadClick(lead.id) : undefined}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan={columnsLength}
            className="h-24 text-center text-muted-foreground"
          >
            No results.
          </td>
        </tr>
      )}
    </tbody>
  );
}
