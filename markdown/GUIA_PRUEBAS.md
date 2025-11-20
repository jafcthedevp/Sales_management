# 🧪 Guía de Pruebas - Sistema de Gestión de Ventas

## 📋 Checklist de Pruebas Completas

### ✅ 1. Autenticación

#### Login
- [ ] Abrir http://localhost:3000
- [ ] Debería redirigir a `/login`
- [ ] Intentar login con credenciales incorrectas → debe mostrar error
- [ ] Login con credenciales correctas → debe redirigir a `/dashboard`
- [ ] Verificar que NO aparece error de "perfil no encontrado"
- [ ] Verificar que NO hay error de recursión infinita

#### Logout
- [ ] Click en avatar/menú de usuario
- [ ] Click en "Cerrar sesión"
- [ ] Debe redirigir a `/login`
- [ ] Intentar acceder a `/dashboard` sin login → debe redirigir a `/login`

#### Recuperación de Contraseña (si está implementado)
- [ ] Click en "¿Olvidaste tu contraseña?"
- [ ] Ingresar email y enviar
- [ ] Verificar que muestra mensaje de éxito

---

### ✅ 2. Dashboard

#### Estadísticas Principales
- [ ] Verificar que muestra 4 tarjetas de estadísticas:
  - **Total Ventas**: Número correcto de registros
  - **Ingresos Totales**: Suma total en S/
  - **Promedio por Venta**: Cálculo correcto
  - **Vendedores**: Número de vendedores únicos
- [ ] Verificar que los números son coherentes (no 0 si hay datos)
- [ ] Los montos deben tener formato: `S/ 1,234.56`

#### Ventas Recientes
- [ ] Debe mostrar tabla con últimas ventas
- [ ] Verificar columnas visibles
- [ ] Verificar formato de fechas
- [ ] Verificar formato de montos

**❌ Errores a buscar:**
- Estadísticas en 0 cuando hay datos
- Números ilógicos (ej: promedio mayor que total)
- Error en consola del navegador

---

### ✅ 3. Módulo de Ventas (`/ventas`)

#### Visualización de Datos
- [ ] Acceder a `/ventas`
- [ ] Debe cargar tabla de ventas
- [ ] Verificar paginación funciona
- [ ] Verificar ordenamiento por columnas
- [ ] Verificar que se muestran todos los campos:
  - CEL VENDEDOR
  - NÚMERO CLIENTE
  - NOMBRE CLIENTE
  - MÉTODO PAGO
  - MÉTODO PAGO 1
  - MONTO
  - REGIÓN
  - FECHA REPORTE

#### Filtros
- [ ] **Búsqueda global**: Ingresar texto y buscar
- [ ] **Filtro por Vendedor**: Seleccionar o escribir
- [ ] **Filtro por Cliente**: Buscar por número
- [ ] **Filtro por Método de Pago**: Seleccionar
- [ ] **Filtro por Región**: LIMA / PROVINCIA
- [ ] **Filtro por Fecha**:
  - Desde: Seleccionar fecha inicial
  - Hasta: Seleccionar fecha final
  - Verificar que filtra correctamente
- [ ] **Filtro por Monto**:
  - Monto mínimo
  - Monto máximo
- [ ] Limpiar filtros y verificar que muestra todos los datos

**❌ Errores a buscar:**
- Error 400 con mensaje "columna fecha_venta no existe"
- Error 42703
- Filtros que no aplican cambios
- Error de recursión infinita

---

### ✅ 4. Módulo de Exportación (`/export`)

#### Configuración de Exportación
- [ ] Acceder a `/export`
- [ ] Debe mostrar opciones de filtros
- [ ] Seleccionar columnas a exportar
- [ ] Aplicar filtros de fecha:
  - Fecha desde
  - Fecha hasta
  - **CRÍTICO**: Verificar que NO da error 400
- [ ] Ver preview/resumen de datos a exportar

