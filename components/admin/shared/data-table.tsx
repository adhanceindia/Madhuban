'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react'

export type DataTableProps<TRow> = {
  columns: ColumnDef<TRow, unknown>[]
  data: TRow[]
  loading?: boolean
  emptyState?: React.ReactNode
  pageSize?: number
  /** Pass a function to enable CSV export. Returns 2-d data: first row = headers. */
  exportRows?: () => (string | number)[][]
  exportFileName?: string
}

export function DataTable<TRow>({
  columns,
  data,
  loading,
  emptyState,
  pageSize = 20,
  exportRows,
  exportFileName = 'export.csv',
}: DataTableProps<TRow>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  function downloadCsv() {
    if (!exportRows) return
    const rows = exportRows()
    const csv = rows
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-card rounded-2xl p-5 font-admin shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
      {exportRows && data.length > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-card border border-border text-foreground hover:bg-sage-soft rounded-lg transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none ${
                        canSort ? 'cursor-pointer hover:text-foreground' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && <ArrowUpDown size={10} className="text-muted-foreground/40" />}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState || (
                    <div className="text-center py-10 text-muted-foreground text-[12px]">
                      No records found.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/50 hover:bg-sage-soft/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-4 text-[12px] text-muted-foreground">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{' '}
            {data.length} records
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-md hover:bg-sage-soft disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-md hover:bg-sage-soft disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
