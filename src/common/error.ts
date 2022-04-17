import { Symbo } from "./grammar";

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

export function errMsgOf(symbo: Symbo): string {
  switch (symbo) {
    case "PROGRAM":  return "Expect keyword `program`";
    case "VAR":  return "Expect keyword `var`";
    case "TYPE":  return "Expect keyword `type`";
    case "PROCEDURE":  return "Expect keyword `procedure`";
    case "WHILE":  return "Expect keyword `while`";
    case "DO":  return "Expect keyword `do`";
    case "ENDWH":  return "Expect keyword `endwh`";
    case "IF":  return "Expect keyword `if`";
    case "THEN":  return "Expect keyword `then`";
    case "ELSE":  return "Expect keyword `else`";
    case "FI":  return "Expect keyword `fi`";
    case "BEGIN":  return "Expect keyword `begin`";
    case "END":  return "Expect keyword `end`";
    case "INTEGER":  return "Expect keyword `integer`";
    case "CHAR":  return "Expect keyword `char`";
    case "ARRAY":  return "Expect keyword `array`";
    case "RECORD":  return "Expect keyword `record`";
    case "OF":  return "Expect keyword `of`";
    case "READ":  return "Expect keyword `read`";
    case "WRITE":  return "Expect keyword `write`";
    case "RETURN":  return "Expect keyword `return`";
    case "ID":  return "Expect an identifier";
    case "INTC":  return "Expect an integer";
    case "CHARC":  return "Expect a char";
    case "ASSIGN":  return "Expect `:=`";
    case "RANGE":  return "Expect `..`";
    case "PLUS":  return "Expect `+`";
    case "MINUS":  return "Expect `-`";
    case "MULTI":  return "Expect `*`";
    case "DEVIDE":  return "Expect `/`";
    case "L_PAREN":  return "Expect `(`";
    case "R_PAREN":  return "Expect `)`";
    case "L_SQUARE":  return "Expect `[`";
    case "R_SQUARE":  return "Expect `]`";
    case "SEMI":  return "Expect `;`";
    case "LT":  return "Expect `<`";
    case "EQ":  return "Expect `=`";
    case "COMMA":  return "Expect `,`";
    case "DOT":  return "Expect `.`";
    case "Program":
    case "ProgramHead": return "Expect keyword `program`";
    case "ProgramName":
    case "TypeId":
    case "IdList":
    case "VarIdList":
    case "ProcName":
    case "FormList":
    case "Variable":
    case "FieldVar":
    case "TypeDecList": return "Expect an identifier";
    case "DeclarePart":
    case "TypeDec":  return "Expect keyword `type`, `var`, `procedure` or `begin`";
    case "TypeDeclaration": return "Expect keyword `type`"
    case "TypeDecMore":  return "Expect an identifier or keyword `var`, `procedure`, `begin`";
    case "TypeName":  return "Expect a type";
    case "BaseType":  return "Expect keyword `integer` or `char`";
    case "StructureType":  return "Expect keyword `array` or `record`";
    case "ArrayType": return "Expect keyword `array`";
    case "Low":
    case "Top": return "Expect an integer";
    case "RecordType": return "Expect keyword `record`";
    case "FieldDecList":  return "Expect keyword `integer`, `char` or `array`";
    case "FieldDecMore":  return "Expect keyword `end`, `integer`, `char`, `array`";
    case "IdMore":  return "Expect `;` or `,`";
    case "VarDec":  return "Expect keyword `var`, `procedure` or `begin`";
    case "VarDeclaration": return "Expect keyword `var`";
    case "VarDecList": return "Expect a type";
    case "VarDecMore":  return "Expect a type or keword `procedure`, `begin`";
    case "VarIdMore":  return "Expect `;` or `,`";
    case "ProcDec":  return "Expect keyword `procedure` or `begin`";
    case "ProcDeclaration": return "Expect keyword `procedure";
    case "ProcDecMore":  return "Expect keyword `procedure` or `begin`";
    case "ParamList":  return "Expect a type or keyword `var` or `)`";
    case "ParamDecList":
    case "Param":  return "Expect a type or keyword `var`";
    case "ParamMore": return "Expect `)` or `;`";
    case "FidMore":  return "Expect `;` or `,` or `)`";
    case "ProcDecPart": return "Expect keyword `type`, `var`, `procedure` or `begin`";
    case "ProcBody": return "Expect keyword `begin`";
    case "StmMore":  return "Expect `;` or keyword `end`, `else, `fi`, `endwh`";
    case "StmList":
    case "Stm":  return "Expect an identifier or keyword `if`, `while`, `read`, `write`, `return`";
    case "AssCall":  return "Expect `[`, `(`, `.` or `:=`";
    case "AssignmentRest": return "Expect `[`, `.` or `:=`";
    case "ConditionalStm": return "Expect keyword `if`";
    case "LoopStm": return "Expect keyword `while`";
    case "InputStm": return "Expect keyword `read`";
    case "Invar": return "Expect an identifier";
    case "OutputStm": return "Expect keyword `write`";
    case "ReturnStm": return "Expect keyword `return`";
    case "CallStmRest": return "Expect `(`";
    case "ActParamList":  return "Expect `)` or an expression";
    case "ActParamMore":  return "Expect `,` or `)`";
    case "Exp":
    case "Term":
    case "RelExp":
    case "Factor":  return "Expect an expression";
    case "CmpOp":
    case "OtherRelE": return "Expect `<` or `=`";
    case "AddOp": return "Expect `+` or `-`";
    case "MultOp": return "Expect `*` or `/`";
    default: return "Unexpected token";
  }
}
