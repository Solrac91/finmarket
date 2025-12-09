import { jsPDF } from 'jspdf';

export const generateStudentReport = (studentData, metrics) => {
  const doc = new jsPDF();
  
  // Calcular valores
  const invested = studentData.portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalValue = studentData.balance + invested;
  const initialBalance = 50000;
  const performance = ((totalValue - initialBalance) / initialBalance) * 100;
  const profit = totalValue - initialBalance;

  let y = 20;

// Header corporativo profesional
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Logo: círculo morado con símbolo $ dibujado
  doc.setFillColor(118, 75, 162);
  doc.circle(25, 20, 9, 'F');
  
  // Dibujar símbolo $ manualmente para que quede centrado y grande
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2);
  
  // Línea vertical del $
  doc.line(25, 13, 25, 27);
  
  // Curva superior (S)
  doc.setLineWidth(1.8);
  doc.line(22, 15, 28, 15);
  doc.line(22, 15, 21, 17);
  doc.line(21, 17, 22, 19);
  
  // Curva inferior (S)
  doc.line(22, 19, 28, 19);
  doc.line(28, 19, 29, 21);
  doc.line(29, 21, 28, 23);
  doc.line(28, 23, 22, 23);
  
  // Nombre corporativo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('FinMarket', 40, 22);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Simulador Educativo de Trading Profesional', 40, 30);
  
  // Línea decorativa
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);
  
  // Título del documento
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('REPORTE DE ANÁLISIS INDIVIDUAL', 105, 46, { align: 'center' });
  
  y = 65;
  // Información del estudiante
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(`Estudiante: ${studentData.name}`, 20, y);
  y += 7;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(studentData.email, 20, y);
  y += 6;
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;

  // Resumen financiero
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Resumen Financiero', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Saldo Disponible: €${studentData.balance.toLocaleString('es-ES')}`, 20, y);
  y += 7;
  doc.text(`Valor Invertido: €${invested.toLocaleString('es-ES')}`, 20, y);
  y += 7;
  doc.text(`Valor Total: €${totalValue.toLocaleString('es-ES')}`, 20, y);
  y += 7;
  doc.text(`Rendimiento: ${performance >= 0 ? '+' : ''}${performance.toFixed(2)}%`, 20, y);
  y += 7;
  doc.text(`Ganancia/Pérdida: ${profit >= 0 ? '+' : ''}€${profit.toLocaleString('es-ES')}`, 20, y);
  y += 15;

  // Métricas
  doc.setFontSize(14);
  doc.text('Métricas de Trading', 20, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.text(`Win Rate: ${metrics.winRate}%`, 20, y);
  y += 7;
  doc.text(`Diversificación: ${metrics.diversification.score}/4 categorías`, 20, y);
  y += 7;
  doc.text(`Categorías: ${metrics.diversification.categories.join(', ')}`, 20, y);
  y += 7;
  doc.text(`Retorno Promedio: ${metrics.avgReturnPerTrade >= 0 ? '+' : ''}${metrics.avgReturnPerTrade}%`, 20, y);
  y += 7;
  doc.text(`Holding Promedio: ${metrics.avgHoldingTime} días`, 20, y);
  y += 7;
  doc.text(`Total Operaciones: ${metrics.totalTrades}`, 20, y);
  y += 7;
  doc.text(`Posiciones Activas: ${metrics.activeTrades}`, 20, y);
  y += 15;

  // Mejor operación
  if (metrics.bestTrade) {
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text('Mejor Operación', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Activo: ${metrics.bestTrade.symbol}`, 20, y);
    y += 6;
    doc.text(`Compra: €${metrics.bestTrade.buyPrice.toFixed(2)} → Venta: €${metrics.bestTrade.sellPrice.toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Ganancia: +€${metrics.bestTrade.profit.toFixed(2)} (+${metrics.bestTrade.profitPercent.toFixed(2)}%)`, 20, y);
    y += 12;
  }

  // Peor operación
  if (metrics.worstTrade) {
    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text('Peor Operación', 20, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Activo: ${metrics.worstTrade.symbol}`, 20, y);
    y += 6;
    doc.text(`Compra: €${metrics.worstTrade.buyPrice.toFixed(2)} → Venta: €${metrics.worstTrade.sellPrice.toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Pérdida: €${metrics.worstTrade.profit.toFixed(2)} (${metrics.worstTrade.profitPercent.toFixed(2)}%)`, 20, y);
    y += 15;
  }

  // Portfolio
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Portfolio Actual', 20, y);
  y += 10;
  
  if (studentData.portfolio.length > 0) {
    doc.setFontSize(9);
    studentData.portfolio.forEach((asset, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFontSize(14);
        doc.text('Portfolio Actual (continuación)', 20, y);
        y += 10;
        doc.setFontSize(9);
      }
      
      const profit = asset.currentValue - (asset.shares * asset.avgPrice);
      const profitPercent = (profit / (asset.shares * asset.avgPrice)) * 100;
      
      doc.text(`${asset.symbol} - ${asset.name}`, 20, y);
      y += 5;
      doc.text(`  Cantidad: ${asset.shares.toFixed(2)} | Valor: €${asset.currentValue.toFixed(2)} | P/L: ${profit >= 0 ? '+' : ''}€${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`, 20, y);
      y += 7;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Sin activos en cartera', 20, y);
  }

 // Footer corporativo en todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea superior del footer
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Texto del footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('FinMarket - Simulador Educativo', 20, 285);
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 290, { align: 'center' });
  }

  // Guardar
  doc.save(`FinMarket_${studentData.name}_${new Date().toISOString().split('T')[0]}.pdf`);
};