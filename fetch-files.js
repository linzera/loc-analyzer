const fetch = require('node-fetch');

async function parseFile(fileUri) {
  const data = await fetch(fileUri)
    .then((res) => res.text())
    .catch((err) => '');

  if (data) {
    return data;
  }

  throw 'Could not parse the file.';
}

const MONTH_COUNT = 27;
const FILE_NAMES = [
  'DispatchQueue.txt',
  'FileLoader.txt',
  'FileLog.txt',
  'FileUploadOperation.txt',
  'UserConfig.txt',
  'Utilities.txt',
];

const composeDownloadURL = (month, fileName) =>
  `https://raw.githubusercontent.com/linzera/dataset-software-evolution/main/Dataset/${month}/${fileName}`;

function getURLsToAnalise() {
  const urls = Array.from(new Array(MONTH_COUNT)).map((_, monthIndex) => {
    const monthFileData = FILE_NAMES.map((fileName) => ({
      url: composeDownloadURL(monthIndex + 1, fileName),
      fileName: fileName,
    }));

    return monthFileData;
  });

  return urls;
}

module.exports = {
  parseFile,
  getURLsToAnalise,
};
