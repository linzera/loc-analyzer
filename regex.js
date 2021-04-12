const classRegex = new RegExp('class', 'g');
const commentaryRegex = new RegExp(/\/\*([\s\S]*?)\*\//, 'g');
const singleCommentRegex = new RegExp(/\/\/[\s\S].*/, 'g');
const methodRegex = new RegExp(
  /(public|private|static|protected|abstract)(?!.*class)([^\=;]*?)(\{+?)/,
  'g'
);
const overrideMethodRegex = new RegExp(
  /(@Override)(?!.*class)([^\=;]*?)(\{+?)/,
  'g'
);
const duplicatedMethodRegex = new RegExp(/(\(+?)([^\=;]*?)(\{+?)/, 'g');
const constructorRegex = new RegExp(
  /(public|private|static|protected|abstract|synchronized)(?!.*class)([^\=;]*?)(\{+?)[\s\S](.*super)/,
  'g'
);

module.exports = {
  classRegex,
  constructorRegex,
  commentaryRegex,
  singleCommentRegex,
  methodRegex,
  overrideMethodRegex,
  duplicatedMethodRegex,
};
