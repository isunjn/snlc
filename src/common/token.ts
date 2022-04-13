export type LexType =
  | "PROGRAM"
  | "VAR"
  | "TYPE"
  | "PROCEDURE"
  | "WHILE"
  | "DO"
  | "ENDWH"
  | "IF"
  | "THEN"
  | "ELSE"
  | "FI"
  | "BEGIN"
  | "END"
  | "INTEGER"
  | "CHAR"
  | "ARRAY"
  | "RECORD"
  | "OF"
  | "READ"
  | "WRITE"
  | "RETURN"
  | "ID"           // Identifier
  | "INTC"         // Integer
  | "CHARC"        // Char
  | "ASSIGN"       // :=
  | "RANGE"        // ..
  | "PLUS"         // +
  | "MINUS"        // -
  | "MULTI"        // *
  | "DEVIDE"       // /
  | "L_PAREN"      // (
  | "R_PAREN"      // )
  | "L_SQUARE"     // [
  | "R_SQUARE"     // ]
  | "SEMI"         // ;
  | "LT"           // <
  | "EQ"           // =
  | "COMMA"        // ,
  | "DOT"          // .
  | "EOI"          // # (End Of Input)
  | "COMMENT"
  | "WHITESPACE";

export class Token {
  line: number;
  lex: LexType;
  sem?: string;

  constructor(line: number, lex: LexType, sem?: string) {
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
