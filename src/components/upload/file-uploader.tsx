'use client'

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import * as XLSX from 'xlsx'
import type { ParsedSale } from './upload-content'

interface FileUploaderProps {
  onFileParsed: (data: ParsedSale[]) => void
}

export function FileUploader({ onFileParsed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const parseExcelFile = useCallback(
    async (file: File) => {
      try {
        setError(null)
        setInfo(null)

        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        // Mapeo de headers
        const headerMap: Record<string, string> = {
          'cel vendedor': 'cel_vendedor',
          'numero cliente': 'numero_cliente',
          'nombre cliente': 'nombre_cliente',
          'metodo pago': 'metodo_pago',
          'metodo pago 1': 'metodo_pago_1',
          'monto': 'monto',
          'region': 'region',
        }

        const requiredColumns = ['metodo_pago', 'monto']

        // Buscar en todas las hojas una que tenga los encabezados correctos
        let validSheet: XLSX.WorkSheet | null = null
        let validSheetName: string | null = null
        let validJsonData: any[][] | null = null
        let validColumnIndices: Record<string, number> | null = null

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
          }) as any[][]

          if (jsonData.length < 2) continue

          // Obtener headers (primera fila)
          const headers = jsonData[0].map((h: any) =>
            String(h || '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim()
          )

          // Encontrar índices de columnas
          const columnIndices: Record<string, number> = {}
          headers.forEach((header, index) => {
            const mappedKey = headerMap[header]
            if (mappedKey) {
              columnIndices[mappedKey] = index
            }
          })

          // Verificar si tiene las columnas requeridas
          const hasRequiredColumns = requiredColumns.every(
            (col) => columnIndices[col] !== undefined
          )

          if (hasRequiredColumns) {
            validSheet = worksheet
            validSheetName = sheetName
            validJsonData = jsonData
            validColumnIndices = columnIndices
            break
          }
        }

        // Si no se encontró ninguna hoja válida
        if (!validSheet || !validJsonData || !validColumnIndices) {
          setError(
            `No se encontró ninguna hoja con las columnas requeridas (MÉTODO PAGO y MONTO). El archivo tiene ${workbook.SheetNames.length} hoja(s): ${workbook.SheetNames.join(', ')}`
          )
          return
        }

        // Mostrar info de qué hoja se está usando
        if (workbook.SheetNames.length > 1) {
          setInfo(`Se detectó automáticamente la hoja "${validSheetName}" con el formato correcto`)
        }

        // Procesar filas de datos (omitir header)
        const parsedData: ParsedSale[] = validJsonData
          .slice(1)
          .filter((row) => row && row.length > 0 && row.some((cell) => cell !== null && cell !== ''))
          .map((row) => ({
            cel_vendedor: validColumnIndices!.cel_vendedor !== undefined
              ? String(row[validColumnIndices!.cel_vendedor] || '').trim()
              : '',
            numero_cliente: validColumnIndices!.numero_cliente !== undefined
              ? String(row[validColumnIndices!.numero_cliente] || '').trim()
              : '',
            nombre_cliente: validColumnIndices!.nombre_cliente !== undefined && row[validColumnIndices!.nombre_cliente]
              ? String(row[validColumnIndices!.nombre_cliente]).trim()
              : null,
            metodo_pago: String(row[validColumnIndices!.metodo_pago] || '').trim(),
            metodo_pago_1: validColumnIndices!.metodo_pago_1 !== undefined && row[validColumnIndices!.metodo_pago_1]
              ? String(row[validColumnIndices!.metodo_pago_1]).trim()
              : null,
            monto: row[validColumnIndices!.monto] || 0,
            region:
              validColumnIndices!.region !== undefined &&
              row[validColumnIndices!.region] &&
              ['LIMA', 'PROVINCIA'].includes(String(row[validColumnIndices!.region]).toUpperCase())
                ? (String(row[validColumnIndices!.region]).toUpperCase() as 'LIMA' | 'PROVINCIA')
                : null,
          }))

        if (parsedData.length === 0) {
          setError('No se encontraron datos válidos en el archivo')
          return
        }

        onFileParsed(parsedData)
      } catch (err) {
        console.error('Error parsing Excel:', err)
        setError('Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido (.xlsx)')
      }
    },
    [onFileParsed]
  )

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Solo se aceptan archivos Excel (.xlsx, .xls)')
        return
      }

      setSelectedFile(file)
      parseExcelFile(file)
    },
    [parseExcelFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar Archivo Excel</CardTitle>
        <CardDescription>
          Arrastra un archivo o haz clic para seleccionar. Formato aceptado: .xlsx, .xls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12
            flex flex-col items-center justify-center
            transition-colors cursor-pointer
            ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <FileSpreadsheet className={`h-16 w-16 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-lg font-medium mb-2">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">o</p>
          <Button
            onClick={() => document.getElementById('file-input')?.click()}
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            Seleccionar Archivo
          </Button>
          <input
            title='Seleccionar archivo Excel'
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium">Formato Esperado:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li><strong>MÉTODO PAGO</strong> (requerido)</li>
            <li><strong>MONTO</strong> (requerido)</li>
            <li>CEL VENDEDOR (opcional)</li>
            <li>NÚMERO CLIENTE (opcional)</li>
            <li>NOMBRE CLIENTE (opcional)</li>
            <li>MÉTODO PAGO 1 (opcional)</li>
            <li>REGIÓN (opcional: LIMA o PROVINCIA)</li>
            <li>FECHA VENTA (opcional)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
