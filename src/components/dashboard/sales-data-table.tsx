'use client'

import { useState, useTransition } from 'react'
import type { Sale } from '@/types/database.types'
import type { SalesFilters } from '@/app/(dashboard)/ventas/actions'
import { getSales } from '@/app/(dashboard)/ventas/actions'
import { SalesTable } from './sales-table'
import { SalesFilters as FiltersComponent } from './sales-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SalesDataTableProps {
  initialSales: Sale[]
  initialTotal: number
  initialPage: number
  initialPageSize: number
  initialTotalPages: number
  vendedores: string[]
  metodosPago: string[]
  metodosPago1: string[]
}

export function SalesDataTable({
  initialSales,
  initialTotal,
  initialPage,
  initialPageSize,
  initialTotalPages,
  vendedores,
  metodosPago,
  metodosPago1,
}: SalesDataTableProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [total, setTotal] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize] = useState(initialPageSize)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [filters, setFilters] = useState<SalesFilters>({})
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isPending, startTransition] = useTransition()

  const fetchSales = async (
    newFilters: SalesFilters = filters,
    page: number = currentPage,
    newSortBy: string = sortBy,
    newSortOrder: 'asc' | 'desc' = sortOrder
  ) => {
    startTransition(async () => {
      try {
        const response = await getSales(newFilters, {
          page,
          pageSize,
          sortBy: newSortBy,
          sortOrder: newSortOrder,
        })

        setSales(response.sales)
        setTotal(response.total)
        setCurrentPage(response.page)
        setTotalPages(response.totalPages)
      } catch (error) {
        console.error('Error fetching sales:', error)
      }
    })
  }

  const handleFiltersChange = (newFilters: SalesFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset a primera página cuando cambian los filtros
    fetchSales(newFilters, 1, sortBy, sortOrder)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchSales(filters, page, sortBy, sortOrder)
  }

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    fetchSales(filters, currentPage, newSortBy, newSortOrder)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Ventas</CardTitle>
          <CardDescription>
            Visualiza, filtra y administra todas las ventas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <FiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            vendedores={vendedores}
            metodosPago={metodosPago}
            metodosPago1={metodosPago1}
          />

          {/* Tabla */}
          <SalesTable
            initialData={sales}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            isLoading={isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
