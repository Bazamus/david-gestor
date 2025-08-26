# Instrucciones para Adaptación Móvil - Gestor de Proyectos

## 📋 Objetivo Principal
Adaptar la aplicación React/Vite de gestión de proyectos para dispositivos móviles manteniendo **INTACTO** el diseño desktop existente. Se debe implementar un diseño responsivo que priorice la funcionalidad y UX móvil sin afectar la experiencia desktop.

## 🚨 Principios Fundamentales

### 1. Preservación del Diseño Desktop
- **❌ PROHIBIDO modificar** cualquier estilo, componente o funcionalidad existente para desktop
- **✅ SOLO AÑADIR** nuevos estilos y componentes específicos para móvil
- Utilizar media queries como `@media (max-width: 768px)` para aplicar estilos móviles
- Mantener la estructura de componentes actual intacta

### 2. Estrategia de Implementación
- Crear archivos CSS/SCSS separados para estilos móviles (ej: `mobile.scss`)
- Usar clases CSS condicionales o styled-components con breakpoints
- Implementar componentes wrapper que detecten el dispositivo sin alterar los existentes
- Utilizar CSS Grid y Flexbox para layouts responsivos

## 📱 Adaptaciones Específicas por Tipo de Pantalla

### Dashboard Principal
- Convertir el layout de cards horizontales a **stack vertical**
- Implementar navegación por **tabs colapsables** para las métricas
- Reducir el tamaño de fuentes manteniendo legibilidad
- Convertir la barra lateral de "Acciones Rápidas" en un **menú hamburguesa**
- Hacer las alertas (Tareas Vencidas, Oportunidad de Mejora) **collapsibles**

### Formularios de Creación
- Implementar **accordion/collapsible sections** para los campos extensos
- Reducir márgenes y padding sin comprometer usabilidad
- Convertir campos lado a lado en **layout vertical**
- Implementar **sticky headers** en formularios largos
- Añadir botones de **navegación paso a paso** para formularios complejos
- Optimizar selectores dropdown para touch

### Tablas y Listas de Datos
- Implementar **scroll horizontal** con indicadores visuales
- Crear vista **card-based** alternativa para registros de tabla
- Añadir **filtros colapsables** en drawer lateral
- Implementar **paginación optimizada** para móvil
- Crear **acciones swipe** para operaciones rápidas (editar, eliminar)

### Kanban Board
- Implementar **scroll horizontal** para columnas
- Reducir padding de tarjetas sin perder información
- Añadir **gestos táctiles** para mover tarjetas entre columnas
- Crear **vista compacta** opcional con información esencial

### Reportes y Gráficos
- Hacer gráficos **responsive** con bibliotecas como Chart.js responsive
- Implementar **tabs horizontales** para navegar entre secciones
- Crear **vista de resumen** con métricas clave destacadas
- Añadir **zoom y pan** para gráficos complejos

### Timeline/Gantt
- Implementar **scroll horizontal** con controles de navegación
- Crear **vista de lista alternativa** para proyectos
- Añadir **filtros temporales** rápidos (hoy, semana, mes)
- Optimizar las barras de progreso para pantallas pequeñas

## 🔧 Consideraciones Técnicas

### Breakpoints Recomendados
```css
/* Mobile */
@media (max-width: 480px) { ... }

/* Tablet */
@media (min-width: 481px) and (max-width: 768px) { ... }

/* Desktop */
@media (min-width: 769px) { 
  /* mantener sin cambios */ 
}
```

### Componentes Nuevos a Crear
- `MobileNavigation`: Menú hamburguesa principal
- `MobileHeader`: Header compacto con breadcrumbs
- `MobileModal`: Modales fullscreen para móvil
- `MobileTable`: Componente tabla responsiva
- `MobileTabs`: Tabs optimizados para touch
- `MobileDrawer`: Panel lateral deslizante
- `MobileCard`: Cards optimizadas para touch

