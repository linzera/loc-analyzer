const { methodRegex } = require('./regex');

const GOD_CLASS_RANGE = 800;

function countGodClass(cleanFile) {
  const splittedFile = cleanFile.split('\n');

  const classIndexes = splittedFile
    .map((item, index) => {
      const isValid = !item.includes('.class') && item.includes('class');

      return { isValid, index, item };
    })
    .filter((valid) => valid.isValid);

  const counts = classIndexes.map(({ index }, classIndexesIndex) => {
    const slicedFile = splittedFile.slice(index, splittedFile.length);

    const isFirstClass = classIndexesIndex === 0;

    //Java always work with class so the first match always will be the file length sliced
    if (isFirstClass) {
      return slicedFile.length;
    }

    const tabCount = slicedFile[0].split(' ').filter((item) => !item).length;

    let classLineCount = 0;
    slicedFile.some((value, index) => {
      const current = value;
      const next = slicedFile[index + 1] || '';
      const afterNext = slicedFile[index + 2] || '';
      const afterAfterNext = slicedFile[index + 3] || '';

      function isChildAttribute(method) {
        if (!method) {
          return false;
        }

        const methodTabCount = method.split(' ').filter((item) => !item).length;
        return methodTabCount > tabCount;
      }

      const hasAfterAfterNextClassEnd =
        afterAfterNext &&
        (afterAfterNext.includes('class') || afterAfterNext.match(methodRegex));

      const isEndOfClass =
        current.includes('}') &&
        !next &&
        (!isChildAttribute(afterNext) || !isChildAttribute(afterAfterNext));

      if (isEndOfClass) {
        // If the current line is the end bracket then add plus LOC
        classLineCount++;
        return true;
      } else {
        classLineCount++;
      }
    });

    return classLineCount;
  });

  return counts.filter((classLOC) => classLOC > GOD_CLASS_RANGE).length;
}

module.exports = {
  countGodClass,
};
