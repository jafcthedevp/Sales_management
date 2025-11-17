'use client'

import { useState } from 'react'
import { ExportForm } from './export-form'
import { ExportLogs } from './export-logs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function ExportContent() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aplica filtros para exportar solo los registros que necesitas. Selecciona las columnas que deseas incluir en el archivo Excel.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Exportar Datos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <ExportForm />
        </TabsContent>

        <TabsContent value="history">
          <ExportLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
