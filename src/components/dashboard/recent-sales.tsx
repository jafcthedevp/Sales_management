import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Sale } from '@/types/database.types'

/**
 * Componente que muestra las ventas más recientes
 * Server Component
 */
export async function RecentSales() {
  const supabase = await createClient()

  const { data: recentSales } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<Sale[]>()

  if (!recentSales || recentSales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No hay ventas registradas aún
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas {recentSales.length} transacciones registradas
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{sale.nombre_cliente || 'Cliente sin nombre'}</p>
                  {sale.region && (
                    <Badge variant="outline" className="text-xs">
                      {sale.region}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-500">
                    {sale.numero_cliente}
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-xs text-gray-500">
                    Vendedor: {sale.cel_vendedor}
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-xs text-gray-500">
                    {sale.metodo_pago}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {sale.created_at
                    ? format(new Date(sale.created_at), "d 'de' MMMM, HH:mm", {
                        locale: es,
                      })
                    : 'Fecha no disponible'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  S/ {Number(sale.monto).toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
