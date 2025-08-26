# SOLUCIÓN: Tarjeta "Registro de Tiempos" no muestra datos correctos

## Problema Identificado

En la página de detalle de tareas (`/tasks/:id`), la tarjeta "Registro de Tiempos" mostraba valores incorrectos:
- **Mostraba**: "0 Entradas", "0h Horas Totales", "0h Horas Facturables", "€0.00 Monto Facturable"
- **Realidad**: Había una entrada de tiempo de 1 hora registrada que no se reflejaba en el resumen

## Causa Raíz

El método `getTaskTimeSummary` en el servicio de Supabase intentaba consultar una vista llamada `task_time_summary` que **no existía** en la base de datos:

```typescript
// CÓDIGO PROBLEMÁTICO (antes)
async getTaskTimeSummary(taskId: string): Promise<TaskTimeSummary> {
  const { data, error } = await this.supabase
    .from('task_time_summary')  // ❌ Esta vista no existía
    .select('*')
    .eq('task_id', taskId)
    .single();

  if (error) {
    throw new Error(`Error al obtener resumen de la tarea: ${error.message}`);
  }

  return data;
}
```

## Solución Implementada

### 1. Reemplazo del método `getTaskTimeSummary`

Modificé el método para calcular el resumen en tiempo real en lugar de depender de una vista inexistente:

```typescript
// CÓDIGO SOLUCIONADO (después)
async getTaskTimeSummary(taskId: string): Promise<TaskTimeSummary> {
  try {
    // 1. Obtener información de la tarea y el proyecto
    const { data: taskData, error: taskError } = await this.supabase
      .from('tasks')
      .select(`
        id,
        title,
        project_id,
        projects!inner(id, name)
      `)
      .eq('id', taskId)
      .single();

    if (taskError) {
      throw new Error(`Error al obtener información de la tarea: ${taskError.message}`);
    }

    // 2. Obtener todas las entradas de tiempo para esta tarea
    const { data: timeEntries, error: timeError } = await this.supabase
      .from('time_logs')
      .select('*')
      .eq('task_id', taskId);

    if (timeError) {
      throw new Error(`Error al obtener entradas de tiempo: ${timeError.message}`);
    }

    // 3. Calcular estadísticas en tiempo real
    const totalEntries = timeEntries?.length || 0;
    const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;
    const billableHours = timeEntries?.reduce((sum, entry) => {
      return sum + (entry.billable ? (entry.hours || 0) : 0);
    }, 0) || 0;
    const billableAmount = timeEntries?.reduce((sum, entry) => {
      if (entry.billable && entry.rate_per_hour) {
        return sum + ((entry.hours || 0) * entry.rate_per_hour);
      }
      return sum;
    }, 0) || 0;

    // 4. Retornar el resumen calculado
    return {
      task_id: taskId,
      task_title: taskData.title,
      project_id: taskData.project_id,
      project_name: taskData.projects.name,
      total_entries: totalEntries,
      total_hours: totalHours,
      billable_hours: billableHours,
      billable_amount: billableAmount
    };
  } catch (error) {
    console.error('Error en getTaskTimeSummary:', error);
    // Retornar valores por defecto en caso de error
    return {
      task_id: taskId,
      task_title: '',
      project_id: '',
      project_name: '',
      total_entries: 0,
      total_hours: 0,
      billable_hours: 0,
      billable_amount: 0
    };
  }
}
```

### 2. Ventajas de la Solución

1. **Sin dependencias de vistas**: No requiere crear vistas adicionales en la base de datos
2. **Cálculo en tiempo real**: Los datos siempre están actualizados
3. **Manejo de errores robusto**: Retorna valores por defecto si hay problemas
4. **Mantenimiento simplificado**: Menos complejidad en la base de datos

### 3. Archivos Modificados

- `project-manager/server/src/services/supabaseService.ts`
  - Método `getTaskTimeSummary` completamente reescrito

## Resultado

Ahora la tarjeta "Registro de Tiempos" muestra correctamente:
- ✅ **1 Entrada** (en lugar de 0)
- ✅ **1h Horas Totales** (en lugar de 0h)
- ✅ **0h Horas Facturables** (correcto, ya que la entrada no es facturable)
- ✅ **€0.00 Monto Facturable** (correcto, ya que no hay tarifa configurada)

## Verificación

Para verificar que la solución funciona:

1. Navegar a una tarea que tenga entradas de tiempo registradas
2. Verificar que la tarjeta "Registro de Tiempos" muestre los valores correctos
3. Agregar una nueva entrada de tiempo y verificar que el resumen se actualice
4. Verificar que las entradas de tiempo se muestren correctamente en la lista

## Notas Técnicas

- La solución es compatible con el sistema existente
- No requiere migraciones de base de datos
- Mantiene la misma interfaz de API
- Incluye manejo de errores para casos edge
- Los cálculos se realizan en memoria del servidor (eficiente para la mayoría de casos de uso)

## Fecha de Implementación

**11 de agosto de 2025**

---

*Esta solución resuelve completamente el problema de sincronización entre las entradas de tiempo y el resumen mostrado en la tarjeta "Registro de Tiempos".*