#### Proceso de Exportación
- [ ] Click en "Exportar"
- [ ] Debe generar archivo Excel
- [ ] Descargar archivo
- [ ] Abrir Excel y verificar:
  - Headers correctos en español
  - Datos completos
  - Formato de fechas correcto
  - Formato de montos correcto
  - Todas las columnas seleccionadas presentes

#### Logs de Exportación
- [ ] Verificar que se registró el log
- [ ] Debe mostrar:
  - Usuario que exportó
  - Fecha/hora
  - Cantidad de registros
  - Filtros aplicados

**❌ Errores a buscar:**
- Error 400 al exportar
- "columna fecha_venta no existe"
- Archivo descarga vacío
- Datos incorrectos en Excel
- Fechas mal formateadas

---

### ✅ 5. Módulo de Carga Masiva (`/upload`)

#### Carga de Archivo Excel
- [ ] Acceder a `/upload`
- [ ] Arrastrar o seleccionar archivo Excel
- [ ] Verificar que detecta headers correctos:
  - CEL VENDEDOR
  - NUMERO CLIENTE
  - NOMBRE CLIENTE
  - METODO PAGO
  - METODO PAGO 1 (opcional)
  - MONTO
  - REGION (opcional)
  - **FECHA REPORTE** ← IMPORTANTE, NO "FECHA VENTA"
- [ ] Preview de datos cargados

#### Validación de Datos
- [ ] Verificar que valida campos requeridos
- [ ] Verificar formato de montos
- [ ] Verificar regiones válidas (LIMA/PROVINCIA)
- [ ] Mostrar errores de validación

#### Proceso de Carga
- [ ] Click en "Cargar datos"
- [ ] Debe mostrar progreso
- [ ] Al finalizar:
  - Resumen de registros insertados
  - Resumen de errores (si los hay)
  - Detalle de errores

#### Logs de Carga
- [ ] Verificar registro en logs
- [ ] Debe mostrar:
  - Usuario que subió
  - Nombre de archivo
  - Cantidad de registros
  - Errores encontrados

**❌ Errores a buscar:**
- No reconoce archivo Excel
- Error al parsear datos
- Error al insertar en base de datos
- Timeout en archivos grandes

---

### ✅ 6. Módulo de Usuarios (`/usuarios`) - SOLO ADMIN

#### Listado de Usuarios
- [ ] Acceder a `/usuarios` (solo si eres admin)
- [ ] Debe mostrar tabla de usuarios
- [ ] Columnas visibles:
  - Email
  - Nombre completo
  - Rol (Admin/Contador)
  - Estado (Activo/Inactivo)
  - Fecha creación

#### Crear Usuario
- [ ] Click en "Nuevo Usuario"
- [ ] Llenar formulario:
  - Email
  - Nombre completo
  - Contraseña
  - Rol
- [ ] Guardar
- [ ] Verificar que aparece en la lista
- [ ] Verificar que puede hacer login con ese usuario

#### Editar Usuario
- [ ] Click en editar usuario
- [ ] Cambiar datos (nombre, rol, estado)
- [ ] Guardar cambios
- [ ] Verificar que se actualizó

#### Eliminar Usuario
- [ ] Click en eliminar usuario
- [ ] Confirmar eliminación
- [ ] Verificar que ya no aparece
- [ ] Verificar que NO puedes eliminar tu propio usuario

**❌ Errores a buscar:**
- Contador puede acceder a `/usuarios`
- Error al crear usuario
- Perfil no se crea automáticamente
- Puede eliminar su propio usuario

---

### ✅ 7. Configuración (`/configuracion`)

#### Perfil de Usuario
- [ ] Acceder a `/configuracion`
- [ ] Tab "Perfil"
- [ ] Editar nombre completo
- [ ] Guardar cambios
- [ ] Verificar que se actualizó en header

#### Seguridad
- [ ] Tab "Seguridad"
- [ ] Cambiar contraseña:
  - Contraseña actual
  - Nueva contraseña
  - Confirmar nueva contraseña
- [ ] Guardar
- [ ] Logout y login con nueva contraseña

