import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()

  // Obtener vendedores únicos
  const { data: vendedores, error: errorVendedores } = await supabase
    .from('sales')
    .select('cel_vendedor')
    .not('cel_vendedor', 'is', null)
    .order('cel_vendedor')
    .limit(10000)

  // Obtener métodos de pago 1 únicos
  const { data: metodosPago1, error: errorMetodos } = await supabase
    .from('sales')
    .select('metodo_pago_1')
    .not('metodo_pago_1', 'is', null)
    .order('metodo_pago_1')
    .limit(10000)

  // Contar total de ventas
  const { count: totalVentas } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true })

  // Extraer únicos
  const vendedoresUnicos = [...new Set(vendedores?.map(v => v.cel_vendedor) || [])]
  const metodosPago1Unicos = [...new Set(metodosPago1?.map(m => m.metodo_pago_1) || [])]

  const vendedoresEsperados = [
    'P1', 'P2', 'P4', 'P5', 'P6',
    'TK1', 'TK2', 'TK3',
    'LIVE OVER', 'LIVE BRAVOS',
    'ZAZU-385', 'OVER-016', 'ZAZU-839',
    'LIVEX-602', 'BRAVOS-376'
  ]

  const vendedoresFaltantes = vendedoresEsperados.filter(v => !vendedoresUnicos.includes(v))

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Debug - Datos de Filtros</h1>
        <p className="text-muted-foreground">
          Esta página muestra todos los valores únicos en la base de datos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Ventas</p>
          <p className="text-2xl font-bold">{totalVentas || 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Vendedores Únicos</p>
          <p className="text-2xl font-bold">{vendedoresUnicos.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Teléfonos Únicos</p>
          <p className="text-2xl font-bold">{metodosPago1Unicos.length}</p>
        </div>
      </div>

      {/* Vendedores Esperados vs Encontrados */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Vendedores Esperados</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-semibold">Total esperados:</span> {vendedoresEsperados.length}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Encontrados:</span> {vendedoresEsperados.filter(v => vendedoresUnicos.includes(v)).length}
          </p>
          {vendedoresFaltantes.length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/50 rounded">
              <p className="text-sm font-semibold text-destructive mb-2">
                ⚠️ Vendedores NO encontrados en la BD:
              </p>
              <ul className="text-sm text-destructive space-y-1">
                {vendedoresFaltantes.map(v => (
                  <li key={v}>• {v}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Errores */}
      {(errorVendedores || errorMetodos) && (
        <div className="border border-destructive rounded-lg p-6">
          <h2 className="text-xl font-semibold text-destructive mb-4">Errores</h2>
          {errorVendedores && (
            <p className="text-sm mb-2">Vendedores: {errorVendedores.message}</p>
          )}
          {errorMetodos && (
            <p className="text-sm">Métodos de Pago 1: {errorMetodos.message}</p>
          )}
        </div>
      )}

      {/* Vendedores Encontrados */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Vendedores en la Base de Datos</h2>
        <div className="grid grid-cols-3 gap-2">
          {vendedoresUnicos.map((vendedor) => (
            <div
              key={vendedor}
              className={`p-2 text-sm border rounded ${
                vendedoresEsperados.includes(vendedor)
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                  : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
              }`}
            >
              {vendedor}
              {!vendedoresEsperados.includes(vendedor) && (
                <span className="ml-2 text-yellow-600">⚠️</span>
              )}
            </div>
          ))}
        </div>
        {vendedoresUnicos.length === 0 && (
          <p className="text-muted-foreground text-sm">No hay vendedores en la base de datos</p>
        )}
      </div>

      {/* Teléfonos que Reciben Dinero */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Teléfonos que Reciben Dinero (Método Pago 1)</h2>
        <div className="grid grid-cols-3 gap-2">
          {metodosPago1Unicos.map((metodo) => (
            <div
              key={metodo}
              className="p-2 text-sm border rounded bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
            >
              {metodo}
            </div>
          ))}
        </div>
        {metodosPago1Unicos.length === 0 && (
          <p className="text-muted-foreground text-sm">No hay teléfonos en la base de datos</p>
        )}
      </div>

      {/* Info adicional */}
      <div className="border rounded-lg p-6 space-y-2 bg-muted/50">
        <h3 className="font-semibold">ℹ️ Información</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Verde: Vendedores esperados y encontrados</li>
          <li>• Amarillo: Vendedores encontrados pero no en la lista esperada</li>
          <li>• Los vendedores deben estar escritos EXACTAMENTE como aparecen en la BD (mayúsculas, espacios, etc.)</li>
        </ul>
      </div>
    </div>
  )
}
