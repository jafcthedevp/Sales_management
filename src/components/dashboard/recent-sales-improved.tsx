import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Sale } from '@/types/database.types'
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  Clock,
  TrendingUp,
} from 'lucide-react'

/**
 * Componente que muestra las ventas más recientes - VERSIÓN MEJORADA
 *
 * Mejoras:
 * - Diseño tipo card individual
 * - Avatares con iniciales
 * - Código de colores por región
 * - Timeline visual
 * - Mejor jerarquía visual
 * - Iconos informativos
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
      <Card className="border-2">
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

  // Función para obtener color según región
  const getRegionColor = (region: string | null) => {
    switch (region) {
      case 'LIMA':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500',
          text: 'text-blue-700',
          dot: 'bg-blue-500',
        }
      case 'PROVINCIA':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500',
          text: 'text-green-700',
          dot: 'bg-green-500',
        }
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500',
          text: 'text-gray-700',
          dot: 'bg-gray-500',
        }
    }
  }

  // Función para obtener iniciales
  const getInitials = (name: string | null) => {
    if (!name) return 'XX'
    const words = name.split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6 text-primary" />
              Ventas Recientes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Últimas {recentSales.length} transacciones registradas en el sistema
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {recentSales.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {recentSales.map((sale, index) => {
            const regionColors = getRegionColor(sale.region)
            const initials = getInitials(sale.nombre_cliente)

            return (
              <div
                key={sale.id}
                className="group relative"
              >
                {/* Timeline connector */}
                {index < recentSales.length - 1 && (
                  <div className="absolute left-[22px] top-12 h-full w-0.5 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
                )}

                {/* Card de venta */}
                <div className="relative flex gap-4 rounded-lg border-2 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] dark:from-gray-900 dark:to-gray-800">
                  {/* Avatar con punto de timeline */}
                  <div className="relative flex-shrink-0">
                    <div className={`absolute -left-1 -top-1 h-3 w-3 rounded-full ${regionColors.dot} ring-4 ring-white dark:ring-gray-900 animate-pulse`} />
                    <Avatar className="h-12 w-12 border-2">
                      <AvatarFallback className={`${regionColors.bg} ${regionColors.text} font-bold text-sm`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    {/* Línea 1: Nombre y región */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">
                          {sale.nombre_cliente || 'Cliente sin nombre'}
                        </h3>
                        {sale.region && (
                          <Badge
                            variant="outline"
                            className={`${regionColors.bg} ${regionColors.border} ${regionColors.text} border font-semibold text-xs`}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {sale.region}
                          </Badge>
                        )}
                      </div>

                      {/* Monto destacado */}
                      <div className="text-right flex-shrink-0">
                        <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 px-3 py-1.5 shadow-md">
                          <p className="text-lg font-bold text-white">
                            S/ {Number(sale.monto).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Línea 2: Detalles del cliente y vendedor */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="rounded-md bg-blue-100 p-1.5 dark:bg-blue-900/30">
                          <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-muted-foreground truncate">
                          {sale.numero_cliente}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="rounded-md bg-purple-100 p-1.5 dark:bg-purple-900/30">
                          <User className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-muted-foreground truncate">
                          {sale.cel_vendedor}
                        </span>
                      </div>
                    </div>

                    {/* Línea 3: Método de pago y fecha */}
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-orange-100 p-1.5 dark:bg-orange-900/30">
                          <CreditCard className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-muted-foreground font-medium">
                          {sale.metodo_pago}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {sale.created_at
                            ? format(new Date(sale.created_at), "d 'de' MMM, HH:mm", {
                                locale: es,
                              })
                            : 'Fecha no disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer con resumen */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Total de estas ventas:
            </span>
            <span className="text-xl font-bold text-primary">
              S/ {recentSales.reduce((sum, sale) => sum + Number(sale.monto), 0).toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
