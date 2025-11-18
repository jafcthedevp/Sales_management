'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react'
import { exportSales, getSalesSummary } from '@/app/(dashboard)/export/actions'
import { getFilterOptions } from '@/app/(dashboard)/ventas/actions'
import type { SalesFilters } from '@/app/(dashboard)/ventas/actions'

interface FilterOptionsData {
  vendedores: string[]
  metodosPago: string[]
  metodosPago1: string[]
  regiones: readonly string[]
}

const AVAILABLE_COLUMNS = [
  { id: 'id', label: 'ID', default: false },
  { id: 'cel_vendedor', label: 'CEL VENDEDOR', default: true },
  { id: 'numero_cliente', label: 'NÚMERO CLIENTE', default: true },
  { id: 'nombre_cliente', label: 'NOMBRE CLIENTE', default: true },
  { id: 'metodo_pago', label: 'MÉTODO PAGO', default: true },
  { id: 'metodo_pago_1', label: 'MÉTODO PAGO 1', default: false },
  { id: 'monto', label: 'MONTO', default: true },
  { id: 'region', label: 'REGIÓN', default: true },
  { id: 'fecha_reporte', label: 'FECHA REPORTE', default: true },
  { id: 'fecha_venta', label: 'FECHA VENTA', default: false },
  { id: 'created_at', label: 'FECHA CREACIÓN', default: false },
  { id: 'updated_at', label: 'FECHA ACTUALIZACIÓN', default: false },
]

export function ExportForm() {
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState<SalesFilters>({})
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter((col) => col.default).map((col) => col.id)
  )
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>({
    vendedores: [],
    metodosPago: [],
    metodosPago1: [],
    regiones: ['LIMA', 'PROVINCIA'] as const,
  })
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [summary, setSummary] = useState<{ count: number; total: number; average: number } | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)

  // Cargar opciones de filtros
  useEffect(() => {
    async function loadFilterOptions() {
      const options = await getFilterOptions()
      setFilterOptions(options)
    }
    loadFilterOptions()
  }, [])

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]
    )
  }

  const handleSelectAllColumns = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map((col) => col.id))
  }

  const handleDeselectAllColumns = () => {
    setSelectedColumns([])
  }

  const handleCalculateSummary = async () => {
    setIsLoadingSummary(true)
    try {
      const summaryData = await getSalesSummary(filters)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error calculating summary:', error)
      setSummary(null)
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      setResult({
        success: false,
        message: 'Debes seleccionar al menos una columna para exportar',
      })
      return
    }

    startTransition(async () => {
      try {
        const exportResult = await exportSales({
          filters,
          columns: selectedColumns,
          format: 'xlsx',
        })

        setResult({
          success: exportResult.success,
          message: exportResult.message,
        })

        if (exportResult.success && exportResult.downloadUrl && exportResult.fileName) {
          // Descargar archivo
          const link = document.createElement('a')
          link.href = exportResult.downloadUrl
          link.download = exportResult.fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        console.error('Error exporting:', error)
        setResult({
          success: false,
          message: 'Error al exportar los datos',
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Resultado */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Filtros de Exportación</CardTitle>
          <CardDescription className="text-base">
            Aplica filtros para exportar solo los registros que necesitas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda general */}
            <div className="space-y-2">
              <Label htmlFor="search">Búsqueda General</Label>
              <Input
                id="search"
                placeholder="Buscar en todos los campos..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Vendedor */}
            <div className="space-y-2">
              <Label htmlFor="vendedor">Vendedor</Label>
              <Select
                value={filters.cel_vendedor || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, cel_vendedor: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger id="vendedor">
                  <SelectValue placeholder="Todos los vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los vendedores</SelectItem>
                  {filterOptions.vendedores.map((vendedor) => (
                    <SelectItem key={vendedor} value={vendedor}>
                      {vendedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="metodo-pago">Método de Pago</Label>
              <Select
                value={filters.metodo_pago || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, metodo_pago: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger id="metodo-pago">
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  {filterOptions.metodosPago.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Método de Pago 1 */}
            <div className="space-y-2">
              <Label htmlFor="metodo-pago-1">Método de Pago 1</Label>
              <Select
                value={filters.metodo_pago_1 || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, metodo_pago_1: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger id="metodo-pago-1">
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  {filterOptions.metodosPago1.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Región */}
            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <Select
                value={filters.region || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    region: value === 'all' ? undefined : (value as 'LIMA' | 'PROVINCIA'),
                  })
                }
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Todas las regiones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las regiones</SelectItem>
                  <SelectItem value="LIMA">Lima</SelectItem>
                  <SelectItem value="PROVINCIA">Provincia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Desde */}
            <div className="space-y-2">
              <Label htmlFor="fecha-desde">Fecha Desde</Label>
              <Input
                id="fecha-desde"
                type="date"
                value={filters.fecha_desde || ''}
                onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-2">
              <Label htmlFor="fecha-hasta">Fecha Hasta</Label>
              <Input
                id="fecha-hasta"
                type="date"
                value={filters.fecha_hasta || ''}
                onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
              />
            </div>

            {/* Monto Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="monto-min">Monto Mínimo</Label>
              <Input
                id="monto-min"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.monto_min || ''}
                onChange={(e) =>
                  setFilters({ ...filters, monto_min: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>

            {/* Monto Máximo */}
            <div className="space-y-2">
              <Label htmlFor="monto-max">Monto Máximo</Label>
              <Input
                id="monto-max"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.monto_max || ''}
                onChange={(e) =>
                  setFilters({ ...filters, monto_max: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          <Button
            variant="outline"
            onClick={() => setFilters({})}
            className="w-full"
          >
            Limpiar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Selección de Columnas */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Columnas a Exportar</CardTitle>
          <CardDescription className="text-base">
            Selecciona las columnas que deseas incluir en el archivo Excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAllColumns}>
              Seleccionar Todo
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAllColumns}>
              Deseleccionar Todo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_COLUMNS.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => handleColumnToggle(column.id)}
                />
                <Label
                  htmlFor={column.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {selectedColumns.length} columna(s) seleccionada(s)
          </p>
        </CardContent>
      </Card>

      {/* Resumen de Datos */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Resumen de Datos</CardTitle>
          <CardDescription className="text-base">
            Visualiza el total de dinero antes de exportar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleCalculateSummary}
            disabled={isLoadingSummary}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Calculator className="mr-2 h-5 w-5" />
            {isLoadingSummary ? 'Calculando...' : 'Calcular Resumen'}
          </Button>

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border bg-card p-6 text-center shadow-md">
                <p className="text-base text-muted-foreground font-medium mb-2">Registros</p>
                <p className="text-3xl font-bold">{summary.count.toLocaleString('es-PE')}</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center shadow-md">
                <p className="text-base text-muted-foreground font-medium mb-2">Total</p>
                <p className="text-3xl font-bold text-primary">
                  S/. {summary.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center shadow-md">
                <p className="text-base text-muted-foreground font-medium mb-2">Promedio</p>
                <p className="text-3xl font-bold">
                  S/. {summary.average.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón de Exportar */}
      {selectedColumns.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Debes seleccionar al menos una columna para exportar
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleExport}
        disabled={isPending || selectedColumns.length === 0}
        className="w-full shadow-md"
        size="lg"
      >
        <Download className="mr-2 h-5 w-5" />
        {isPending ? 'Exportando...' : 'Exportar a Excel'}
      </Button>
    </div>
  )
}
