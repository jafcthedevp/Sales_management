'use client'

import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import type { SalesFilters } from '@/app/(dashboard)/ventas/actions'

interface SalesFiltersProps {
  filters: SalesFilters
  onFiltersChange: (filters: SalesFilters) => void
  vendedores: string[]
  metodosPago: string[]
}

export function SalesFilters({
  filters,
  onFiltersChange,
  vendedores,
  metodosPago,
}: SalesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SalesFilters>(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Sincronizar con props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof SalesFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  const clearFilters = () => {
    const emptyFilters: SalesFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const activeFiltersCount = Object.values(localFilters).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Búsqueda Global */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en todas las columnas..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-9"
          />
        </div>
        <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avanzados</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              </div>

              {/* Vendedor */}
              <div className="space-y-2">
                <Label htmlFor="vendedor">Vendedor</Label>
                <Select
                  value={localFilters.cel_vendedor || ''}
                  onValueChange={(value) =>
                    handleFilterChange('cel_vendedor', value)
                  }
                >
                  <SelectTrigger id="vendedor">
                    <SelectValue placeholder="Todos los vendedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {vendedores.map((vendedor) => (
                      <SelectItem key={vendedor} value={vendedor}>
                        {vendedor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Número de Cliente</Label>
                <Input
                  id="cliente"
                  placeholder="Filtrar por cliente..."
                  value={localFilters.numero_cliente || ''}
                  onChange={(e) =>
                    handleFilterChange('numero_cliente', e.target.value)
                  }
                />
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label htmlFor="metodo_pago">Método de Pago</Label>
                <Select
                  value={localFilters.metodo_pago || ''}
                  onValueChange={(value) =>
                    handleFilterChange('metodo_pago', value)
                  }
                >
                  <SelectTrigger id="metodo_pago">
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {metodosPago.map((metodo) => (
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
                  value={localFilters.region || ''}
                  onValueChange={(value) =>
                    handleFilterChange('region', value as 'LIMA' | 'PROVINCIA')
                  }
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Todas las regiones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="LIMA">LIMA</SelectItem>
                    <SelectItem value="PROVINCIA">PROVINCIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de Fechas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha_desde">Fecha Desde</Label>
                  <Input
                    id="fecha_desde"
                    type="date"
                    value={localFilters.fecha_desde || ''}
                    onChange={(e) =>
                      handleFilterChange('fecha_desde', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                  <Input
                    id="fecha_hasta"
                    type="date"
                    value={localFilters.fecha_hasta || ''}
                    onChange={(e) =>
                      handleFilterChange('fecha_hasta', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Rango de Montos */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="monto_min">Monto Mínimo</Label>
                  <Input
                    id="monto_min"
                    type="number"
                    placeholder="0.00"
                    value={localFilters.monto_min || ''}
                    onChange={(e) =>
                      handleFilterChange('monto_min', parseFloat(e.target.value) || undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto_max">Monto Máximo</Label>
                  <Input
                    id="monto_max"
                    type="number"
                    placeholder="0.00"
                    value={localFilters.monto_max || ''}
                    onChange={(e) =>
                      handleFilterChange('monto_max', parseFloat(e.target.value) || undefined)
                    }
                  />
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtros Activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.search && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: {localFilters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('search', '')
                  onFiltersChange({ ...localFilters, search: undefined })
                }}
              />
            </Badge>
          )}
          {localFilters.cel_vendedor && (
            <Badge variant="secondary" className="gap-1">
              Vendedor: {localFilters.cel_vendedor}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('cel_vendedor', '')
                  onFiltersChange({ ...localFilters, cel_vendedor: undefined })
                }}
              />
            </Badge>
          )}
          {localFilters.numero_cliente && (
            <Badge variant="secondary" className="gap-1">
              Cliente: {localFilters.numero_cliente}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('numero_cliente', '')
                  onFiltersChange({ ...localFilters, numero_cliente: undefined })
                }}
              />
            </Badge>
          )}
          {localFilters.metodo_pago && (
            <Badge variant="secondary" className="gap-1">
              Pago: {localFilters.metodo_pago}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('metodo_pago', '')
                  onFiltersChange({ ...localFilters, metodo_pago: undefined })
                }}
              />
            </Badge>
          )}
          {localFilters.region && (
            <Badge variant="secondary" className="gap-1">
              Región: {localFilters.region}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  handleFilterChange('region', null)
                  onFiltersChange({ ...localFilters, region: null })
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
