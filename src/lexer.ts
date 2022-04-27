// lexer

import { Token, type LexType } from "./common/token";
import { LexError } from "./common/error";
import { isKeyword } from "./common/keywords";

//----------------------------------------------------------------------------

type Char = string;
type TokenizerResult = Token | LexError;
type StateFn = (ch: Char, str: Char[]) => StateFnResult;
type StateFnResult = StateFn | TokenizerResult;

const isLetter = /^[A-Za-z]$/;
const isNumber = /^[0-9]$/;
const isDelimiter = /^[+|\-|*|/|(|)|[|\]|;|<|=|,]|EOI$/;
const isWhiteSpace = /^\s$/;

//----------------------------------------------------------------------------

let CODE: string;
let CODE_LEN: number;
let INDEX: number;
let LINE: number;
let COLUMN: number;
let TOKEN_COLUMN: number;
let REACH_END: boolean;

//----------------------------------------------------------------------------

function readChar(): Char {
  if (INDEX === CODE_LEN) {
    REACH_END = true;
    return "EOI";
  }
  const ch = CODE[INDEX++];
  COLUMN++;
  if (ch === "\n") {
    LINE++;
    COLUMN = 0;
  }
  return ch;
}

function goBack(isNewLineBack: boolean, isEOIBack: boolean) {
  if (isEOIBack) {
    REACH_END = false;
    return;
  }
  INDEX--;
  COLUMN--;
  if (isNewLineBack) {
    LINE--;
  }
}

//----------------------------------------------------------------------------

function S_START(ch: Char): StateFnResult {
  if (isWhiteSpace.test(ch)) return S_INWHITESPACE;
  if (isLetter.test(ch)) return S_INID;
  if (isNumber.test(ch)) return S_INNUM;
  if (isDelimiter.test(ch)) {
    switch (ch) {
      case "+": return new Token(LINE, TOKEN_COLUMN, "PLUS");
      case "-": return new Token(LINE, TOKEN_COLUMN, "MINUS");
      case "*": return new Token(LINE, TOKEN_COLUMN, "MULTI");
      case "/": return new Token(LINE, TOKEN_COLUMN, "DEVIDE");
      case "(": return new Token(LINE, TOKEN_COLUMN, "L_PAREN");
      case ")": return new Token(LINE, TOKEN_COLUMN, "R_PAREN");
      case "[": return new Token(LINE, TOKEN_COLUMN, "L_SQUARE");
      case "]": return new Token(LINE, TOKEN_COLUMN, "R_SQUARE");
      case ";": return new Token(LINE, TOKEN_COLUMN, "SEMI");
      case "<": return new Token(LINE, TOKEN_COLUMN, "LT");
      case "=": return new Token(LINE, TOKEN_COLUMN, "EQ");
      case ",": return new Token(LINE, TOKEN_COLUMN, "COMMA")
      case "EOI": return new Token(LINE, TOKEN_COLUMN + 1, "EOI");
    }
  }
  if (":" === ch) return S_INCOLON;
  if ("{" === ch) return S_INCOMMENT;
  if ("." === ch) return S_INDOT;
  if ("'" === ch) return S_INCHAR;
  if ("}" === ch) return new LexError(LINE, COLUMN, "Comment closing character mismatch");
  return new LexError(LINE, COLUMN, "Illegal character");
}

function S_INWHITESPACE(ch: Char): StateFnResult {
  if (isWhiteSpace.test(ch)) return S_INWHITESPACE;
  goBack(false, "EOI" === ch);
  return new Token(LINE, TOKEN_COLUMN, "WHITESPACE");
}

function S_INID(ch: Char, str: Char[]): StateFnResult {
  if (isLetter.test(ch) || isNumber.test(ch)) return S_INID;
  goBack(ch === "\n", ch === "EOI");
  const value = str.reduce((acc, ch) => (acc += ch), "");
  if (isKeyword(value)) {
    return new Token(LINE, TOKEN_COLUMN, value.toUpperCase() as LexType);
  } else {
    return new Token(LINE, TOKEN_COLUMN, "ID", value);
  }
}

function S_INNUM(ch: Char, str: Char[]): StateFnResult {
  if (isNumber.test(ch)) return S_INNUM;
  if (isLetter.test(ch)) return new LexError(LINE, COLUMN, "An identifier or keyword cannot immediately follow an integer literal");
  goBack(ch === "\n", ch === "EOI");
  const value = str.reduce((acc, ch) => (acc += ch), "");
  return new Token(LINE, TOKEN_COLUMN, "INTC", value);
}

function S_INCOLON(ch: Char): StateFnResult {
  if ("=" === ch) return new Token(LINE, TOKEN_COLUMN, "ASSIGN");
  return new LexError(LINE, COLUMN, "Expect `=` after `:`");
}

function S_INCOMMENT(ch: Char): StateFnResult {
  if ("}" === ch) return new Token(LINE, TOKEN_COLUMN, "COMMENT");
  if ("EOI" === ch) {
    goBack(false, true);
    return new LexError(LINE, COLUMN, "Comment must be closed");
  }
  return S_INCOMMENT;
}

function S_INDOT(ch: Char): StateFnResult {
  if ("." === ch) return new Token(LINE, TOKEN_COLUMN, "RANGE");
  goBack(ch === "\n", ch === "EOI");
  return new Token(LINE, TOKEN_COLUMN, "DOT");
}

function S_INCHAR(ch: Char): StateFnResult {
  if (isLetter.test(ch) || isNumber.test(ch)) return S_INENDCHAR;
  return new LexError(LINE, COLUMN, "Expect a character after `'`");
}

function S_INENDCHAR(ch: Char, str: Char[]): StateFnResult {
  if ("'" === ch) return new Token(LINE, TOKEN_COLUMN + 1, "CHARC", str.pop()!);
  return new LexError(LINE, COLUMN, "At most one character after `'`");
}

//----------------------------------------------------------------------------

function tokenizer(): TokenizerResult {
  const str: Char[] = [];
  let ch = readChar();
  TOKEN_COLUMN = COLUMN;
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
  COLUMN = 0;
  REACH_END = false;

  const tokens: Token[] = [];
  const errors: LexError[] = [];

  while (!REACH_END) {
    const result = tokenizer();
    if (result instanceof Token) {
      if (result.lex === "WHITESPACE" || result.lex === "COMMENT") continue;
      tokens.push(result);
    } else {
      errors.push(result);
    }
  }

  return [tokens, errors];
}

export default lexer;
