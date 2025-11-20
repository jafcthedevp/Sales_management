const XLSX = require('xlsx');

const filePath = 'C:\\Users\\flore\\Downloads\\Imforme-03-11.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  console.log(`Hojas disponibles: ${workbook.SheetNames.join(', ')}\n`);

  // Revisar ambas hojas
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`HOJA ${index + 1}: ${sheetName}`);
    console.log('='.repeat(60));

    const worksheet = workbook.Sheets[sheetName];
    console.log(`Rango: ${worksheet['!ref']}`);

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    console.log(`Total de filas: ${jsonData.length}`);

    // Mostrar primeras 5 filas con datos
    console.log('\n--- PRIMERAS 5 FILAS ---');
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      const filtered = row.filter(cell => cell !== '' && cell !== null);
      if (filtered.length > 0) {
        console.log(`Fila ${i + 1}:`, filtered.slice(0, 10));
      }
    }

    // Si es la hoja 2, mostrar más detalles
    if (index === 1) {
      console.log('\n--- ANÁLISIS HOJA 2 (primeras 10 filas completas) ---');
      const jsonWithHeaders = XLSX.utils.sheet_to_json(worksheet);
      console.log(JSON.stringify(jsonWithHeaders.slice(0, 3), null, 2));
    }
  });

} catch (error) {
  console.error('Error al leer el archivo:', error.message);
}
