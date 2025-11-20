# Guía Completa de Filtros de Exportación

## Descripción General

El sistema de exportación permite generar reportes en Excel con datos de ventas aplicando múltiples filtros. Todos los filtros se pueden combinar entre sí para obtener reportes específicos.

---

## Filtros Disponibles

### 1. Búsqueda General
- **Campo:** Texto libre
- **Busca en:** `cel_vendedor`, `numero_cliente`, `nombre_cliente`, `metodo_pago`
- **Tipo de búsqueda:** Parcial (busca coincidencias en cualquier parte del texto)
- **Ejemplo:**
  - Si escribes "402", encontrará registros que contengan "402" en vendedor, cliente o método de pago
  - Si escribes "TK", encontrará "TK1", "TK2", "TK3", etc.

**⚠️ IMPORTANTE:** Este filtro busca en MÚLTIPLES campos simultáneamente. Úsalo cuando no sepas exactamente en qué campo está el dato.

---

### 2. Vendedor
- **Campo:** Dropdown (selección única)
- **Filtra por:** `cel_vendedor` exacto
- **Valores posibles:** P1, P2, P4, P5, P6, TK1, TK2, TK3, LIVE OVER, LIVE BRAVOS, ZAZU-385, OVER-016, ZAZU-839, LIVEX-602, BRAVOS-376
- **Uso:** Selecciona un vendedor específico para ver solo sus ventas

**Ejemplo:**
- Seleccionar "TK1" → Solo ventas del vendedor TK1

---

### 3. Método de Pago
- **Campo:** Dropdown (selección única)
- **Filtra por:** `metodo_pago` (tipo de pago)
- **Valores posibles:** EFECTIVO, YAPE, PLIN, TRANSFERENCIA, etc.
- **Uso:** Filtrar por el tipo de método de pago utilizado

**Ejemplo:**
- Seleccionar "YAPE" → Solo ventas pagadas con Yape

---

### 4. Método de Pago 1 ⭐ (Teléfono que recibe dinero)
- **Campo:** Dropdown (selección única)
- **Filtra por:** `metodo_pago_1` (teléfono o cuenta bancaria que recibió el pago)
- **Valores posibles:**
  - Teléfonos: L1-000, L2-378, L3-711, L4-138, P1/556, P1-A/375, P2/576, P3/825, P4/101, P4-A/262, P5/795, TK1/320, TK2/505, TK3/016, TK6/600, LIVE BRAV/402
  - Cuentas bancarias: TRANSF. 5094, TRANSF. 4006, TRANSF. 0040, TRANSF. 0102
- **Uso:** **ESTE ES EL FILTRO MÁS IMPORTANTE** para hacer reportes de cuánto dinero recibió cada teléfono/cuenta

**Ejemplo:**
- Seleccionar "LIVE BRAV/402" → Todas las ventas donde el cliente pagó al teléfono 402
- Seleccionar "TRANSF. 5094" → Todas las transferencias a la cuenta bancaria 5094

**Contexto de negocio:**
Cuando un vendedor (ej: TK1) vende un producto, le dice al cliente "págame a este teléfono L1-000". Al final del mes, necesitas saber cuánto dinero recibió cada teléfono (L1-000, LIVE BRAV/402, etc.).

---

### 5. Región
- **Campo:** Dropdown (selección única)
- **Filtra por:** `region`
- **Valores posibles:** LIMA, PROVINCIA
- **Uso:** Filtrar ventas por ubicación geográfica

**Ejemplo:**
- Seleccionar "LIMA" → Solo ventas en Lima
- Seleccionar "PROVINCIA" → Solo ventas fuera de Lima

---

### 6. Fecha Desde
- **Campo:** Date picker (selector de fecha)
- **Filtra por:** `fecha_reporte >= fecha_desde`
- **Formato:** YYYY-MM-DD
- **Uso:** Mostrar ventas desde esta fecha en adelante

**Ejemplo:**
- Fecha Desde: "2025-11-01" → Ventas del 1 de noviembre en adelante

---

### 7. Fecha Hasta
- **Campo:** Date picker (selector de fecha)
- **Filtra por:** `fecha_reporte <= fecha_hasta`
- **Formato:** YYYY-MM-DD
- **Uso:** Mostrar ventas hasta esta fecha

**Ejemplo:**
- Fecha Hasta: "2025-11-30" → Ventas hasta el 30 de noviembre

