import { launch } from 'puppeteer';

const BASE_URL = 'http://localhost:3000';

// Páginas a testear
const pages = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'Ventas', url: '/ventas' },
  { name: 'Export', url: '/export' },
  { name: 'Upload', url: '/upload' },
];

async function measurePageLoad(page, pageName, url) {
  console.log(`\n📊 Testeando: ${pageName} (${url})`);
  console.log('─'.repeat(60));

  const metrics = [];
  const runs = 3; // Hacer 3 corridas para obtener promedio

  for (let i = 0; i < runs; i++) {
    await page.goto(BASE_URL + url, { waitUntil: 'networkidle2' });

    // Obtener métricas de rendimiento
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        // Tiempo de carga completo
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        // Tiempo hasta el DOM esté listo
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        // First Paint
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        // First Contentful Paint
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        // Tiempo de respuesta del servidor
        responseTime: navigation.responseEnd - navigation.requestStart,
        // Tiempo de procesamiento del DOM
        domProcessing: navigation.domComplete - navigation.domLoading,
      };
    });

    metrics.push(performanceMetrics);

    // Pequeña pausa entre corridas
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Calcular promedios
  const avg = {
    loadTime: metrics.reduce((sum, m) => sum + m.loadTime, 0) / runs,
    domContentLoaded: metrics.reduce((sum, m) => sum + m.domContentLoaded, 0) / runs,
    firstPaint: metrics.reduce((sum, m) => sum + m.firstPaint, 0) / runs,
    fcp: metrics.reduce((sum, m) => sum + m.fcp, 0) / runs,
    responseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / runs,
    domProcessing: metrics.reduce((sum, m) => sum + m.domProcessing, 0) / runs,
  };

  // Mostrar resultados
  console.log(`  ⏱️  Tiempo de Carga Total:       ${avg.loadTime.toFixed(0)} ms`);
  console.log(`  ⚡ DOM Content Loaded:          ${avg.domContentLoaded.toFixed(0)} ms`);
  console.log(`  🎨 First Paint:                 ${avg.firstPaint.toFixed(0)} ms`);
  console.log(`  🖼️  First Contentful Paint:     ${avg.fcp.toFixed(0)} ms`);
  console.log(`  📡 Tiempo de Respuesta Servidor: ${avg.responseTime.toFixed(0)} ms`);
  console.log(`  🔧 Procesamiento del DOM:       ${avg.domProcessing.toFixed(0)} ms`);

  return avg;
}

async function runTests() {
  console.log('\n🚀 INICIANDO PRUEBAS DE RENDIMIENTO');
  console.log('═'.repeat(60));

  const browser = await launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Simular viewport de desktop
  await page.setViewport({ width: 1920, height: 1080 });

  const results = {};

  try {
    for (const pageInfo of pages) {
      try {
        results[pageInfo.name] = await measurePageLoad(page, pageInfo.name, pageInfo.url);
      } catch (error) {
        console.log(`  ❌ Error en ${pageInfo.name}: ${error.message}`);
      }
    }

    // Resumen final
    console.log('\n\n📈 RESUMEN DE RESULTADOS');
    console.log('═'.repeat(60));
    console.log('\nTiempos de First Contentful Paint (FCP):');
    Object.entries(results).forEach(([name, metrics]) => {
      const rating = metrics.fcp < 1000 ? '🟢 Excelente' :
                     metrics.fcp < 2500 ? '🟡 Bueno' : '🔴 Necesita mejora';
      console.log(`  ${name.padEnd(15)} ${metrics.fcp.toFixed(0).padStart(6)} ms  ${rating}`);
    });

    console.log('\nTiempos de Carga Total:');
    Object.entries(results).forEach(([name, metrics]) => {
      const rating = metrics.loadTime < 1500 ? '🟢 Rápido' :
                     metrics.loadTime < 3000 ? '🟡 Aceptable' : '🔴 Lento';
      console.log(`  ${name.padEnd(15)} ${metrics.loadTime.toFixed(0).padStart(6)} ms  ${rating}`);
    });

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Pruebas completadas\n');
  }
}

runTests().catch(console.error);
