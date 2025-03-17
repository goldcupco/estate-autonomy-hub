
import React from 'react';
import { flexRender, HeaderGroup } from "@tanstack/react-table";
import { Lead } from './LeadTable';

interface LeadTableHeaderRowProps {
  headerGroups: HeaderGroup<Lead>[];
}

export function LeadTableHeaderRow({ headerGroups }: LeadTableHeaderRowProps) {
  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr 
          key={headerGroup.id}
          className="border-b bg-secondary/50"
        >
          {headerGroup.headers.map((header) => (
            <th 
              key={header.id}
              className="px-4 py-3 text-left font-medium"
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}
