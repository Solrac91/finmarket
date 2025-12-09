# ROADMAP FinMarket - Plataforma Educativa de Trading

## ESTADO ACTUAL (✅ COMPLETADO)

### Core Funcional
- [x] Sistema de autenticación (Login/Register) con roles (estudiante/profesor)
- [x] Dashboard funcional con compra/venta de activos
- [x] 65 activos financieros (IBEX 35, Crypto, Materias Primas, ETFs)
- [x] Sistema de Portfolio con tracking de inversiones
- [x] Historial de transacciones completo
- [x] Cálculo de rendimiento y beneficios

### Panel de Profesor
- [x] Gestión de estudiantes (ver, resetear, eliminar)
- [x] Gestión individual de precios con filtros por categoría
- [x] Eventos masivos de mercado (Crisis, Crash, Bull Market, etc.)
- [x] Historial de cambios de precios con trazabilidad
- [x] Sistema de noticias (crear, editar, eliminar) con impacto (positivo/negativo/neutral)

### Páginas y Vistas
- [x] Welcome/Landing page
- [x] Dashboard de estudiante
- [x] Ranking competitivo entre estudiantes
- [x] Página de Noticias completa con filtros
- [x] Panel de Profesor completo

### Sistema de Datos
- [x] Almacenamiento en localStorage
- [x] Precios personalizables por profesor
- [x] Datos de usuario persistentes

---

## FASE 1: VISUALIZACIÓN Y ANÁLISIS (🎯 SIGUIENTE - ALTA PRIORIDAD)

**Objetivo:** Permitir análisis técnico básico para toma de decisiones informadas

### 1.1 Gráficos de Precios Históricos
- [ ] Implementar Chart.js o Recharts
- [ ] Gráfico de línea básico con histórico de precios
- [ ] Gráfico de velas (candlestick) para análisis técnico
- [ ] Selector de período (1D, 7D, 1M, 3M, 1Y)
- [ ] Vista de gráfico en modal al hacer clic en un activo
- [ ] Simulación de histórico de precios (generar datos pasados)

**Dónde:** 
- Modal emergente desde Dashboard al hacer clic en un activo
- Sección dedicada en la vista de detalle de activo

**Justificación:** Sin gráficos, los estudiantes compran/venden "a ciegas". Es fundamental para análisis.

### 1.2 Indicadores Técnicos Básicos
- [ ] Media Móvil Simple (SMA 20, SMA 50)
- [ ] RSI (Relative Strength Index)
- [ ] Volumen de transacciones simulado
- [ ] Líneas de soporte/resistencia (opcional)

**Dónde:** Superpuestos en los gráficos de precios

**Justificación:** Enseñar a leer indicadores técnicos es parte del aprendizaje.

---

## FASE 2: EVALUACIÓN Y PEDAGOGÍA (⭐ CRÍTICO PARA EL PROFESOR)

**Objetivo:** Herramientas para evaluar y guiar el aprendizaje de estudiantes

### 2.1 Sistema de Misiones/Objetivos
- [ ] El profesor crea "challenges" personalizados
- [ ] Tipos de misiones:
  - Comprar cuando RSI < 30
  - Diversificar en al menos 3 categorías
  - Mantener una posición por X días
  - Lograr X% de rendimiento
- [ ] Sistema de puntos/badges separado del dinero virtual
- [ ] Dashboard de misiones para estudiantes
- [ ] Panel de seguimiento para profesores

**Dónde:** Nueva pestaña en Dashboard del estudiante y Panel del profesor

**Justificación:** Gamifica el aprendizaje y permite evaluación cualitativa, no solo cuantitativa.

### 2.2 Analytics Avanzado del Profesor
- [ ] Vista individual de cada estudiante
- [ ] Métricas profesionales:
  - Sharpe Ratio
  - Win Rate (% operaciones ganadoras)
  - Mejor/peor operación
  - Promedio de retorno por operación
  - Tiempo promedio de holding
  - Diversificación del portfolio
- [ ] Comparativa vs benchmark (ej: IBEX 35)
- [ ] Gráfico de evolución temporal del portfolio
- [ ] Detalle de todas las transacciones del estudiante

**Dónde:** Panel del profesor → nueva sección "Análisis Individual"

**Justificación:** Necesitas datos objetivos para poner notas y entender CÓMO operan los estudiantes.

### 2.3 Exportación de Reportes
- [ ] Estudiante: Descargar portfolio en PDF
- [ ] Profesor: Exportar ranking completo en CSV/Excel
- [ ] Profesor: Generar reporte individual de estudiante en PDF
- [ ] Incluir gráficos y métricas visuales

**Dónde:** Botones de exportación en Dashboard y Panel del profesor

**Justificación:** Documentación formal para evaluación académica.

---

## FASE 3: REALISMO DE MERCADO (📈 IMPORTANTE)

**Objetivo:** Simular condiciones reales del mercado

### 3.1 Comisiones y Costes de Trading
- [ ] Configurable por el profesor (ej: 0.1% por transacción)
- [ ] Se resta automáticamente en cada compra/venta
- [ ] Mostrar claramente en la UI
- [ ] Toggle on/off para el profesor

**Dónde:** Configuración del profesor + cálculo automático en transacciones

**Justificación:** En mercados reales, cada operación tiene un coste. Enseña a no hacer day-trading excesivo.

### 3.2 Órdenes Avanzadas
- [ ] Stop-Loss: vender automáticamente si baja X%
- [ ] Take-Profit: vender automáticamente si sube X%
- [ ] Órdenes limitadas vs órdenes de mercado
- [ ] Panel de órdenes pendientes

