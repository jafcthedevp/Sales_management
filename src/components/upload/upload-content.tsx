'use client'

import { useState } from 'react'
import { FileUploader } from './file-uploader'
import { PreviewTable } from './preview-table'
import { UploadResults } from './upload-results'
import { UploadLogs } from './upload-logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export interface ParsedSale {
  cel_vendedor: string
  numero_cliente: string
  nombre_cliente?: string | null
  metodo_pago: string
  metodo_pago_1?: string | null
  monto: number | string
  region?: 'LIMA' | 'PROVINCIA' | null
  fecha_reporte?: string | null
}

export function UploadContent() {
  const [parsedData, setParsedData] = useState<ParsedSale[]>([])
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileParsed = (data: ParsedSale[]) => {
    setParsedData(data)
    setUploadResult(null) // Reset result when new file is loaded
  }

  const handleUploadComplete = (result: any) => {
    setUploadResult(result)
    if (result.success) {
      setParsedData([]) // Clear data on successful upload
    }
  }

  const handleReset = () => {
    setParsedData([])
    setUploadResult(null)
  }

  return (
    <div className="space-y-6">
      <Alert className="shadow-md">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-base">
          Solo los administradores pueden cargar archivos Excel. El formato debe incluir las columnas: <strong>CEL VENDEDOR, NÚMERO CLIENTE, MÉTODO PAGO, MONTO, REGIÓN</strong>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Cargar Archivo</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* File Uploader */}
          {!parsedData.length && !uploadResult && (
            <FileUploader onFileParsed={handleFileParsed} />
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && !uploadResult && (
            <PreviewTable
              data={parsedData}
              onUpload={handleUploadComplete}
              onCancel={handleReset}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          )}

          {/* Upload Results */}
          {uploadResult && (
            <UploadResults result={uploadResult} onReset={handleReset} />
          )}
        </TabsContent>

        <TabsContent value="history">
          <UploadLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