**💡 TIP:** Combina Fecha Desde + Fecha Hasta para obtener un rango específico

---

### 8. Monto Mínimo
- **Campo:** Número decimal
- **Filtra por:** `monto >= monto_min`
- **Formato:** Números decimales (ej: 100, 50.50, 1000)
- **Uso:** Filtrar ventas por encima de cierto valor

**Ejemplo:**
- Monto Mínimo: 100 → Solo ventas de S/. 100 o más

---

### 9. Monto Máximo
- **Campo:** Número decimal
- **Filtra por:** `monto <= monto_max`
- **Formato:** Números decimales
- **Uso:** Filtrar ventas por debajo de cierto valor

**Ejemplo:**
- Monto Máximo: 500 → Solo ventas de S/. 500 o menos

**💡 TIP:** Combina Monto Mínimo + Monto Máximo para un rango (ej: ventas entre S/. 100 y S/. 500)

---

## Combinaciones de Filtros

### ⚠️ Regla de Combinación: AND (Y)
Cuando aplicas múltiples filtros, el sistema busca registros que cumplan **TODOS** los filtros simultáneamente (operador AND).

**Ejemplo:**
```
Vendedor: "TK1"
Región: "LIMA"
Fecha Desde: "2025-11-01"
```
→ Resultado: Ventas que sean de TK1 **Y** en Lima **Y** desde el 1 de noviembre

---

## Casos de Uso Comunes

### Caso 1: Reporte Mensual de un Teléfono
**Objetivo:** Saber cuánto dinero recibió el teléfono "LIVE BRAV/402" en noviembre 2025

**Filtros:**
- ✅ Método de Pago 1: "LIVE BRAV/402"
- ✅ Fecha Desde: "2025-11-01"
- ✅ Fecha Hasta: "2025-11-30"

**Resultado:** Todas las ventas pagadas al teléfono 402 en noviembre

---

### Caso 2: Ventas de un Vendedor en una Región
**Objetivo:** Ver todas las ventas del vendedor TK1 solo en Lima

**Filtros:**
- ✅ Vendedor: "TK1"
- ✅ Región: "LIMA"

**Resultado:** Todas las ventas de TK1 realizadas en Lima

---

### Caso 3: Ventas Grandes de la Semana
**Objetivo:** Identificar ventas de más de S/. 1000 en la última semana

**Filtros:**
- ✅ Monto Mínimo: 1000
- ✅ Fecha Desde: "2025-11-11"
- ✅ Fecha Hasta: "2025-11-18"

**Resultado:** Ventas mayores o iguales a S/. 1000 en esa semana

---

### Caso 4: Ventas de un Vendedor a un Teléfono Específico
**Objetivo:** Ver todas las ventas que el vendedor P1 hizo y se pagaron al teléfono P1/556

**Filtros:**
- ✅ Vendedor: "P1"
- ✅ Método de Pago 1: "P1/556"

**Resultado:** Ventas del vendedor P1 pagadas específicamente al teléfono P1/556

---

### Caso 5: Transferencias Bancarias del Mes
**Objetivo:** Ver todas las transferencias a la cuenta bancaria 5094 en noviembre

**Filtros:**
- ✅ Método de Pago 1: "TRANSF. 5094"
- ✅ Fecha Desde: "2025-11-01"
- ✅ Fecha Hasta: "2025-11-30"

**Resultado:** Todas las transferencias a la cuenta 5094 en noviembre

---

### Caso 6: Buscar Ventas de un Cliente Específico
**Objetivo:** Encontrar todas las compras del cliente con número 999888777

**Filtros:**
- ✅ Búsqueda General: "999888777"

**Resultado:** Todas las ventas donde el número de cliente contenga "999888777"

---

### Caso 7: Ventas Pequeñas en Efectivo
**Objetivo:** Ver ventas menores a S/. 50 pagadas en efectivo

**Filtros:**
- ✅ Método de Pago: "EFECTIVO"
- ✅ Monto Máximo: 50

**Resultado:** Ventas en efectivo de hasta S/. 50

---

### Caso 8: Reporte Completo de un Vendedor en un Mes
**Objetivo:** Ver todas las actividades del vendedor TK2 en octubre

**Filtros:**
- ✅ Vendedor: "TK2"
- ✅ Fecha Desde: "2025-10-01"
- ✅ Fecha Hasta: "2025-10-31"

**Resultado:** Todas las ventas de TK2 en octubre

