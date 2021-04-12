const fetch = require('node-fetch');

const classRegex = new RegExp('class', 'g');
const commentaryRegex = new RegExp(/\/\*([\s\S]*?)\*\//, 'g');
const singleCommentRegex = new RegExp(/\/\/[\s\S].*/, 'g');
const methodRegex = new RegExp(
  /(public|private|static|protected|abstract|synchronized)(?!.*class)([^\=;]*?)(\{+?)/,
  'g'
);
const overrideMethodRegex = new RegExp(
  /(@Override)(?!.*class)([^\=;]*?)(\{+?)/,
  'g'
);
const duplicatedMethodRegex = new RegExp(/(\(+?)([^\=;]*?)(\{+?)/, 'g');

const findDuplicates = (arr) =>
  arr.filter((item, index) => arr.indexOf(item) != index);

async function parseFile(fileUri) {
  const data = await fetch(fileUri)
    .then((res) => res.text())
    .catch((err) => '');

  if (data) {
    return data;
  }

  throw 'Could not parse the file.';
}

function extractMatchesArrayFromRegex(target, regex) {
  return [...target.matchAll(regex)];
}

async function analyzeFile(fileUri = FILE_URL) {
  const fileTextContent = await parseFile(fileUri).catch((err) => null);

  if (!fileTextContent) {
    return;
  }

  const classMatches = extractMatchesArrayFromRegex(
    fileTextContent,
    classRegex
  );
  const commentaryMatches = extractMatchesArrayFromRegex(
    fileTextContent,
    commentaryRegex
  );

  // Remove overrides, does not count as methods
  const cleanMethods = fileTextContent.replace(overrideMethodRegex, '');
  const methodMatches = extractMatchesArrayFromRegex(cleanMethods, methodRegex);

  //Check por duplicates  decrement smethodCount;
  const methods = methodMatches
    .map((matchArray) => matchArray[0])
    .map((item) => item.replace(duplicatedMethodRegex, ''));
  const duplicatedMethodsCount = findDuplicates(methods).length;

  const commentaryCleanedFile = fileTextContent
    .replace(commentaryRegex, '')
    .replace(singleCommentRegex, '');

  const fileLines = commentaryCleanedFile.split('\n');

  const LOC = fileLines.filter((line) => line.trim());

  return {
    classCount: classMatches.length,
    methodCount: methodMatches.length - duplicatedMethodsCount,
    LOC: LOC.length,
  };
}

function extractArgs() {
  const uriArg = '--uri=';

  const uriInput = process.argv.filter((value) => value.startsWith(uriArg));

  if (uriInput.length === 0) {
    throw 'URI param not provided.';
  }

  const uri = uriInput[0].replace(uriArg, '');

  if (!uri) {
    throw 'URI has no value, provide a value.';
  }

  return { uri };
}

function start() {
  const { uri } = extractArgs();

  analyzeFile(uri).then((result) => {
    console.log(result);
  });
}

start();
