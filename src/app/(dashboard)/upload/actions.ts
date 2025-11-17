'use server'

import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/dal'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

type SaleInsert = Database['public']['Tables']['sales']['Insert']

// Esquema de validación para cada fila del Excel
const saleRowSchema = z.object({
  cel_vendedor: z.string().min(1, 'CEL vendedor requerido'),
  numero_cliente: z.string().min(1, 'Número cliente requerido'),
  nombre_cliente: z.string().optional().nullable(),
  metodo_pago: z.string().min(1, 'Método de pago requerido'),
  metodo_pago_1: z.string().optional().nullable(),
  monto: z.number().positive('Monto debe ser positivo'),
  region: z.enum(['LIMA', 'PROVINCIA']).nullable().optional(),
  fecha_venta: z.string().nullable().optional(),
})

export interface UploadResult {
  success: boolean
  message: string
  totalRows: number
  successCount: number
  errorCount: number
  errors: Array<{
    row: number
    error: string
    data?: any
  }>
}

/**
 * Procesar y guardar datos del Excel
 */
export async function uploadSalesData(
  salesData: any[]
): Promise<UploadResult> {
  // Verificar que el usuario sea admin
  const user = await verifyAdmin()

  if (!user) {
    return {
      success: false,
      message: 'No tienes permisos para realizar esta acción',
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    }
  }

  const supabase = await createClient()
  const errors: UploadResult['errors'] = []
  const validSales: SaleInsert[] = []

  // Validar cada fila
  salesData.forEach((row, index) => {
    try {
      // Limpiar el monto si viene con formato "S/.XXX,XX"
      let monto = row.monto
      if (typeof monto === 'string') {
        monto = parseFloat(
          monto
            .replace('S/.', '')
            .replace(/,/g, '')
            .trim()
        )
      }

      const validatedRow = saleRowSchema.parse({
        ...row,
        monto,
        nombre_cliente: row.nombre_cliente || null,
        metodo_pago_1: row.metodo_pago_1 || null,
        region: row.region || null,
        fecha_venta: row.fecha_venta || null,
      })

      validSales.push({
        ...validatedRow,
        created_by: user.id,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push({
          row: index + 2, // +2 porque Excel empieza en 1 y tiene header
          error: error.issues.map((e: z.ZodIssue) => e.message).join(', '),
          data: row,
        })
      } else {
        errors.push({
          row: index + 2,
          error: 'Error desconocido al validar la fila',
          data: row,
        })
      }
    }
  })

  // Si no hay datos válidos, retornar error
  if (validSales.length === 0) {
    return {
      success: false,
      message: 'No se encontraron datos válidos para importar',
      totalRows: salesData.length,
      successCount: 0,
      errorCount: errors.length,
      errors,
    }
  }

  // Insertar en la base de datos por lotes
  const BATCH_SIZE = 100
  let successCount = 0

  for (let i = 0; i < validSales.length; i += BATCH_SIZE) {
    const batch = validSales.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from('sales')
      .insert(batch)
      .select()

    if (error) {
      console.error('Error inserting batch:', error)
      // Agregar errores del batch
      batch.forEach((_, batchIndex) => {
        errors.push({
          row: i + batchIndex + 2,
          error: `Error al insertar: ${error.message}`,
        })
      })
    } else {
      successCount += data?.length || 0
    }
  }

  // Crear log de carga
  const { error: logError } = await supabase
    .from('upload_logs')
    .insert({
      filename: `upload_${new Date().toISOString()}.xlsx`,
      uploaded_by: user.id,
      records_count: salesData.length,
      success_count: successCount,
      error_count: errors.length,
      errors_detail: errors.length > 0 ? errors : null,
      status: errors.length === 0 ? 'completed' : errors.length < salesData.length ? 'partial' : 'failed',
    })

  if (logError) {
    console.error('Error creating upload log:', logError)
  }

  return {
    success: successCount > 0,
    message:
      successCount === salesData.length
        ? `¡Éxito! Se importaron ${successCount} registros.`
        : successCount > 0
        ? `Se importaron ${successCount} de ${salesData.length} registros. ${errors.length} registros con errores.`
        : 'Error: No se pudo importar ningún registro.',
    totalRows: salesData.length,
    successCount,
    errorCount: errors.length,
    errors,
  }
}

/**
 * Obtener logs de carga
 */
export async function getUploadLogs() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('upload_logs')
    .select(`
      *,
      uploaded_by_profile:profiles!upload_logs_uploaded_by_fkey (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching upload logs:', error)
    return []
  }

  return data || []
}