**Dónde:** Modal de compra/venta + nueva pestaña "Órdenes"

**Justificación:** Herramientas profesionales que los traders reales usan para gestionar riesgo.

### 3.3 Simulación de Volatilidad Automática
- [ ] Los precios fluctúan automáticamente cada X minutos
- [ ] Basado en volatilidad real histórica de cada activo
- [ ] El profesor puede pausar/reanudar el mercado
- [ ] Configurable: velocidad de simulación (1 min real = 1 hora simulada)

**Dónde:** Sistema de background + toggle en Panel del profesor

**Justificación:** Los mercados no son estáticos. Actualmente los precios solo cambian manualmente.

---

## FASE 4: GAMIFICACIÓN Y ENGAGEMENT (🎮 MOTIVACIÓN)

**Objetivo:** Mantener a los estudiantes comprometidos y competitivos

### 4.1 Leaderboards Temporales
- [ ] Ranking semanal
- [ ] Ranking mensual
- [ ] Premios virtuales al top 3
- [ ] Sistema de ligas (Oro/Plata/Bronce)
- [ ] Histórico de rankings pasados

**Dónde:** Página de Ranking mejorada

**Justificación:** Competencia saludable que motiva la participación continua.

### 4.2 Trading Social (Opcional)
- [ ] Ver portfolios públicos de otros estudiantes (opcional)
- [ ] Sistema de "seguir" a los mejores traders
- [ ] Copiar operaciones de otros (opcional)
- [ ] Foro simple de discusión
- [ ] Comentarios en noticias

**Dónde:** Nueva sección "Comunidad"

**Justificación:** Aprender de los mejores compañeros. Opcional por temas de privacidad.

### 4.3 Notificaciones
- [ ] Alertas cuando un activo sube/baja X%
- [ ] Notificaciones de eventos del profesor
- [ ] Recordatorios de misiones pendientes
- [ ] Órdenes ejecutadas (stop-loss, take-profit)

**Dónde:** Bell icon en header + sistema de notificaciones

**Justificación:** Mantener a los estudiantes informados sin revisar constantemente.

---

## FASE 5: PULIDO PROFESIONAL (✨ UX/UI)

**Objetivo:** Perfeccionar la experiencia de usuario

### 5.1 Perfil de Usuario
- [ ] Página de perfil individual
- [ ] Foto de perfil
- [ ] Biografía
- [ ] Estadísticas públicas
- [ ] Badges/logros conseguidos
- [ ] Historial de rendimiento

**Dónde:** Nueva página `/profile/:userId`

### 5.2 Tutorial Interactivo
- [ ] Onboarding guiado para nuevos estudiantes
- [ ] Tour paso a paso de la interfaz
- [ ] Explicación de conceptos clave (RSI, Stop-Loss, etc.)
- [ ] Video tutoriales embebidos (opcional)

**Dónde:** Modal al primer login + botón "Ayuda"

### 5.3 Optimización Mobile
- [ ] Diseño responsive completo
- [ ] Touch gestures para gráficos
- [ ] Menú hamburguesa en móvil
- [ ] PWA (Progressive Web App) opcional

### 5.4 Detalles UI que Faltan
- [ ] Barra de búsqueda funcional
- [ ] Enlaces de "Mi Cartera" que funcionan
- [ ] Iconos del header que enlazan correctamente
- [ ] Animaciones y transiciones suaves
- [ ] Dark mode (opcional)

**Justificación:** Pulir los detalles hace que la plataforma se sienta premium y profesional.

---

## FASE 6: AVANZADO (🚀 FUTURO - OPCIONAL)

### 6.1 Backend Real
- [ ] Migrar de localStorage a base de datos (Firebase/Supabase)
- [ ] API REST para datos
- [ ] Sincronización multi-dispositivo
- [ ] Backup automático de datos

### 6.2 Integración con Datos Reales
- [ ] API de datos bursátiles reales (Alpha Vantage, Yahoo Finance)
- [ ] Precios actualizados en tiempo real
- [ ] Noticias financieras reales

### 6.3 Análisis con IA
- [ ] Sugerencias de trading basadas en IA
- [ ] Análisis de sentimiento de noticias
- [ ] Predicción de tendencias (educativo)

### 6.4 Simulador de Opciones y Futuros
- [ ] Trading de opciones
- [ ] Contratos de futuros
- [ ] Apalancamiento

---

## NOTAS TÉCNICAS

### Stack Actual
- React 18
- React Router
- Lucide Icons
- Chart.js / Recharts (disponible)
- localStorage para persistencia

### Librerías Disponibles
- recharts (gráficos)
- lodash (utilidades)
- papaparse (CSV)
- mathjs (cálculos)

### Próximas Tecnologías a Considerar
- jsPDF (exportar PDF)
- html2canvas (screenshots para reportes)
- socket.io (notificaciones en tiempo real - futuro)

---

## ESTRATEGIA DE IMPLEMENTACIÓN

1. **Siempre crear funcionalidades completas antes de pasar a la siguiente**
2. **Testear con múltiples usuarios simulados**
3. **Documentar decisiones de diseño**
4. **Mantener el código limpio y modular**
5. **Priorizar UX sobre features complejas**

---

## PRÓXIMO PASO INMEDIATO

**FASE 1.1: Implementar gráficos básicos de precios con Chart.js**
- Crear componente PriceChart.js
- Modal de gráfico al hacer clic en un activo
- Generar datos históricos simulados
- Selector de período (1D, 7D, 1M)

**Tiempo estimado:** 1-2 sesiones de trabajo