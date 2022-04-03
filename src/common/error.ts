export class LexError {
  line: number;
  msg = "Lexer Error";

  constructor(line: number, msg?: string) {
    this.line = line;
    if (msg !== undefined) {
      this.msg = msg;
    }
  }

  toString() {
    return `[${this.line}]\t ${this.msg}`;
  }
}

// other errors
