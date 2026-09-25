"use client";

import React from "react";

export type Column<T> = {
  header: string;
  key: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  className?: string;
};

export default function Table<T>({
  data,
  columns,
  rowKey,
  className = "min-w-full",
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-slate-100 ${className}`}>
        <thead className="bg-slate-50/80">
          <tr className="border-y border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-8 text-center text-sm text-slate-500"
              >
                No data found
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={rowKey(row)} className="group hover:bg-slate-50/80 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3.5 whitespace-nowrap text-sm text-slate-600 ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.render ? col.render(row) : ((row as any)[col.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
