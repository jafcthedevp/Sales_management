import { launch } from 'puppeteer';

const BASE_URL = 'http://localhost:3001';

async function reviewDashboard() {
  console.log('\n📊 REVISANDO DASHBOARD\n');
  console.log('═'.repeat(60));

  const browser = await launch({
    headless: false, // Mostrar navegador
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // Ir al dashboard
    console.log('\n🔍 Navegando al dashboard...');
    await page.goto(BASE_URL + '/dashboard', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Esperar a que cargue el contenido
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extraer toda la información visible
    const dashboardData = await page.evaluate(() => {
      const data = {
        header: {},
        statsCards: [],
        paymentAnalytics: {
          byCategory: [],
          byCompany: [],
          topMethods: []
        },
        recentSales: []
      };

      // Header
      const h1 = document.querySelector('h1');
      const welcomeText = document.querySelector('p.text-gray-500');
      if (h1) data.header.title = h1.textContent.trim();
      if (welcomeText) data.header.welcome = welcomeText.textContent.trim();

      // Stats Cards
      const cards = document.querySelectorAll('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
      cards.forEach(card => {
        const title = card.querySelector('.text-sm.font-medium');
        const value = card.querySelector('.text-2xl.font-bold');
        const description = card.querySelector('.text-xs.text-muted-foreground');

        if (title && value) {
          data.statsCards.push({
            title: title.textContent.trim(),
            value: value.textContent.trim(),
            description: description ? description.textContent.trim() : ''
          });
        }
      });

      // Payment Analytics - Categorías
      const categorySection = Array.from(document.querySelectorAll('h3, .text-lg.font-bold')).find(
        el => el.textContent.includes('Distribución por Tipo de Pago') ||
             el.closest('.card-header')?.textContent.includes('Tipo de Pago')
      );

      if (categorySection) {
        const categoryContainer = categorySection.closest('div[class*="card"]');
        if (categoryContainer) {
          const categoryRows = categoryContainer.querySelectorAll('.space-y-2');
          categoryRows.forEach(row => {
            const label = row.querySelector('.font-medium');
            const count = row.querySelector('.text-muted-foreground');
            const amount = row.querySelector('.font-bold');
            const percentage = row.querySelector('.badge, [class*="badge"]');

            if (label) {
              data.paymentAnalytics.byCategory.push({
                category: label.textContent.trim(),
                count: count ? count.textContent.trim() : '',
                amount: amount ? amount.textContent.trim() : '',
                percentage: percentage ? percentage.textContent.trim() : ''
              });
            }
          });
        }
      }

      // Payment Analytics - Empresas
      const companyElements = document.querySelectorAll('.text-lg.font-bold');
      companyElements.forEach(el => {
        const text = el.textContent.trim();
        if (text === 'OVERSHARK' || text === 'BRAVOS' || text === 'OTROS') {
          const container = el.closest('.space-y-3');
          if (container) {
            const badge = container.querySelector('[class*="badge"]');
            const count = container.querySelector('.text-muted-foreground');
            const amount = container.querySelector('.font-semibold.text-foreground');

            data.paymentAnalytics.byCompany.push({
              company: text,
              percentage: badge ? badge.textContent.trim() : '',
              count: count ? count.textContent.trim() : '',
              amount: amount ? amount.textContent.trim() : ''
            });
          }
        }
      });

      // Top Métodos de Pago
      const topMethodsContainer = Array.from(document.querySelectorAll('.card-header')).find(
        el => el.textContent.includes('Top 10')
      );

      if (topMethodsContainer) {
        const methodCards = topMethodsContainer.closest('div[class*="card"]')?.querySelectorAll('.grid > .card');
        methodCards?.forEach((card, index) => {
          const code = card.querySelector('.font-bold.text-sm');
          const description = card.querySelector('.text-xs.text-muted-foreground');
          const company = Array.from(card.querySelectorAll('[class*="badge"]')).find(
            b => b.textContent.includes('OVERSHARK') || b.textContent.includes('BRAVOS')
          );
          const salesCount = card.querySelector('.font-semibold');
          const amount = card.querySelector('.font-bold.text-sm:last-child');

          if (code) {
            data.paymentAnalytics.topMethods.push({
              rank: index + 1,
              code: code.textContent.trim(),
              description: description ? description.textContent.trim() : '',
              company: company ? company.textContent.trim() : '',
              sales: salesCount ? salesCount.textContent.trim() : '',
              amount: amount ? amount.textContent.trim() : ''
            });
          }
        });
      }

      // Recent Sales
      const recentSalesCard = Array.from(document.querySelectorAll('.card-title')).find(
        el => el.textContent.includes('Recientes') || el.textContent.includes('Recent')
      );

      if (recentSalesCard) {
        const salesContainer = recentSalesCard.closest('div[class*="card"]');
        const salesRows = salesContainer?.querySelectorAll('.flex.items-center.gap-4');
        salesRows?.forEach(row => {
          const textContent = row.textContent;
          data.recentSales.push(textContent.trim());
        });
      }

      return data;
    });

    // Imprimir resultados
    console.log('\n📋 HEADER DEL DASHBOARD');
    console.log('─'.repeat(60));
    console.log(`Título: ${dashboardData.header.title || 'N/A'}`);
    console.log(`Mensaje: ${dashboardData.header.welcome || 'N/A'}`);

    console.log('\n\n📊 TARJETAS DE ESTADÍSTICAS');
    console.log('─'.repeat(60));
    dashboardData.statsCards.forEach((card, i) => {
      console.log(`\n${i + 1}. ${card.title}`);
      console.log(`   Valor: ${card.value}`);
      if (card.description) console.log(`   Descripción: ${card.description}`);
    });

    console.log('\n\n📈 ANÁLISIS DE MÉTODOS DE PAGO - POR CATEGORÍA');
    console.log('─'.repeat(60));
    if (dashboardData.paymentAnalytics.byCategory.length > 0) {
      dashboardData.paymentAnalytics.byCategory.forEach((cat, i) => {
        console.log(`\n${i + 1}. ${cat.category}`);
        console.log(`   Cantidad: ${cat.count}`);
        console.log(`   Monto: ${cat.amount}`);
        console.log(`   Porcentaje: ${cat.percentage}`);
      });
    } else {
      console.log('   No hay datos de categorías');
    }

    console.log('\n\n🏢 ANÁLISIS POR EMPRESA');
    console.log('─'.repeat(60));
    if (dashboardData.paymentAnalytics.byCompany.length > 0) {
      dashboardData.paymentAnalytics.byCompany.forEach((comp, i) => {
        console.log(`\n${i + 1}. ${comp.company}`);
        console.log(`   Porcentaje: ${comp.percentage}`);
        console.log(`   Cantidad: ${comp.count}`);
        console.log(`   Monto: ${comp.amount}`);
      });
    } else {
      console.log('   No hay datos de empresas');
    }

    console.log('\n\n🏆 TOP 10 MÉTODOS DE PAGO');
    console.log('─'.repeat(60));
    if (dashboardData.paymentAnalytics.topMethods.length > 0) {
      dashboardData.paymentAnalytics.topMethods.forEach(method => {
        console.log(`\n#${method.rank} - ${method.code}`);
        console.log(`   Descripción: ${method.description}`);
        console.log(`   Empresa: ${method.company}`);
        console.log(`   Ventas: ${method.sales}`);
        console.log(`   Monto: ${method.amount}`);
      });
    } else {
      console.log('   No hay datos de top métodos');
    }

    console.log('\n\n📝 VENTAS RECIENTES');
    console.log('─'.repeat(60));
    if (dashboardData.recentSales.length > 0) {
      dashboardData.recentSales.forEach((sale, i) => {
        console.log(`${i + 1}. ${sale}`);
      });
    } else {
      console.log('   No hay ventas recientes');
    }

    console.log('\n\n' + '═'.repeat(60));
    console.log('Presiona Ctrl+C para cerrar el navegador y salir\n');

    // Tomar screenshot
    await page.screenshot({
      path: 'dashboard-screenshot.png',
      fullPage: true
    });
    console.log('📸 Screenshot guardado en: dashboard-screenshot.png\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  // No cerrar el navegador para que puedas verlo
  // await browser.close();
}

reviewDashboard().catch(console.error);
