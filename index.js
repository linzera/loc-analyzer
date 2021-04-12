const fs = require('fs');
const ora = require('ora');
const { ExportToCsv } = require('export-to-csv');
const { analyzeFile } = require('./analyzer');
const { getURLsToAnalise } = require('./fetch-files');

const throbber = ora('Analise de todos os arquivos iniciada.').start();
const exportThrobber = ora('Exportando resultado para CSV');

function undefinedAsNumber(value) {
  return value || 0;
}

function onComplete(analyzeResult) {
  exportThrobber.start();

  const filename = 'software_evolution_analyses.csv';

  const csvExporter = new ExportToCsv({
    fieldSeparator: ',',
    showLabels: true,
  });

  try {
    const csvData = csvExporter.generateCsv(analyzeResult, true);
    fs.writeFileSync(`./predict/${filename}`, csvData);
    exportThrobber.succeed(`Arquivo exportado com sucesso: ${filename}`);
  } catch (e) {
    exportThrobber.fail(`Algo deu errado na hora de exportar: ${e.message}`);
  }
}

async function start() {
  const datasetURLs = getURLsToAnalise();

  Promise.all(
    datasetURLs.map(async (monthURLs, index) => {
      const monthData = await Promise.all(
        monthURLs.map(async (fileData) => {
          const result = await analyzeFile(fileData.url);
          return result;
        })
      );
      return monthData.reduce((acc, cur) => ({
        month: index + 1,
        LOC: acc.LOC + cur.LOC,
        classCount: acc.classCount + cur.classCount,
        methodCount: acc.methodCount + cur.methodCount,
        godMethodCount: acc.godMethodCount + cur.godMethodCount,
        godClassCount: acc.godClassCount + cur.godClassCount,
      }));
    })
  )
    .then((result) => {
      throbber.succeed('Analise finalizada');

      console.table(result);

      onComplete(result);
    })
    .catch((err) => {
      console.error(err);
    });
}

start();
