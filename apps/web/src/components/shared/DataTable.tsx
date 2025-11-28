// apps/web/src/components/shared/DataTable.tsx
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  PaginationState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  title?: string;
  showPagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  emptyState,
  title,
  showPagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState(searchValue);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
      {/* Filters Header */}
      {(onSearchChange || filters.length > 0) && (
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            {onSearchChange && (
              <div className={`relative ${filters.length > 0 ? 'md:col-span-2' : 'md:col-span-4'}`}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73]"
                />
              </div>
            )}
            
            {/* Dynamic Filters */}
            {filters.map((filter, index) => (
              <Select key={index} value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </CardHeader>
      )}

      <CardContent className="flex flex-col gap-4">
        {/* Table Title & Page Size Selector */}
        {(title || showPagination) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {title && (
              <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                {title} ({data.length})
              </CardTitle>
            )}
            
            {showPagination && (
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-32 border-[#6CAC73]/20">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-[#6CAC73]/20 overflow-hidden">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[#6CAC73]/20 bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left p-4 font-semibold text-[#2B4A2F] font-poppins"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    {emptyState ? (
                      <div className="flex flex-col items-center gap-3">
                        {emptyState.icon}
                        <p className="text-gray-500 font-medium font-poppins">
                          {emptyState.title}
                        </p>
                        <p className="text-gray-400 text-sm font-nunito">
                          {emptyState.description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 font-nunito">No data found</p>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#6CAC73]/10 hover:bg-gray-50/50 transition-colors last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && table.getRowModel().rows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#6CAC73]/20">
            {/* Showing range */}
            <div className="text-sm text-gray-500 font-nunito">
              Showing{' '}
              <span className="font-semibold text-[#2B4A2F]">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[#2B4A2F]">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  data.length
                )}
              </span>{' '}
              of <span className="font-semibold text-[#2B4A2F]">{data.length}</span> results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                Page{' '}
                <span className="font-semibold text-[#2B4A2F]">
                  {table.getState().pagination.pageIndex + 1}
                </span>{' '}
                of <span className="font-semibold text-[#2B4A2F]">{table.getPageCount()}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                    let pageIndex;
                    if (table.getPageCount() <= 5) {
                      pageIndex = i;
                    } else {
                      const startPage = Math.max(
                        0,
                        Math.min(
                          table.getPageCount() - 5,
                          table.getState().pagination.pageIndex - 2
                        )
                      );
                      pageIndex = startPage + i;
                    }

                    return (
                      <Button
                        key={pageIndex}
                        variant={
                          table.getState().pagination.pageIndex === pageIndex
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`min-w-9 h-9 p-0 ${
                          table.getState().pagination.pageIndex === pageIndex
                            ? 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white border-0'
                            : 'border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10'
                        }`}
                      >
                        {pageIndex + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}