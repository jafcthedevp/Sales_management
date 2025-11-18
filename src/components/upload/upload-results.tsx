'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, RotateCcw } from 'lucide-react'
import type { UploadResult } from '@/app/(dashboard)/upload/actions'

interface UploadResultsProps {
  result: UploadResult
  onReset: () => void
}

export function UploadResults({ result, onReset }: UploadResultsProps) {
  const { success, message, totalRows, successCount, errorCount, errors } = result

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          {success ? (
            <>
              <CheckCircle2 className="h-7 w-7 text-green-500" />
              Importación Completada
            </>
          ) : (
            <>
              <XCircle className="h-7 w-7 text-red-500" />
              Importación con Errores
            </>
          )}
        </CardTitle>
        <CardDescription className="text-base mt-2">{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-muted p-6 rounded-lg shadow-md">
            <p className="text-base text-muted-foreground font-medium mb-2">Total</p>
            <p className="text-3xl font-bold">{totalRows}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg shadow-md">
            <p className="text-base text-green-600 dark:text-green-400 font-medium mb-2">Exitosos</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg shadow-md">
            <p className="text-base text-red-600 dark:text-red-400 font-medium mb-2">Errores</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{errorCount}</p>
          </div>
        </div>

        {/* Errores */}
        {errorCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Se encontraron {errorCount} error(es)</AlertTitle>
            <AlertDescription className="mt-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {errors.slice(0, 20).map((err, idx) => (
                  <div key={idx} className="text-sm border-l-2 border-red-500 pl-3 py-1">
                    <p className="font-medium">Fila {err.row}: {err.error}</p>
                    {err.data && (
                      <p className="text-xs opacity-75 mt-1">
                        Datos: {JSON.stringify(err.data).substring(0, 100)}...
                      </p>
                    )}
                  </div>
                ))}
                {errors.length > 20 && (
                  <p className="text-sm opacity-75">... y {errors.length - 20} errores más</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={onReset} size="lg" className="w-full shadow-md">
          <RotateCcw className="mr-2 h-5 w-5" />
          Cargar Otro Archivo
        </Button>
      </CardContent>
    </Card>
  )
}
