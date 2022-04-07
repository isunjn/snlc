type ErrorType = "LexError" | "SyntaxError" | "SemError";

abstract class Error {
  kind: ErrorType;
  line: number;
  column: number;
  msg: string;

  constructor(kind: ErrorType, line: number, column: number, msg: string) {
    this.kind = kind;
    this.line = line;
    this.column = column;
    this.msg = msg;
  }

  toString() {
    return `[${this.line},${this.column}]\t ${this.msg}`;
  }
}

export class LexError extends Error {
  constructor(line: number, column: number, msg: string) {
    super("LexError", line, column, msg);
  }
}

export class SyntaxError extends Error {
  constructor(line: number, column: number, msg: string) {
    super("SyntaxError", line, column, msg);
  }
}

export class SemError extends Error {
  constructor(line: number, column: number, msg: string) {
    super("SemError", line, column, msg);
  }
}