**❌ Errores a buscar:**
- No se actualiza el perfil
- Error al cambiar contraseña
- Puede cambiar contraseña sin validar la actual

---

### ✅ 8. Navegación y UI

#### Menú de Navegación
- [ ] Verificar que todos los links funcionan:
  - Dashboard
  - Ventas
  - Exportar
  - Cargar Datos
  - Usuarios (solo admin)
  - Configuración
- [ ] Verificar que resalta la página actual
- [ ] Menu responsive en móvil

#### Permisos por Rol
- [ ] **Como Admin**: Ver todas las opciones
- [ ] **Como Contador**: NO ver "Cargar Datos" ni "Usuarios"
- [ ] Intentar acceder directamente a rutas prohibidas → debe redirigir

#### Theme (Modo Claro/Oscuro)
- [ ] Toggle de tema funciona
- [ ] Se mantiene al recargar página
- [ ] Todos los componentes se ven bien en ambos modos

**❌ Errores a buscar:**
- Links rotos
- Contador ve opciones de admin
- Theme no persiste
- Estilos rotos

---

## 🔍 Pruebas en Consola del Navegador

Abrir DevTools (F12) y verificar:

### Console
- [ ] NO debe haber errores en rojo (excepto warnings menores)
- [ ] Buscar específicamente:
  - ❌ "infinite recursion"
  - ❌ "42703"
  - ❌ "fecha_venta"
  - ❌ "permission denied"

### Network
- [ ] Requests a `/rest/v1/sales` deben ser 200 OK
- [ ] Requests a `/rest/v1/profiles` deben ser 200 OK
- [ ] NO debe haber requests con 400 o 500
- [ ] Verificar que queries incluyen `fecha_reporte` no `fecha_venta`

### Application → Cookies
- [ ] Debe haber cookies de Supabase:
  - `sb-xxxxx-auth-token`
  - `sb-xxxxx-auth-token-code-verifier`

---

## 📊 Datos de Prueba Recomendados

### Para Filtros de Fecha
- Usar rango: Últimos 7 días
- Usar rango: Último mes
- Usar fecha específica
- Usar rango sin datos (futuro) → debe decir "sin resultados"

### Para Búsqueda
- Buscar por teléfono parcial
- Buscar por nombre de cliente
- Buscar por método de pago
- Buscar texto que no existe

### Para Excel
- Archivo pequeño (10-50 registros)
- Archivo mediano (100-500 registros)
- Archivo con errores intencionales
- Archivo con columnas faltantes

---

## 🐛 Errores Críticos a Reportar

Si encuentras alguno de estos, **reportar inmediatamente**:

1. ❌ Error 400 con "fecha_venta no existe"
2. ❌ "infinite recursion detected"
3. ❌ "No se encontró el perfil del usuario"
4. ❌ Estadísticas en 0 cuando hay datos
5. ❌ No puede hacer login
6. ❌ Exportación falla siempre
7. ❌ Carga de Excel no funciona
8. ❌ Contador puede ver/editar usuarios

---

## ✅ Checklist Final

Después de todas las pruebas:

- [ ] Login funciona sin errores
- [ ] Dashboard muestra stats correctas
- [ ] Filtros funcionan en Ventas
- [ ] Exportación genera Excel correcto
- [ ] Carga de Excel funciona
- [ ] Permisos por rol funcionan
- [ ] No hay errores en consola
- [ ] No hay errores 400/500 en Network

---

## 📝 Formato para Reportar Errores

Si encuentras un error, repórtalo así:

```
**Módulo:** [Dashboard/Ventas/Export/Upload/Usuarios/Config]
**Acción:** [Qué estabas haciendo]
**Error:** [Mensaje de error exacto]
**Consola:** [Captura de console.log o Network]
**Pasos para reproducir:**
1. Ir a...
2. Click en...
3. El error aparece...
```

---

**Fecha:** 19 de Noviembre 2024
**Versión:** Post-corrección fecha_reporte + RLS
**Servidor:** http://localhost:3000
