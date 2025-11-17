'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Upload, X, Calendar } from 'lucide-react'
import { uploadSalesData } from '@/app/(dashboard)/upload/actions'
import type { ParsedSale } from './upload-content'

interface PreviewTableProps {
  data: ParsedSale[]
  onUpload: (result: any) => void
  onCancel: () => void
  isUploading: boolean
  setIsUploading: (value: boolean) => void
}

export function PreviewTable({ data, onUpload, onCancel, isUploading, setIsUploading }: PreviewTableProps) {
  const [isPending, startTransition] = useTransition()
  const [fechaReporte, setFechaReporte] = useState(() => {
    // Por defecto, la fecha de hoy en formato YYYY-MM-DD
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const handleUpload = () => {
    if (!fechaReporte) {
      alert('Por favor selecciona la fecha del reporte')
      return
    }

    setIsUploading(true)
    startTransition(async () => {
      try {
        const result = await uploadSalesData(data, fechaReporte)
        onUpload(result)
      } catch (error) {
        console.error('Error uploading:', error)
        onUpload({
          success: false,
          message: 'Error al cargar los datos',
          totalRows: data.length,
          successCount: 0,
          errorCount: data.length,
          errors: [],
        })
      } finally {
        setIsUploading(false)
      }
    })
  }

  // Mostrar solo las primeras 10 filas en la preview
  const previewData = data.slice(0, 10)
  const hasMore = data.length > 10

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista Previa de Datos</CardTitle>
        <CardDescription>
          Se encontraron {data.length} registros. Revisa la información antes de importar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mostrando {previewData.length} de {data.length} registros. Verifica que los datos sean correctos antes de continuar.
          </AlertDescription>
        </Alert>

        {/* Selector de Fecha del Reporte */}
        <Card className="bg-muted/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="fecha-reporte" className="text-base font-semibold">
                  Fecha del Reporte
                </Label>
                <p className="text-sm text-muted-foreground">
                  Selecciona la fecha a la que pertenecen estos datos (no la fecha de hoy)
                </p>
              </div>
              <div className="w-48">
                <Input
                  id="fecha-reporte"
                  type="date"
                  value={fechaReporte}
                  onChange={(e) => setFechaReporte(e.target.value)}
                  className="text-base font-medium"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>N° Cliente</TableHead>
                <TableHead>Nombre Cliente</TableHead>
                <TableHead>Método Pago</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Región</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{row.cel_vendedor}</TableCell>
                  <TableCell>{row.numero_cliente}</TableCell>
                  <TableCell>{row.nombre_cliente || '-'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{row.metodo_pago}</Badge>
                      {row.metodo_pago_1 && (
                        <Badge variant="outline" className="ml-1">
                          {row.metodo_pago_1}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof row.monto === 'number'
                      ? `S/. ${row.monto.toFixed(2)}`
                      : row.monto}
                  </TableCell>
                  <TableCell>
                    {row.region ? (
                      <Badge variant={row.region === 'LIMA' ? 'default' : 'secondary'}>
                        {row.region}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {hasMore && (
          <p className="text-sm text-muted-foreground text-center">
            ... y {data.length - 10} registros más
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isUploading || isPending}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || isPending}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading || isPending ? 'Cargando...' : `Importar ${data.length} Registros`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
