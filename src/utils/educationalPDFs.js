import { jsPDF } from 'jspdf';

// Función auxiliar para crear header corporativo
const addHeader = (doc, title) => {
  // Header corporativo
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Logo: círculo morado con símbolo $
  doc.setFillColor(118, 75, 162);
  doc.circle(20, 20, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('$', 17, 24);
  
  // Nombre corporativo
  doc.setFontSize(24);
  doc.text('FinMarket', 32, 22);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Simulador Educativo de Trading Profesional', 32, 29);
  
  // Título del documento
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, 105, 36, { align: 'center' });
  
  return 50; // Y inicial para contenido
};

// Función auxiliar para footer
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('FinMarket - Material Educativo', 20, 285);
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
    doc.text(new Date().toLocaleDateString('es-ES'), 105, 290, { align: 'center' });
  }
};

// PDF 1: Introducción al Trading
export const generateIntroduccionTrading = () => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'INTRODUCCIÓN AL TRADING');

  doc.setTextColor(0, 0, 0);
  
  // Sección 1
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué es el Trading?', 20, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const intro = 'El trading es la compra y venta de activos financieros (acciones, criptomonedas, commodities) con el objetivo de obtener beneficios a través de las fluctuaciones de precios. A diferencia de la inversión tradicional a largo plazo, el trading puede involucrar operaciones de corta duración.';
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, y);
  y += splitIntro.length * 6 + 10;

  // Sección 2
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Conceptos Fundamentales', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('• Activo Financiero', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('  Cualquier instrumento que represente valor económico: acciones, bonos, divisas, etc.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('• Precio de Mercado', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('  El valor al que se negocia un activo en un momento determinado.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('• Liquidez', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('  Facilidad para comprar o vender un activo sin afectar significativamente su precio.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('• Volatilidad', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('  Medida de cuánto fluctúa el precio de un activo. Mayor volatilidad = mayor riesgo.', 25, y);
  y += 15;

  // Sección 3
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Tipos de Trading por Horizonte Temporal', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('1. Day Trading', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('   Operaciones que se abren y cierran el mismo día. Requiere tiempo y experiencia.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('2. Swing Trading', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('   Mantener posiciones durante días o semanas, aprovechando tendencias.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('3. Inversión a Largo Plazo', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('   Mantener activos durante meses o años, menos afectado por fluctuaciones diarias.', 25, y);
  y += 15;

  // Nueva página
  doc.addPage();
  y = 20;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Riesgos del Trading', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const riesgos = 'El trading conlleva riesgos significativos:\n\n• Pérdida de Capital: Puedes perder parte o todo tu dinero invertido.\n• Volatilidad: Los precios pueden cambiar rápidamente en tu contra.\n• Apalancamiento: Usar dinero prestado aumenta tanto ganancias como pérdidas.\n• Psicología: Las emociones pueden llevar a decisiones impulsivas.';
  const splitRiesgos = doc.splitTextToSize(riesgos, 170);
  doc.text(splitRiesgos, 20, y);
  y += splitRiesgos.length * 6 + 10;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Reglas de Oro para Principiantes', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('1. Nunca inviertas dinero que no puedas permitirte perder', 25, y);
  y += 7;
  doc.text('2. Diversifica tu cartera - no pongas todo en un solo activo', 25, y);
  y += 7;
  doc.text('3. Edúcate constantemente - el conocimiento es tu mejor herramienta', 25, y);
  y += 7;
  doc.text('4. Define una estrategia y síguela con disciplina', 25, y);
  y += 7;
  doc.text('5. Controla tus emociones - evita decisiones impulsivas', 25, y);
  y += 7;
  doc.text('6. Usa órdenes de stop-loss para limitar pérdidas', 25, y);
  y += 15;

  // Conclusión
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, 170, 40, 'F');
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Recuerda', 25, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const conclusion = 'El trading exitoso requiere educación, práctica y disciplina. Este simulador te permite experimentar sin riesgo real. Aprovecha esta oportunidad para aprender antes de operar con dinero real.';
  const splitConclusion = doc.splitTextToSize(conclusion, 160);
  doc.text(splitConclusion, 25, y);

  addFooter(doc);
  doc.save('FinMarket_Introduccion_Trading.pdf');
};

// PDF 2: Tipos de Activos Financieros
export const generateTiposActivos = () => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'TIPOS DE ACTIVOS FINANCIEROS');

  doc.setTextColor(0, 0, 0);
  
  // Introducción
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const intro = 'Los mercados financieros ofrecen diversos tipos de activos, cada uno con características, riesgos y oportunidades únicas. Conocer las diferencias te ayudará a construir una cartera diversificada.';
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, y);
  y += splitIntro.length * 6 + 15;

  // Acciones
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('1. ACCIONES (IBEX 35)', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué son?', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const acciones1 = 'Partes de propiedad de una empresa. Al comprar una acción, te conviertes en accionista y participas en los beneficios (o pérdidas) de la compañía.';
  const splitAcciones1 = doc.splitTextToSize(acciones1, 170);
  doc.text(splitAcciones1, 20, y);
  y += splitAcciones1.length * 6 + 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ventajas:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Potencial de crecimiento a largo plazo', 25, y);
  y += 6;
  doc.text('• Dividendos (algunas empresas reparten beneficios)', 25, y);
  y += 6;
  doc.text('• Liquidez (fáciles de comprar/vender)', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Riesgos:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Volatilidad del mercado', 25, y);
  y += 6;
  doc.text('• Riesgo empresarial (la compañía puede tener malos resultados)', 25, y);
  y += 15;

  // Criptomonedas
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('2. CRIPTOMONEDAS', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué son?', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const crypto1 = 'Monedas digitales descentralizadas que operan mediante tecnología blockchain. Bitcoin y Ethereum son las más conocidas.';
  const splitCrypto1 = doc.splitTextToSize(crypto1, 170);
  doc.text(splitCrypto1, 20, y);
  y += splitCrypto1.length * 6 + 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ventajas:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Alto potencial de rentabilidad', 25, y);
  y += 6;
  doc.text('• Operan 24/7 (no cierran como las bolsas)', 25, y);
  y += 6;
  doc.text('• Descentralización', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Riesgos:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Extremadamente volátiles', 25, y);
  y += 6;
  doc.text('• Regulación incierta', 25, y);
  y += 6;
  doc.text('• Riesgo tecnológico', 25, y);
  
  // Nueva página
  doc.addPage();
  y = 20;

  // ETFs
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('3. ETFs (Fondos Cotizados)', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué son?', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const etf1 = 'Fondos de inversión que cotizan en bolsa como una acción. Un ETF puede contener cientos de acciones, bonos u otros activos, ofreciendo diversificación instantánea.';
  const splitEtf1 = doc.splitTextToSize(etf1, 170);
  doc.text(splitEtf1, 20, y);
  y += splitEtf1.length * 6 + 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ventajas:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Diversificación automática', 25, y);
  y += 6;
  doc.text('• Menores comisiones que fondos tradicionales', 25, y);
  y += 6;
  doc.text('• Fácil de comprar y vender', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Riesgos:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Riesgo de mercado del activo subyacente', 25, y);
  y += 6;
  doc.text('• Algunos tienen poca liquidez', 25, y);
  y += 15;

  // Materias Primas
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('4. MATERIAS PRIMAS (Commodities)', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué son?', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const commodities1 = 'Recursos naturales o productos básicos: oro, plata, petróleo, trigo, café. Se negocian en mercados especializados.';
  const splitCommodities1 = doc.splitTextToSize(commodities1, 170);
  doc.text(splitCommodities1, 20, y);
  y += splitCommodities1.length * 6 + 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ventajas:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Protección contra inflación', 25, y);
  y += 6;
  doc.text('• Diversificación de cartera', 25, y);
  y += 6;
  doc.text('• El oro es refugio en crisis', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Riesgos:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Dependientes de factores geopolíticos', 25, y);
  y += 6;
  doc.text('• Alta volatilidad en algunos casos', 25, y);
  y += 15;

  // Tabla resumen
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Resumen Comparativo', 20, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.text('ACTIVO', 25, y);
  doc.text('VOLATILIDAD', 80, y);
  doc.text('LIQUIDEZ', 130, y);
  y += 6;
  
  doc.setFont(undefined, 'normal');
  doc.text('Acciones', 25, y);
  doc.text('Media', 80, y);
  doc.text('Alta', 130, y);
  y += 6;
  
  doc.text('Criptomonedas', 25, y);
  doc.text('Muy Alta', 80, y);
  doc.text('Alta', 130, y);
  y += 6;
  
  doc.text('ETFs', 25, y);
  doc.text('Media', 80, y);
  doc.text('Alta', 130, y);
  y += 6;
  
  doc.text('Materias Primas', 25, y);
  doc.text('Alta', 80, y);
  doc.text('Media', 130, y);

  addFooter(doc);
  doc.save('FinMarket_Tipos_Activos.pdf');
};

// PDF 3: Cómo Leer Gráficos de Precios
export const generateLeerGraficos = () => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'CÓMO LEER GRÁFICOS DE PRECIOS');

  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const intro = 'Los gráficos son la herramienta fundamental del análisis técnico. Te permiten visualizar el comportamiento del precio y tomar decisiones informadas.';
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, y);
  y += splitIntro.length * 6 + 15;

  // Tipos de gráficos
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Tipos de Gráficos', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('1. Gráfico de Línea', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('El más simple. Conecta los precios de cierre en el tiempo.', 25, y);
  y += 6;
  doc.text('Ideal para: Ver tendencias generales sin ruido.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('2. Gráfico de Velas (Candlestick)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Cada vela muestra: apertura, cierre, máximo y mínimo.', 25, y);
  y += 6;
  doc.text('• Vela verde/blanca = el precio subió (cierre > apertura)', 25, y);
  y += 6;
  doc.text('• Vela roja/negra = el precio bajó (cierre < apertura)', 25, y);
  y += 6;
  doc.text('Ideal para: Análisis detallado y patrones.', 25, y);
  y += 15;

  // Componentes de una vela
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Anatomía de una Vela', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('• Cuerpo: Distancia entre apertura y cierre', 25, y);
  y += 6;
  doc.text('• Mecha superior: Máximo alcanzado', 25, y);
  y += 6;
  doc.text('• Mecha inferior: Mínimo alcanzado', 25, y);
  y += 6;
  doc.text('• Cuerpo grande = movimiento fuerte', 25, y);
  y += 6;
  doc.text('• Cuerpo pequeño = indecisión del mercado', 25, y);
  y += 15;

  // Tendencias
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Identificar Tendencias', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Tendencia Alcista (Uptrend)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Máximos y mínimos cada vez más altos. Señal de fortaleza.', 25, y);
  y += 6;
  doc.text('Estrategia: Comprar en retrocesos (pullbacks).', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Tendencia Bajista (Downtrend)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Máximos y mínimos cada vez más bajos. Señal de debilidad.', 25, y);
  y += 6;
  doc.text('Estrategia: Evitar compras, considerar ventas.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Tendencia Lateral (Rango)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('El precio oscila entre soporte y resistencia sin dirección clara.', 25, y);
  y += 6;
  doc.text('Estrategia: Comprar en soporte, vender en resistencia.', 25, y);
  
  // Nueva página
  doc.addPage();
  y = 20;

  // Soportes y resistencias
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Soporte y Resistencia', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Soporte', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Nivel de precio donde históricamente la demanda ha sido fuerte,', 25, y);
  y += 6;
  doc.text('evitando que el precio caiga más. "El suelo".', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Resistencia', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Nivel de precio donde históricamente la oferta ha sido fuerte,', 25, y);
  y += 6;
  doc.text('evitando que el precio suba más. "El techo".', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Regla importante:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Cuando un soporte se rompe, suele convertirse en resistencia (y viceversa).', 25, y);
  y += 15;

  // Volumen
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('El Volumen', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('El volumen indica cuántas unidades se negociaron en un período.', 25, y);
  y += 8;
  
  doc.text('• Volumen alto en subida = fuerza compradora, tendencia saludable', 25, y);
  y += 6;
  doc.text('• Volumen bajo en subida = poco interés, tendencia débil', 25, y);
  y += 6;
  doc.text('• Volumen alto en bajada = pánico, posible capitulación', 25, y);
  y += 6;
  doc.text('• Volumen bajo en bajada = corrección menor', 25, y);
  y += 15;

  // Timeframes
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Marcos Temporales (Timeframes)', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Puedes ver gráficos en diferentes escalas de tiempo:', 25, y);
  y += 8;
  
  doc.text('• 1 minuto (1m): Day traders muy activos', 25, y);
  y += 6;
  doc.text('• 5-15 minutos: Scalping y day trading', 25, y);
  y += 6;
  doc.text('• 1 hora (1h): Swing trading', 25, y);
  y += 6;
  doc.text('• 4 horas (4h): Tendencias intermedias', 25, y);
  y += 6;
  doc.text('• Diario (1D): Inversores y swing traders', 25, y);
  y += 6;
  doc.text('• Semanal (1W): Inversores a largo plazo', 25, y);
  y += 15;

  // Consejo final
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, 170, 35, 'F');
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Consejo Práctico', 25, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const consejo = 'Analiza siempre múltiples timeframes. La tendencia en gráfico diario es más confiable que en gráfico de 5 minutos. Usa el largo plazo para la dirección general y el corto plazo para el timing de entrada.';
  const splitConsejo = doc.splitTextToSize(consejo, 160);
  doc.text(splitConsejo, 25, y);

  addFooter(doc);
  doc.save('FinMarket_Leer_Graficos.pdf');
};

// PDF 4: Gestión de Riesgo
export const generateGestionRiesgo = () => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'GESTIÓN DE RIESGO');

  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const intro = 'La gestión de riesgo es lo que separa a los traders exitosos de los que pierden su capital. No se trata de eliminar el riesgo, sino de controlarlo inteligentemente.';
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, y);
  y += splitIntro.length * 6 + 15;

  // Regla del 1-2%
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('La Regla del 1-2%', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const regla = 'Nunca arriesgues más del 1-2% de tu capital total en una sola operación. Si tienes €10,000, tu riesgo máximo por trade es €100-200.';
  const splitRegla = doc.splitTextToSize(regla, 170);
  doc.text(splitRegla, 25, y);
  y += splitRegla.length * 6 + 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('¿Por qué?', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Incluso perdiendo 10 operaciones seguidas (raro), solo pierdes 10-20% del capital.', 25, y);
  y += 6;
  doc.text('Esto te mantiene en el juego y te permite recuperarte.', 25, y);
  y += 15;

  // Stop Loss
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Stop-Loss: Tu Red de Seguridad', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const stopLoss = 'Una orden de stop-loss vende automáticamente tu posición si el precio cae a un nivel predeterminado, limitando tu pérdida.';
  const splitStopLoss = doc.splitTextToSize(stopLoss, 170);
  doc.text(splitStopLoss, 25, y);
  y += splitStopLoss.length * 6 + 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('Cómo colocarlo:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('1. Identifica un nivel técnico lógico (soporte, mínimo reciente)', 25, y);
  y += 6;
  doc.text('2. Coloca el stop justo por debajo de ese nivel', 25, y);
  y += 6;
  doc.text('3. Calcula cuántas acciones comprar para no exceder tu riesgo del 1-2%', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ejemplo:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Capital: €10,000 | Riesgo: 2% = €200', 25, y);
  y += 6;
  doc.text('Compra en €50, stop-loss en €48 (€2 de riesgo por acción)', 25, y);
  y += 6;
  doc.text('Acciones a comprar: €200 ÷ €2 = 100 acciones', 25, y);
  y += 15;

  // Take Profit
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Take-Profit: Asegurar Ganancias', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const takeProfit = 'Orden que vende automáticamente cuando alcanzas un objetivo de ganancia. Te protege de la codicia y asegura beneficios.';
  const splitTakeProfit = doc.splitTextToSize(takeProfit, 170);
  doc.text(splitTakeProfit, 25, y);
  y += splitTakeProfit.length * 6 + 8;
  
  doc.text('Ratio Riesgo/Beneficio ideal: mínimo 1:2', 25, y);
  y += 6;
  doc.text('Si arriesgas €100, busca ganar al menos €200.', 25, y);
  
  // Nueva página
  doc.addPage();
  y = 20;

  // Diversificación
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Diversificación', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('"No pongas todos los huevos en la misma cesta"', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Por qué diversificar:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Reduce el riesgo de pérdidas catastróficas', 25, y);
  y += 6;
  doc.text('• Si un activo cae, otros pueden compensar', 25, y);
  y += 6;
  doc.text('• Diferentes activos se mueven de forma distinta', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Cómo diversificar:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Por clase de activo: acciones, crypto, commodities, ETFs', 25, y);
  y += 6;
  doc.text('• Por sector: tecnología, energía, finanzas, salud', 25, y);
  y += 6;
  doc.text('• Por geografía: España, Europa, USA, emergentes', 25, y);
  y += 15;

  // Position Sizing
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Position Sizing (Tamaño de Posición)', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('No inviertas la misma cantidad en cada operación. Ajusta según:', 25, y);
  y += 8;
  
  doc.text('• Confianza en la operación (alta confianza = más capital)', 25, y);
  y += 6;
  doc.text('• Volatilidad del activo (más volátil = posición menor)', 25, y);
  y += 6;
  doc.text('• Momento de la cuenta (racha perdedora = reducir tamaño)', 25, y);
  y += 15;

  // Errores comunes
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text('Errores Fatales a Evitar', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('❌ Operar sin stop-loss ("ya subirá...") → Pérdidas masivas', 25, y);
  y += 7;
  doc.text('❌ Mover el stop-loss más lejos para evitar la pérdida → Pérdida mayor', 25, y);
  y += 7;
  doc.text('❌ Arriesgar 10-20% en una sola operación → Ruina matemática', 25, y);
  y += 7;
  doc.text('❌ Redoblar después de pérdidas (revenge trading) → Desastre', 25, y);
  y += 7;
  doc.text('❌ No diversificar ("Bitcoin solo") → Riesgo concentrado', 25, y);
  y += 15;

  // Checklist
  doc.setFillColor(240, 255, 240);
  doc.rect(20, y, 170, 55, 'F');
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Checklist Antes de Cada Operación', 25, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('☐ ¿He definido mi stop-loss?', 25, y);
  y += 6;
  doc.text('☐ ¿Estoy arriesgando máximo 1-2% de mi capital?', 25, y);
  y += 6;
  doc.text('☐ ¿Mi ratio riesgo/beneficio es al menos 1:2?', 25, y);
  y += 6;
  doc.text('☐ ¿Esta operación no concentra demasiado en un sector?', 25, y);
  y += 6;
  doc.text('☐ ¿Estoy tomando esta decisión de forma racional, no emocional?', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Si respondes NO a alguna, reconsidera la operación.', 25, y);

  addFooter(doc);
  doc.save('FinMarket_Gestion_Riesgo.pdf');
};

// PDF 5: Métricas de Rendimiento
export const generateMetricasRendimiento = () => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'MÉTRICAS DE RENDIMIENTO');

  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const intro = 'Para mejorar como trader, necesitas medir tu desempeño de forma objetiva. Estas métricas te ayudarán a evaluar tu progreso y detectar áreas de mejora.';
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, y);
  y += splitIntro.length * 6 + 15;

  // Win Rate
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Win Rate (Tasa de Acierto)', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué es?', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Porcentaje de operaciones ganadoras sobre el total de operaciones.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Fórmula:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Win Rate = (Operaciones ganadoras / Total operaciones) × 100', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ejemplo:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('50 operaciones: 30 ganancias, 20 pérdidas → Win Rate = 60%', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Interpretación:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• > 50%: Bueno, más aciertos que fallos', 25, y);
  y += 6;
  doc.text('• 40-50%: Aceptable si tu ratio R/R es > 1:2', 25, y);
  y += 6;
  doc.text('• < 40%: Necesitas revisar tu estrategia', 25, y);
  y += 15;

  // Sharpe Ratio
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Sharpe Ratio', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('¿Qué es?', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const sharpe = 'Mide el retorno ajustado al riesgo. ¿Cuánto ganas por cada unidad de riesgo que asumes?';
  const splitSharpe = doc.splitTextToSize(sharpe, 170);
  doc.text(splitSharpe, 25, y);
  y += splitSharpe.length * 6 + 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Interpretación:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• Sharpe > 1: Bueno', 25, y);
  y += 6;
  doc.text('• Sharpe > 2: Muy bueno', 25, y);
  y += 6;
  doc.text('• Sharpe > 3: Excelente', 25, y);
  y += 6;
  doc.text('• Sharpe < 1: Asumes demasiado riesgo para el retorno', 25, y);
  y += 15;

  // Drawdown
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Drawdown Máximo', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('La mayor caída desde un pico hasta un valle. Mide cuánto puedes perder.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ejemplo:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Pico: €60,000 → Valle: €45,000 → Drawdown = 25%', 25, y);
  y += 10;
  
  doc.text('Un drawdown del 50% requiere un 100% de ganancia para recuperar.', 25, y);
  y += 6;
  doc.text('Por eso la gestión de riesgo es crítica.', 25, y);

  // Nueva página
  doc.addPage();
  y = 20;

  // Ratio Riesgo/Beneficio
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(102, 126, 234);
  doc.text('Ratio Riesgo/Beneficio (R/R)', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Relación entre lo que arriesgas y lo que esperas ganar.', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Fórmula:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('R/R = Beneficio esperado / Riesgo asumido', 25, y);
  y += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text('Ejemplo:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Arriesgas €100, objetivo €300 → R/R = 1:3', 25, y);
  y += 10;
  
  doc.text('Regla: Busca mínimo 1:2 para compensar operaciones perdedoras.', 25, y);
  y += 15;

  // Profit Factor
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Profit Factor', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Profit Factor = Total ganancias / Total pérdidas', 25, y);
  y += 10;
  
  doc.text('• PF > 1.5: Estrategia rentable', 25, y);
  y += 6;
  doc.text('• PF 1.0-1.5: Marginal', 25, y);
  y += 6;
  doc.text('• PF < 1.0: Pierdes dinero', 25, y);
  y += 15;

  // Tabla resumen
  doc.setFillColor(240, 255, 240);
  doc.rect(20, y, 170, 60, 'F');
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Dashboard de un Trader Exitoso', 25, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('✓ Win Rate: 55-65%', 25, y);
  y += 6;
  doc.text('✓ Sharpe Ratio: > 1.5', 25, y);
  y += 6;
  doc.text('✓ Drawdown Máximo: < 20%', 25, y);
  y += 6;
  doc.text('✓ Ratio R/R promedio: > 1:2', 25, y);
  y += 6;
  doc.text('✓ Profit Factor: > 1.5', 25, y);
  y += 6;
  doc.text('✓ Diversificación: 3-4 categorías de activos', 25, y);

  addFooter(doc);
  doc.save('FinMarket_Metricas_Rendimiento.pdf');
};

// PDF 6: Psicología del Trading
export const generatePsicologiaTrading = () => {
  const doc = new jsPDF();
  let y = addHeader(doc, 'PSICOLOGÍA DEL TRADING');

  doc.setTextColor(0, 0, 0);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const intro = 'El 90% del éxito en trading es psicológico. La mejor estrategia fracasa si no puedes controlar tus emociones. Aprende a dominar tu mente para dominar el mercado.';
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, y);
  y += splitIntro.length * 6 + 15;

  // Enemigos psicológicos
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text('Los Enemigos Psicológicos', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('1. El Miedo (Fear)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Síntomas:', 25, y);
  y += 6;
  doc.text('• No ejecutas operaciones ganadoras por miedo', 25, y);
  y += 6;
  doc.text('• Cierras posiciones demasiado pronto', 25, y);
  y += 6;
  doc.text('• Quedas paralizado en momentos clave', 25, y);
  y += 8;
  doc.setFont(undefined, 'bold');
  doc.text('Solución:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Opera con dinero que puedas perder. Reduce tamaño de posición.', 25, y);
  y += 12;

  doc.setFont(undefined, 'bold');
  doc.text('2. La Codicia (Greed)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Síntomas:', 25, y);
  y += 6;
  doc.text('• Quieres hacerte rico rápido', 25, y);
  y += 6;
  doc.text('• Aumentas riesgo después de ganar', 25, y);
  y += 6;
  doc.text('• No respetas tu take-profit', 25, y);
  y += 8;
  doc.setFont(undefined, 'bold');
  doc.text('Solución:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Define objetivos realistas. Automatiza tus take-profits.', 25, y);
  y += 12;

  doc.setFont(undefined, 'bold');
  doc.text('3. Revenge Trading (Venganza)', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Síntomas:', 25, y);
  y += 6;
  doc.text('• Intentas recuperar pérdidas inmediatamente', 25, y);
  y += 6;
  doc.text('• Duplicas el tamaño de posición tras perder', 25, y);
  y += 6;
  doc.text('• Operas por emoción, no por estrategia', 25, y);
  y += 8;
  doc.setFont(undefined, 'bold');
  doc.text('Solución:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Después de 2 pérdidas seguidas, para. Descansa 24h.', 25, y);

  // Nueva página
  doc.addPage();
  y = 20;

  // FOMO
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('4. FOMO (Fear Of Missing Out)', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('El miedo a perderse una oportunidad. Ves Bitcoin subir y compras en máximos.', 25, y);
  y += 8;
  
  doc.setFont(undefined, 'bold');
  doc.text('Solución:', 25, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('Recuerda: siempre habrá otra oportunidad. Espera tu setup.', 25, y);
  y += 15;

  // Reglas de disciplina
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('Las 10 Reglas de Oro de la Disciplina', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('1. Sigue tu plan de trading sin excepción', 20, y);
  y += 7;
  doc.text('2. Nunca muevas un stop-loss para evitar la pérdida', 20, y);
  y += 7;
  doc.text('3. Acepta las pérdidas como parte del proceso', 20, y);
  y += 7;
  doc.text('4. No operes cuando estés emocional (enfadado, eufórico)', 20, y);
  y += 7;
  doc.text('5. Registra todas tus operaciones en un diario', 20, y);
  y += 7;
  doc.text('6. Respeta tus límites de riesgo diario/semanal', 20, y);
  y += 7;
  doc.text('7. No confundas suerte con habilidad', 20, y);
  y += 7;
  doc.text('8. Aprende de cada error', 20, y);
  y += 7;
  doc.text('9. Celebra el proceso, no solo los resultados', 20, y);
  y += 7;
  doc.text('10. Sé paciente: la riqueza lleva tiempo', 20, y);
  y += 15;

  // Diario de trading
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('El Diario de Trading', 20, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const diario = 'Anota cada operación: ¿Por qué entraste? ¿Cómo te sentías? ¿Qué salió bien/mal? Revisar tu diario mensualmente revela patrones que no ves en tiempo real.';
  const splitDiario = doc.splitTextToSize(diario, 170);
  doc.text(splitDiario, 20, y);
  y += splitDiario.length * 6 + 10;

  doc.setFont(undefined, 'bold');
  doc.text('Preguntas clave para tu diario:', 20, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  doc.text('• ¿Seguí mi plan o improvisé?', 25, y);
  y += 6;
  doc.text('• ¿Estaba tranquilo o ansioso al operar?', 25, y);
  y += 6;
  doc.text('• ¿Respeté mi stop-loss?', 25, y);
  y += 6;
  doc.text('• ¿Qué haría diferente la próxima vez?', 25, y);
  y += 15;

  // Caja final
  doc.setFillColor(255, 243, 205);
  doc.rect(20, y, 170, 45, 'F');
  y += 10;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Mantra del Trader Disciplinado', 25, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  const mantra = '"No controlo el mercado, pero sí controlo mi respuesta al mercado. Opero según mi plan, no según mis emociones. Una pérdida no me define. Mi disciplina me hace rentable a largo plazo."';
  const splitMantra = doc.splitTextToSize(mantra, 160);
  doc.text(splitMantra, 25, y);

  addFooter(doc);
  doc.save('FinMarket_Psicologia_Trading.pdf');
};

export const downloadEducationalPDF = (resourceId) => {
  switch(resourceId) {
    case 1:
      generateIntroduccionTrading();
      break;
    case 2:
      generateTiposActivos();
      break;
    case 3:
      generateLeerGraficos();
      break;
    case 4:
      generateGestionRiesgo();
      break;
    case 5:
      generateMetricasRendimiento();
      break;
    case 6:
      generatePsicologiaTrading();
      break;
    default:
      alert('PDF no disponible aún');
  }
};