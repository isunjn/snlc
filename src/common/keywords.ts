const keywords = [
  "program",
  "var",
  "type",
  "procedure",
  "while",
  "do",
  "endwh",
  "if",
  "then",
  "else",
  "fi",
  "begin",
  "end",
  "integer",
  "char",
  "array",
  "of",
];

export function isKeyword(word: string): boolean {
  for (const keyword of keywords) {
    if (word === keyword) {
      return true;
    }
  }
  return false;
}

export default keywords;
