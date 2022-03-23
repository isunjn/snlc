import Token from "./common/token";
import { LexError } from "./common/error";
import { isKeyword } from "./common/keywords";

type Char = string;
type TokenizerResult = Token | LexError;
type StateFn = (ch: Char, str?: Char[]) => StateFnResult;
type StateFnResult = StateFn | TokenizerResult;

const isLetter = /[A-Z|a-z]/;
const isNumber = /[0-9]/;
const isDelimiter = /[+|-|*|/|(|)|[|\]|;|<|>|=|\s|EOF]/;
const isWhiteSpace = /[\s]/;

let CODE: string;
let CODE_LEN: number;
let INDEX: number;
let LINE: number;
let REACH_END: boolean;

function readChar(): Char {
  if (INDEX === CODE_LEN) {
    REACH_END = true;
    return "EOF";
  }
  const ch = CODE[INDEX++];
  if (ch === "\n") {
    LINE++;
  }
  return ch;
}

function goBack(isNewLineBack: boolean) {
  if (isNewLineBack) {
    LINE--;
  }
  INDEX--;
}

function S_START(ch: Char): StateFnResult {
  if (isDelimiter.test(ch)) {
    if (isWhiteSpace.test(ch)) {
      return new Token(LINE, "WHITESPACE");
    }
    switch (ch) {
      case "+":
        return new Token(LINE, "PLUS");
      case "-":
        return new Token(LINE, "MINUS");
      case "*":
        return new Token(LINE, "MULTI");
      case "/":
        return new Token(LINE, "DEVIDE");
      case "(":
        return new Token(LINE, "L_PAREN");
      case ")":
        return new Token(LINE, "R_PAREN");
      case "[":
        return new Token(LINE, "L_SQUARE");
      case "]":
        return new Token(LINE, "R_SQUARE");
      case ";":
        return new Token(LINE, "SEMI");
      case "<":
        return new Token(LINE, "LT");
      case ">":
        return new Token(LINE, "GT");
      case "=":
        return new Token(LINE, "EQ");
      case "EOF":
        return new Token(LINE, "EOF");
    }
  }
  if (isLetter.test(ch)) {
    return S_INID;
  }
  if (isNumber.test(ch)) {
    return S_INNUM;
  }
  if (":" === ch) {
    return S_INCOLON;
  }
  if ("{" === ch) {
    return S_INCOMMENT;
  }
  if ("." === ch) {
    return S_INDOT;
  }
  if ("'" === ch) {
    return S_INCHAR;
  }

  return new LexError(LINE);
}

function S_INID(ch: Char, str: Char[]): StateFnResult {
  if (isLetter.test(ch) || isNumber.test(ch)) {
    return S_INID;
  }
  goBack(ch === "\n");
  const value = str.reduce((acc, ch) => (acc += ch), "");
  if (isKeyword(value)) {
    return new Token(LINE, value.toUpperCase());
  } else {
    return new Token(LINE, "ID", value);
  }
}

function S_INNUM(ch: Char, str: Char[]): StateFnResult {
  if (isNumber.test(ch)) {
    return S_INNUM;
  }
  goBack(ch === "\n");
  const value = str.reduce((acc, ch) => (acc += ch), "");
  return new Token(LINE, "UINT", value);
}

function S_INCOLON(ch: Char): StateFnResult {
  if ("=" === ch) {
    return new Token(LINE, "ASSIGN");
  }
  return new LexError(LINE);
}

function S_INCOMMENT(ch: Char): StateFnResult {
  if ("}" === ch) {
    return new Token(LINE, "COMMENT"); // TODO
  }
  return S_INCOMMENT;
}

function S_INDOT(ch: Char): StateFnResult {
  if ("." === ch) {
    return new Token(LINE, "RANGE");
  }
  return new LexError(LINE);
}

function S_INCHAR(ch: Char): StateFnResult {
  if (isLetter.test(ch) || isNumber.test(ch)) {
    return S_INENDCHAR;
  }
  return new LexError(LINE);
}

function S_INENDCHAR(ch: Char, str: Char[]): StateFnResult {
  if ("'" === ch) {
    const theChar = str.pop();
    return new Token(LINE, "CHAR", theChar);
  }
  return new LexError(LINE);
}

function tokenizer(): TokenizerResult {
  let str: Char[] = [];
  let ch = readChar();
  let result = S_START(ch);
  while (typeof result === "function") {
    str.push(ch);
    ch = readChar();
    result = result(ch, str);
  }
  return result;
}

function lexer(code: string): [Token[], LexError[]] {
  CODE = code;
  CODE_LEN = code.length;
  INDEX = 0;
  LINE = 1;
  REACH_END = false;

  let tokens: Token[] = [];
  let errors: LexError[] = [];

  while (!REACH_END) {
    const result = tokenizer();
    if (result instanceof Token && result.lex !== "WHITESPACE") {
      tokens.push(result);
    } else if (result instanceof LexError) {
      errors.push(result);
    }
  }

  return [tokens, errors];
}

export default lexer;