---

### Caso 9: Ventas de Rango Medio en Provincia
**Objetivo:** Ventas entre S/. 100 y S/. 500 en provincia

**Filtros:**
- ✅ Región: "PROVINCIA"
- ✅ Monto Mínimo: 100
- ✅ Monto Máximo: 500

**Resultado:** Ventas en provincia con monto entre S/. 100 y S/. 500

---

### Caso 10: Todos los Pagos Yape del Día
**Objetivo:** Ver todos los pagos Yape de hoy

**Filtros:**
- ✅ Método de Pago: "YAPE"
- ✅ Fecha Desde: "2025-11-18"
- ✅ Fecha Hasta: "2025-11-18"

**Resultado:** Todas las ventas pagadas con Yape el 18 de noviembre

---

## Diferencias Importantes

### Método de Pago vs Método de Pago 1

| Característica | Método de Pago | Método de Pago 1 |
|---------------|----------------|------------------|
| **Qué representa** | Tipo de pago | Teléfono/cuenta que recibió el dinero |
| **Ejemplos** | EFECTIVO, YAPE, PLIN, TRANSFERENCIA | L1-000, LIVE BRAV/402, TRANSF. 5094 |
| **Uso principal** | Saber cómo pagó el cliente | Saber a qué teléfono/cuenta se hizo el pago |
| **Para reportes de** | Tipos de pago más usados | Cuánto dinero recibió cada teléfono |

### Búsqueda General vs Filtros Específicos

| Característica | Búsqueda General | Filtros Específicos |
|---------------|------------------|---------------------|
| **Campos que busca** | cel_vendedor, numero_cliente, nombre_cliente, metodo_pago | Un solo campo específico |
| **Tipo de búsqueda** | Parcial (contiene) | Puede ser exacto o parcial según el filtro |
| **Cuándo usar** | No sabes en qué campo está el dato | Sabes exactamente qué campo necesitas |
| **Ejemplo** | Buscar "402" en todos lados | Buscar "LIVE BRAV/402" solo en Método de Pago 1 |

---

## Advertencias y Consideraciones

### ⚠️ 1. Combinación de Búsqueda General + Otros Filtros
Si usas "Búsqueda General" junto con otros filtros, se aplican **AMBOS**:

**Ejemplo:**
```
Búsqueda General: "402"
Vendedor: "TK1"
```
→ Resultado: Solo ventas de TK1 que ADEMÁS contengan "402" en algún campo (vendedor, cliente, método de pago)

**💡 Recomendación:** Si quieres buscar un teléfono específico, NO uses Búsqueda General. Usa "Método de Pago 1" directamente.

---

### ⚠️ 2. Filtros Vacíos = Sin Filtro
Si dejas un filtro vacío o en "Todos", ese filtro no se aplica:

**Ejemplo:**
```
Vendedor: "Todos los vendedores"
Región: "LIMA"
```
→ Resultado: Todas las ventas en Lima de TODOS los vendedores

---

### ⚠️ 3. Fechas y Zona Horaria
- El sistema usa `fecha_reporte` (no `created_at`)
- Las fechas se interpretan en zona horaria local (Perú)
- Si solo pones "Fecha Desde", mostrará desde esa fecha hasta hoy
- Si solo pones "Fecha Hasta", mostrará TODAS las ventas hasta esa fecha

---

### ⚠️ 4. Sin Resultados
Si aplicaste filtros y no obtienes resultados:
1. Verifica que los filtros no sean demasiado restrictivos
2. Usa "Calcular Resumen" para ver cuántos registros coinciden antes de exportar
3. Prueba quitando filtros uno por uno para identificar cuál está bloqueando resultados

---

## Funcionalidad "Calcular Resumen"

Antes de exportar, puedes usar el botón **"Calcular Resumen"** para verificar:

### Datos que muestra:
1. **Registros:** Cantidad total de ventas que coinciden con los filtros
2. **Total:** Suma total en soles de todas las ventas filtradas
3. **Promedio:** Monto promedio por venta

### Ventajas:
- ✅ Verifica que los filtros estén correctos antes de exportar
- ✅ Obtén estadísticas rápidas sin descargar el Excel
- ✅ Identifica si los filtros son demasiado restrictivos (0 registros)

**💡 TIP:** Siempre calcula el resumen antes de exportar para asegurarte de que los filtros sean correctos.

---

## Selección de Columnas

