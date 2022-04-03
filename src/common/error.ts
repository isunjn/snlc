export class LexError {
  line: number;
  column: number;
  msg: string;

  constructor(line: number, column: number, msg: string) {
    this.line = line;
    this.column = column;
    this.msg = msg;
  }

  toString() {
    return `[${this.line},${this.column}]\t ${this.msg}`;
  }
}

// other errors
