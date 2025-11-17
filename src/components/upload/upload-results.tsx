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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {success ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Importación Completada
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              Importación con Errores
            </>
          )}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totalRows}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Exitosos</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">Errores</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</p>
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

        <Button onClick={onReset} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Cargar Otro Archivo
        </Button>
      </CardContent>
    </Card>
  )
}