### UX Móvil Específica
- **Botones táctiles**: Mínimo 44px de altura
- **Espaciado**: Aumentar padding entre elementos clickeables
- **Loading states**: Implementar skeletons para carga de datos
- **Pull-to-refresh**: En listas y dashboards
- **Toast notifications**: Para feedback de acciones
- **Safe areas**: Respetar notches y areas seguras
- **Gestos swipe**: Para navegación y acciones rápidas

### Performance Móvil
- **Lazy loading** para componentes pesados
- **Image optimization** para diferentes densidades de pantalla
- **Code splitting** por rutas para reducir bundle inicial
- **Service Worker** para cacheo offline (opcional)
- **Virtual scrolling** para listas largas

## 🎯 Patrones de Implementación

### 1. Media Queries Defensivas
```css
/* Estilos base (desktop) - NO TOCAR */
.component { ... }

/* Sobreescribir solo para móvil */
@media (max-width: 768px) {
  .component {
    /* nuevos estilos móviles */
  }
}
```

### 2. Componentes Condicionales
```jsx
// Ejemplo de patrón sin modificar componente existente
const ResponsiveComponent = () => {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? <MobileVersion /> : <DesktopVersion />}
    </div>
  );
};
```

### 3. Hooks de Detección
```jsx
// Hook personalizado para detectar dispositivo
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  // lógica de detección
  return isMobile;
};
```

## 📊 Testing y Validación

### Testing Obligatorio
- Probar en dispositivos reales y emuladores
- Validar **orientación portrait y landscape**
- Verificar **gestos táctiles** funcionan correctamente
- Confirmar que **desktop sigue funcionando** exactamente igual
- Test de performance en dispositivos de gama baja

### Checklist de Validación
- [ ] Dashboard responsive sin perder funcionalidad
- [ ] Formularios completamente funcionales en móvil
- [ ] Tablas navegables con scroll horizontal
- [ ] Modales adaptados a pantalla completa
- [ ] Navegación intuitiva con menú hamburguesa
- [ ] Gráficos y reportes legibles
- [ ] Timeline/Gantt funcional en pantalla pequeña
- [ ] **CERO regresiones en desktop**

## 📦 Estructura de Archivos Recomendada

```
src/
├── components/
│   ├── desktop/          # Componentes existentes (NO TOCAR)
│   ├── mobile/           # Nuevos componentes móviles
│   └── responsive/       # Wrappers responsivos
├── styles/
│   ├── desktop.scss      # Estilos existentes (NO TOCAR)
│   ├── mobile.scss       # Nuevos estilos móviles
│   └── responsive.scss   # Media queries
├── hooks/
│   └── useIsMobile.js    # Hook de detección
└── utils/
    └── responsive.js     # Utilidades responsivas
```

## 🚀 Entregables Esperados

1. ✅ Aplicación completamente funcional en móvil
2. ✅ **Cero regresiones** en desktop
3. ✅ Documentación de los nuevos componentes móviles creados
4. ✅ Lista de breakpoints y media queries utilizados
5. ✅ Guía de testing para validar ambas versiones
6. ✅ Screenshots comparativos antes/después
7. ✅ Performance report móvil vs desktop

## ⚠️ Recordatorios Críticos

### 🔴 LO QUE NO SE DEBE HACER
- ❌ Modificar componentes existentes de desktop
- ❌ Cambiar estilos base que afecten desktop
- ❌ Alterar la estructura de carpetas actual
- ❌ Modificar lógica de negocio existente
- ❌ Cambiar APIs o endpoints

### 🟢 LO QUE SÍ SE DEBE HACER
- ✅ Crear nuevos componentes específicos para móvil
- ✅ Añadir media queries sin afectar estilos base
- ✅ Implementar detección de dispositivo
- ✅ Optimizar UX para touch
- ✅ Mantener toda la funcionalidad existente

---

## 📝 Notas Finales

**RECORDATORIO CRÍTICO**: En ningún momento se debe modificar código existente que afecte la versión desktop. Toda la adaptación debe ser **ADITIVA**, no modificativa.

La aplicación debe funcionar perfectamente en ambos entornos: desktop (tal como está) y móvil (nueva implementación responsiva).

---

*Documento generado para la adaptación móvil del Gestor de Proyectos - Agosto 2025*