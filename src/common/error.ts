export class LexError {
  line: number;
  msg: string = "Lexer Error";

  constructor(line: number, msg?: string) {
    this.line = line;
    if (this.msg !== undefined) {
      this.msg = msg;
    }
  }

  toString() {
    return `[${this.line}]\t ${this.msg}`;
  }
}

// other errors