Además de filtrar datos, puedes seleccionar qué columnas incluir en el Excel:

### Columnas disponibles:
- ID
- CEL VENDEDOR
- NÚMERO CLIENTE
- NOMBRE CLIENTE
- MÉTODO PAGO
- MÉTODO PAGO 1
- MONTO
- REGIÓN
- FECHA REPORTE
- FECHA CREACIÓN
- FECHA ACTUALIZACIÓN

### Opciones:
- **Seleccionar Todo:** Incluye todas las columnas
- **Deseleccionar Todo:** Quita todas las columnas
- **Selección manual:** Marca/desmarca columnas individualmente

**💡 TIP:** Selecciona solo las columnas necesarias para hacer el Excel más limpio y fácil de leer.

---

## Botón "Limpiar Filtros"

El botón **"Limpiar Filtros"** resetea TODOS los filtros a su estado inicial:
- Búsqueda General: vacío
- Todos los dropdowns: "Todos"
- Fechas: vacías
- Montos: vacíos

**Uso:** Cuando termines un reporte y quieras empezar uno nuevo desde cero.

---

## Flujo de Trabajo Recomendado

### Paso 1: Definir el objetivo
Decide qué reporte necesitas (ej: ventas mensuales de un teléfono)

### Paso 2: Aplicar filtros
Selecciona los filtros necesarios para tu reporte

### Paso 3: Calcular resumen
Presiona "Calcular Resumen" para verificar que los filtros sean correctos

### Paso 4: Seleccionar columnas
Marca solo las columnas que necesitas en el Excel

### Paso 5: Exportar
Presiona "Exportar a Excel" para descargar el archivo

### Paso 6: Limpiar (opcional)
Si vas a hacer otro reporte, presiona "Limpiar Filtros"

---

## Preguntas Frecuentes (FAQ)

### ¿Por qué no aparecen resultados con mis filtros?
- Los filtros son demasiado restrictivos
- Verifica que las fechas estén en el formato correcto
- Prueba quitando filtros uno por uno

### ¿Cómo saber cuánto dinero recibió un teléfono específico?
Usa el filtro **"Método de Pago 1"** y selecciona el teléfono (ej: LIVE BRAV/402)

### ¿Cuál es la diferencia entre Método de Pago y Método de Pago 1?
- **Método de Pago:** Tipo de pago (YAPE, EFECTIVO, etc.)
- **Método de Pago 1:** Teléfono/cuenta que recibió el dinero (L1-000, LIVE BRAV/402, etc.)

### ¿Puedo combinar todos los filtros a la vez?
Sí, pero asegúrate de que no sean demasiado restrictivos. Usa "Calcular Resumen" para verificar.

### ¿Qué pasa si no selecciono ninguna columna?
El sistema mostrará un error: "Debes seleccionar al menos una columna para exportar"

### ¿El archivo Excel conserva los filtros?
No, el Excel solo contiene los datos filtrados. Los filtros no se guardan en el archivo.

### ¿Puedo exportar sin filtros?
Sí, si no aplicas ningún filtro, se exportarán TODAS las ventas de la base de datos.

---

## Formato del Archivo Exportado

### Nombre del archivo:
`ventas_YYYY-MM-DDTHH-MM-SS.xlsx`

Ejemplo: `ventas_2025-11-18T15-30-45.xlsx`

### Formato de datos:
- **Montos:** Números con 2 decimales
- **Fechas:** Formato dd/mm/yyyy (ej: 18/11/2025)
- **Texto:** Sin formato especial

### Hoja de Excel:
- Nombre de la hoja: "Ventas"
- Headers en español (ej: CEL VENDEDOR, MONTO, etc.)
- Ancho de columnas automático

---

## Registro de Exportaciones (Historial)

Cada exportación se registra en el historial con:
- Fecha y hora de exportación
- Usuario que exportó
- Cantidad de registros exportados
- Filtros aplicados
- Nombre del archivo generado

**Ubicación:** Pestaña "Historial" en la página de exportación

**Uso:** Auditar quién exportó qué datos y cuándo

---

## Soporte y Contacto

Si tienes dudas o problemas con los filtros de exportación:
1. Revisa esta guía
2. Verifica que los filtros estén aplicados correctamente
3. Usa "Calcular Resumen" para diagnosticar problemas
4. Contacta al administrador del sistema

---

**Última actualización:** 18 de noviembre de 2025
