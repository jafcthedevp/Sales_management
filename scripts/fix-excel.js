const XLSX = require('xlsx');
const path = require('path');

const inputFile = 'C:\\Users\\flore\\Downloads\\Imforme-03-11.xlsx';
const outputFile = 'C:\\Users\\flore\\Downloads\\Imforme-03-11-limpio.xlsx';

try {
  console.log('Leyendo archivo original...');
  const workbook = XLSX.readFile(inputFile);

  // Leer la Hoja 2 (que tiene los datos correctos)
  const sheet2Name = workbook.SheetNames[1];
  const sheet2 = workbook.Sheets[sheet2Name];

  console.log(`Extrayendo datos de: ${sheet2Name}`);
  console.log(`Rango: ${sheet2['!ref']}`);

  // Crear un nuevo workbook
  const newWorkbook = XLSX.utils.book_new();

  // Agregar la hoja 2 como primera (y única) hoja con nombre "Ventas"
  XLSX.utils.book_append_sheet(newWorkbook, sheet2, 'Ventas');

  // Guardar el nuevo archivo
  XLSX.writeFile(newWorkbook, outputFile);

  console.log('\n✓ Archivo creado exitosamente!');
  console.log(`Ubicación: ${outputFile}`);
  console.log('\nAhora puedes subir este archivo al sistema.');

  // Mostrar preview de los datos
  const jsonData = XLSX.utils.sheet_to_json(sheet2);
  console.log(`\nTotal de registros: ${jsonData.length}`);
  console.log('\nPrimeros 3 registros:');
  console.log(JSON.stringify(jsonData.slice(0, 3), null, 2));

} catch (error) {
  console.error('Error:', error.message);
}
