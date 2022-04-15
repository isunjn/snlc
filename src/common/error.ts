import { T_Symbo } from "./grammar";

type ErrorType = "LexError" | "SyntaxError" | "SemError";

export abstract class Error {
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

export function errMsgOf(symbo: T_Symbo): string {
  switch (symbo) {
    case "PROGRAM":   return "Expect keyword `program`";
    case "VAR":       return "Expect keyword `var`";
    case "TYPE":      return "Expect keyword `type`";
    case "PROCEDURE": return "Expect keyword `procedure`";
    case "WHILE":     return "Expect keyword `while`";
    case "DO":        return "Expect keyword `do`";
    case "ENDWH":     return "Expect keyword `endwh`";
    case "IF":        return "Expect keyword `if`";
    case "THEN":      return "Expect keyword `then`";
    case "ELSE":      return "Expect keyword `else`";
    case "FI":        return "Expect keyword `fi`";
    case "BEGIN":     return "Expect keyword `begin`";
    case "END":       return "Expect keyword `end`";
    case "INTEGER":   return "Expect keyword `integer`";
    case "CHAR":      return "Expect keyword `char`";
    case "ARRAY":     return "Expect keyword `array`";
    case "RECORD":    return "Expect keyword `record`";
    case "OF":        return "Expect keyword `of`";
    case "READ":      return "Expect keyword `read`";
    case "WRITE":     return "Expect keyword `write`";
    case "RETURN":    return "Expect keyword `return`";
    case "ID":        return "Expect an identifier";
    case "INTC":      return "Expect an integer";
    case "CHARC":     return "Expect a char";
    case "ASSIGN":    return "Expect `:=`";
    case "RANGE":     return "Expect `..`";
    case "PLUS":      return "Expect `+`";
    case "MINUS":     return "Expect `-`";
    case "MULTI":     return "Expect `*`";
    case "DEVIDE":    return "Expect `/`";
    case "L_PAREN":   return "Expect `(`";
    case "R_PAREN":   return "Expect `)`";
    case "L_SQUARE":  return "Expect `[`";
    case "R_SQUARE":  return "Expect `]`";
    case "SEMI":      return "Expect `;`";
    case "LT":        return "Expect `<`";
    case "EQ":        return "Expect `=`";
    case "COMMA":     return "Expect `,`";
    case "DOT":       return "Expect `.`";
    default: throw "panic!";
  }
}
