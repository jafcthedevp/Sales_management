'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/dal'
import type { SalesFilters } from '../ventas/actions'
import * as XLSX from 'xlsx'

export interface ExportOptions {
  filters: SalesFilters
  columns: string[]
  format?: 'xlsx'
}

export interface ExportResult {
  success: boolean
  message: string
  downloadUrl?: string
  fileName?: string
  totalRecords?: number
  error?: string
}

/**
 * Exportar ventas a Excel
 */
export async function exportSales(options: ExportOptions): Promise<ExportResult> {
  try {
    const profile = await getUserProfile()
    const supabase = await createClient()

    // Construir query con filtros (sin paginación)
    let query = supabase.from('sales').select('*')

    // Aplicar filtros
    if (options.filters.search) {
      query = query.or(
        `cel_vendedor.ilike.%${options.filters.search}%,` +
        `numero_cliente.ilike.%${options.filters.search}%,` +
        `nombre_cliente.ilike.%${options.filters.search}%,` +
        `metodo_pago.ilike.%${options.filters.search}%`
      )
    }

    if (options.filters.cel_vendedor) {
      query = query.ilike('cel_vendedor', `%${options.filters.cel_vendedor}%`)
    }

    if (options.filters.numero_cliente) {
      query = query.ilike('numero_cliente', `%${options.filters.numero_cliente}%`)
    }

    if (options.filters.metodo_pago) {
      query = query.ilike('metodo_pago', `%${options.filters.metodo_pago}%`)
    }

    if (options.filters.metodo_pago_1) {
      query = query.ilike('metodo_pago_1', `%${options.filters.metodo_pago_1}%`)
    }

    if (options.filters.region) {
      query = query.eq('region', options.filters.region)
    }

    if (options.filters.fecha_desde) {
      query = query.gte('fecha_venta', options.filters.fecha_desde)
    }

    if (options.filters.fecha_hasta) {
      query = query.lte('fecha_venta', options.filters.fecha_hasta)
    }

    if (options.filters.monto_min !== undefined) {
      query = query.gte('monto', options.filters.monto_min)
    }

    if (options.filters.monto_max !== undefined) {
      query = query.lte('monto', options.filters.monto_max)
    }

    // Ordenar por fecha de venta
    query = query.order('fecha_venta', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching sales for export:', error)
      return {
        success: false,
        message: 'Error al obtener los datos',
        error: error.message,
      }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: 'No hay datos para exportar con los filtros seleccionados',
      }
    }

    // Mapeo de columnas a nombres legibles en español
    const columnLabels: Record<string, string> = {
      id: 'ID',
      cel_vendedor: 'CEL VENDEDOR',
      numero_cliente: 'NÚMERO CLIENTE',
      nombre_cliente: 'NOMBRE CLIENTE',
      metodo_pago: 'MÉTODO PAGO',
      metodo_pago_1: 'MÉTODO PAGO 1',
      monto: 'MONTO',
      region: 'REGIÓN',
      fecha_reporte: 'FECHA REPORTE',
      fecha_venta: 'FECHA VENTA',
      created_at: 'FECHA CREACIÓN',
      updated_at: 'FECHA ACTUALIZACIÓN',
    }

    // Filtrar y mapear datos según columnas seleccionadas
    const exportData = data.map((row) => {
      const mappedRow: Record<string, any> = {}
      options.columns.forEach((col) => {
        const label = columnLabels[col] || col
        let value = row[col as keyof typeof row]

        // Formatear valores especiales
        if (col === 'monto' && typeof value === 'number') {
          mappedRow[label] = value
        } else if (col === 'fecha_venta' && value) {
          mappedRow[label] = new Date(value as string).toLocaleDateString('es-PE')
        } else if ((col === 'created_at' || col === 'updated_at') && value) {
          mappedRow[label] = new Date(value as string).toLocaleString('es-PE')
        } else {
          mappedRow[label] = value || ''
        }
      })
      return mappedRow
    })

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas')

    // Ajustar ancho de columnas
    const colWidths = options.columns.map(() => ({ wch: 15 }))
    worksheet['!cols'] = colWidths

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const base64Data = excelBuffer.toString('base64')

    // Generar nombre de archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const fileName = `ventas_${timestamp}.xlsx`

    // Guardar log de exportación
    await supabase.from('export_logs').insert({
      exported_by: profile.id,
      records_count: data.length,
      filters_applied: {
        ...options.filters,
        columns: options.columns,
      },
      filename: fileName,
    })

    return {
      success: true,
      message: `Se exportaron ${data.length} registros exitosamente`,
      downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`,
      fileName,
      totalRecords: data.length,
    }
  } catch (err) {
    console.error('Error exporting sales:', err)
    return {
      success: false,
      message: 'Error al exportar los datos',
      error: err instanceof Error ? err.message : 'Error desconocido',
    }
  }
}

/**
 * Obtener resumen de datos filtrados (sin exportar)
 */
export async function getSalesSummary(filters: SalesFilters) {
  try {
    const supabase = await createClient()

    // Construir query con los mismos filtros que exportSales
    let query = supabase.from('sales').select('monto')

    // Aplicar los mismos filtros
    if (filters.search) {
      query = query.or(
        `cel_vendedor.ilike.%${filters.search}%,` +
        `numero_cliente.ilike.%${filters.search}%,` +
        `nombre_cliente.ilike.%${filters.search}%,` +
        `metodo_pago.ilike.%${filters.search}%`
      )
    }

    if (filters.cel_vendedor) {
      query = query.ilike('cel_vendedor', `%${filters.cel_vendedor}%`)
    }

    if (filters.numero_cliente) {
      query = query.ilike('numero_cliente', `%${filters.numero_cliente}%`)
    }

    if (filters.metodo_pago) {
      query = query.ilike('metodo_pago', `%${filters.metodo_pago}%`)
    }

    if (filters.metodo_pago_1) {
      query = query.ilike('metodo_pago_1', `%${filters.metodo_pago_1}%`)
    }

    if (filters.region) {
      query = query.eq('region', filters.region)
    }

    if (filters.fecha_desde) {
      query = query.gte('fecha_venta', filters.fecha_desde)
    }

    if (filters.fecha_hasta) {
      query = query.lte('fecha_venta', filters.fecha_hasta)
    }

    if (filters.monto_min !== undefined) {
      query = query.gte('monto', filters.monto_min)
    }

    if (filters.monto_max !== undefined) {
      query = query.lte('monto', filters.monto_max)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching summary:', error)
      return null
    }

    if (!data || data.length === 0) {
      return {
        count: 0,
        total: 0,
        average: 0,
      }
    }

    const total = data.reduce((sum, sale) => sum + (sale.monto || 0), 0)
    const average = total / data.length

    return {
      count: data.length,
      total,
      average,
    }
  } catch (err) {
    console.error('Error in getSalesSummary:', err)
    return null
  }
}

/**
 * Obtener logs de exportación
 */
export async function getExportLogs() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('export_logs')
    .select(`
      id,
      created_at,
      records_count,
      filters_applied,
      filename,
      exported_by_profile:profiles!export_logs_exported_by_fkey(
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching export logs:', error)
    return []
  }

  return data || []
}
