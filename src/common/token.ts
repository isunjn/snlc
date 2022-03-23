class Token {
  line: number;
  lex: string;
  sem?: string;

  constructor(line: number, lex: string, sem?: string) {
    this.line = line;
    this.lex = lex;
    if (sem !== undefined) {
      this.sem = sem;
    }
  }

  toString() {
    return `[${this.line}]\t ${this.lex}\t\t ${this.sem ? this.sem : ""}`;
  }
}

export default Token;
