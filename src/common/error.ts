export class LexError {
  line: number;
  msg: string;

  constructor(line: number, msg: string) {
    this.line = line;
    this.msg = msg;
  }

  toString() {
    return `[${this.line}]\t ${this.msg}`;
  }
}

// other errors
