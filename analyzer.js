const { parseFile } = require('./fetch-files');
const { countGodClass } = require('./class-analyzer');

const {
  classRegex,
  constructorRegex,
  commentaryRegex,
  singleCommentRegex,
  methodRegex,
  overrideMethodRegex,
  duplicatedMethodRegex,
} = require('./regex');

const GOD_METHOD_RANGE = 127;

function findDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) != index);
}

function extractMatchesArrayFromRegex(target, regex) {
  return [...target.matchAll(regex)];
}

function countMethodLines(matchedMethod, cleanFile) {
  const splittedFile = cleanFile.split('\n');

  const methodStartIndex = splittedFile
    .map((item, index) => item.includes(matchedMethod) && index)
    .filter((valid) => !!valid)[0];

  const slicedFile = splittedFile.slice(methodStartIndex, splittedFile.length);

  let methodLineCount = 0;
  slicedFile.some((value, index) => {
    const current = value;
    const next = slicedFile[index + 1] || '';
    const afterNext = slicedFile[index + 2] || '';
    const safeNext = next.replace('\r', '').replace('\t', '').replace('\n', '');

    const isEndOfMethod = !safeNext && afterNext.match(methodRegex);

    if (isEndOfMethod) {
      // If the current line is the end bracket then add plus LOC
      methodLineCount++;
      return true;
    } else {
      methodLineCount++;
    }
  });

  return methodLineCount;
}

async function analyzeFile(fileUri = FILE_URL) {
  const fileTextContent = await parseFile(fileUri).catch((err) => null);

  if (!fileTextContent) {
    return;
  }

  const classMatches = extractMatchesArrayFromRegex(
    fileTextContent.replace('.class', '.file'),
    classRegex
  );
  const commentaryMatches = extractMatchesArrayFromRegex(
    fileTextContent,
    commentaryRegex
  );

  // Remove overrides, does not count as methods
  const cleanMethods = fileTextContent
    .replace(overrideMethodRegex, '')
    .replace(commentaryMatches, '')
    .replace(constructorRegex, '');
  const methodMatches = extractMatchesArrayFromRegex(cleanMethods, methodRegex);

  //Check por duplicates  decrement methodCounts;
  const methods = methodMatches
    .map((matchArray) => matchArray[0])
    // Remove arguments from method match in order to find duplicated methods
    .map((item) => item.replace(duplicatedMethodRegex, ''));
  const duplicatedMethodsCount = findDuplicates(methods).length;

  const methodMetaData = methods.map((method) => {
    const lineCount = countMethodLines(method, fileTextContent);

    return {
      method,
      lineCount,
      isGodMethod: lineCount > GOD_METHOD_RANGE,
    };
  });

  const godClassCount = countGodClass(fileTextContent, commentaryMatches);

  const commentaryCleanedFile = fileTextContent
    .replace(commentaryRegex, '')
    .replace(singleCommentRegex, '');

  const fileLines = commentaryCleanedFile.split('\n');

  const LOC = fileLines.filter((line) => line.trim());

  return {
    classCount: classMatches.length,
    methodCount: methodMatches.length - duplicatedMethodsCount,
    godMethodCount: methodMetaData.filter((item) => item.isGodMethod).length,
    godClassCount,
    LOC: LOC.length,
  };
}

module.exports = {
  analyzeFile,
};
