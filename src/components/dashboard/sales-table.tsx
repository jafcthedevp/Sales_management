'use client'

import { useState, useTransition } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react'

import type { Sale } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface SalesTableProps {
  initialData: Sale[]
  total: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  isLoading?: boolean
}

export function SalesTable({
  initialData,
  total,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onSortChange,
  isLoading = false,
}: SalesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: 'cel_vendedor',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(column.getIsSorted() === 'asc')
              onSortChange('cel_vendedor', newOrder)
            }}
          >
            Vendedor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('cel_vendedor')}</div>
      ),
    },
    {
      accessorKey: 'numero_cliente',
      header: 'N° Cliente',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('numero_cliente')}</div>
      ),
    },
    {
      accessorKey: 'nombre_cliente',
      header: 'Nombre Cliente',
      cell: ({ row }) => {
        const nombre = row.getValue('nombre_cliente') as string | null
        return (
          <div className="text-sm">
            {nombre || <span className="text-muted-foreground">-</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'metodo_pago',
      header: 'Método Pago',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('metodo_pago')}</Badge>
      ),
    },
    {
      accessorKey: 'metodo_pago_1',
      header: 'Método Pago 2',
      cell: ({ row }) => {
        const metodo = row.getValue('metodo_pago_1') as string | null
        return metodo ? (
          <Badge variant="outline">{metodo}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      },
    },
    {
      accessorKey: 'monto',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(column.getIsSorted() === 'asc')
              onSortChange('monto', newOrder)
            }}
          >
            Monto
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const monto = parseFloat(row.getValue('monto'))
        const formatted = new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
        }).format(monto)

        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: 'region',
      header: 'Región',
      cell: ({ row }) => {
        const region = row.getValue('region') as string | null
        if (!region) return <span className="text-muted-foreground text-sm">-</span>

        return (
          <Badge variant={region === 'LIMA' ? 'default' : 'secondary'}>
            {region}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'fecha_venta',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
              column.toggleSorting(column.getIsSorted() === 'asc')
              onSortChange('fecha_venta', newOrder)
            }}
          >
            Fecha Venta
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_venta') as string | null
        if (!fecha) return <span className="text-muted-foreground text-sm">-</span>

        try {
          return (
            <div className="text-sm">
              {format(new Date(fecha), 'dd/MM/yyyy', { locale: es })}
            </div>
          )
        } catch {
          return <span className="text-muted-foreground text-sm">-</span>
        }
      },
    },
  ]

  const table = useReactTable({
    data: initialData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: totalPages,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium">
            {initialData.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          a{' '}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, total)}
          </span>{' '}
          de <span className="font-medium">{total}</span> resultados
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
