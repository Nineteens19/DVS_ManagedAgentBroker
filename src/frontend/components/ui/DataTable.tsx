'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  filterFn?: (row: T, search: string) => boolean;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'ค้นหาข้อมูล...',
  filterFn,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    if (filterFn) return data.filter((row) => filterFn(row, searchTerm.toLowerCase()));

    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some(
        (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, filterFn]);

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      return sortAsc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
  }, [filteredData, sortKey, sortAsc]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white border border-[#CED4DA] text-[#212529] placeholder-gray-400 focus:outline-none focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/20 transition-all shadow-sm h-[42px]"
          />
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>

      {/* Table Container - Fits 100% width cleanly */}
      <div className="deves-card overflow-hidden !p-0 w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DEE2E6] bg-[#F8F9FA] text-[11px] font-semibold text-[#6C757D] uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.accessorKey)}
                  className={`py-3 px-3.5 ${col.sortable ? 'cursor-pointer select-none hover:text-[#012169]' : ''} ${
                    col.className || ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.accessorKey && (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-[#012169]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#012169]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEE2E6]/60 text-xs">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={col.width ? { width: col.width } : undefined}
                      className={`py-3 px-3.5 text-[#212529] ${col.className || ''}`}
                    >
                      {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '-') : '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#6C757D]">
                  <Inbox className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-sm">ไม่พบข้อมูลที่ค้นหา</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#DEE2E6] bg-[#F8F9FA] text-xs text-[#6C757D]">
          <div>
            แสดง {sortedData.length > 0 ? (page - 1) * pageSize + 1 : 0} ถึง{' '}
            {Math.min(page * pageSize, sortedData.length)} จากทั้งหมด {sortedData.length} รายการ
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[#DEE2E6] bg-white text-[#212529] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 shadow-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#212529]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[#DEE2E6] bg-white text-[#212529] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 shadow-sm transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
