
import React from 'react';
import { flexRender, RowModel } from "@tanstack/react-table";
import { Lead } from './types';

interface LeadTableBodyProps {
  getRowModel: () => RowModel<Lead>;
  columnsLength: number;
}

export function LeadTableBody({ 
  getRowModel, 
  columnsLength
}: LeadTableBodyProps) {
  return (
    <tbody>
      {getRowModel().rows.length ? (
        getRowModel().rows.map((row, i) => {
          const lead = row.original;
          const isReadyToMove = Boolean(lead.readyToMove);
          const isFlagged = Boolean(lead.flaggedForNextStage);
          
          let highlightClass = '';
          if (isReadyToMove && !isFlagged) {
            highlightClass = 'bg-blue-50';
          } else if (isFlagged) {
            highlightClass = 'bg-amber-50';
          }
          
          return (
            <tr
              key={row.id}
              className={`border-b hover:bg-muted/50 transition-colors ${highlightClass}`}
              style={{ 
                animationDelay: `${i * 50}ms`,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
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
