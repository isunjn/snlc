// recursive descent parser

import type { Token, LexType } from "./common/token";
import type { T_Symbo } from "./common/grammar";
import type { NodeKind, LiteralNodeKind, SnlTypeKind, StmKind, ExpKind, Node, AST } from "./common/ast";
import { createNode} from "./common/ast";
import { getPredictSets } from "./common/predict";
import { SyntaxError } from "./common/error";

//----------------------------------------------------------------------------------------------

type ParsingResult<T, N> = N extends null 
  ? (T extends NodeKind ? Node<T> : T) | null 
  : (T extends NodeKind ? Node<T> : T);

class ParsingWorker<T extends NodeKind | LiteralNodeKind, N extends null | unknown> {
  static readonly _predictSets = getPredictSets();
  static _tokens: Token[];
  static _index: number;

  _result?: ParsingResult<T, N>; // the parsing target
  _token: Token; // current token
  _miss = false; // !match or !in_predict
  _take = false; // result already been set?
  _back = false; // index already go back?

  constructor() {
    this._token = ParsingWorker._tokens[ParsingWorker._index++];
  }

  match(it: LexType): ParsingWorker<T, N> {
    if (this._token.lex !== it) this._miss = true;
    return this;
  }

  in_predict(ruleIdx: number): ParsingWorker<T, N> {
    if (this._take) return this;
    const predictSet = ParsingWorker._predictSets.get(ruleIdx);
    if (!predictSet!.has(this._token.lex as T_Symbo)) this._miss = true; else this._miss = false;
    if (!this._back) { 
      ParsingWorker._index--; // go back, predict test do not consume token
      this._back = true;
    }
    return this;
  }

  is_op(ops: ["<", "="] | ["+", "-"] | ["*" , "/"]): ParsingWorker<T, N> {
    switch (ops[0]) {
      case "<": if (this._token.lex !== "LT" && this._token.lex !== "EQ") this._miss = true; break;
      case "+": if (this._token.lex !== "PLUS" && this._token.lex !== "MINUS") this._miss = true; break;
      case "*": if (this._token.lex !== "MULTI" && this._token.lex !== "DEVIDE") this._miss = true; break;
    }
    return this;
  }

  then_take(fn?: () =>  ParsingResult<T, N>): ParsingWorker<T, N> { // take as parsing result
    if (this._miss || this._take) return this;
    if (fn) this._result = fn();
    else switch (this._token.lex) {
      case "ID": 
        this._result = { 
          kind: "Identifier", 
          value: this._token.sem!, 
          sibling: null, 
          line: this._token.line, 
          column: this._token.column 
        } as ParsingResult<T, N>; break;
      case "INTC": 
        this._result = {
          kind: "IntegerLiteral",
          value: parseInt(this._token.sem!),
          line: this._token.line,
          column: this._token.column
        } as ParsingResult<T, N>; break;
      case "LT": this._result = "<" as ParsingResult<T, N>; break;
      case "EQ": this._result = "=" as ParsingResult<T, N>; break;
      case "PLUS": this._result = "+" as ParsingResult<T, N>; break;
      case "MINUS": this._result = "-" as ParsingResult<T, N>; break;
      case "MULTI": this._result = "*" as ParsingResult<T, N>; break;
      case "DEVIDE": this._result = "/" as ParsingResult<T, N>; break;
      default: throw "panic!";
    }
    this._take = true;
    return this;
  }

  then_skip(): ParsingWorker<T, N> {  // if we know exactly what current token is, we can simply skip it
    if (this._miss || this._take) return this;
    ParsingWorker._index++;
    return this;
  }

  or_err(msg: string): ParsingResult<T, N> | undefined {
    if (this._miss) throw new SyntaxError(this._token.line, this._token.column, msg);
    return this._result; // if there is no error, return the parsing result
  }

  or_omit(): ParsingResult<T, N> | undefined { // omit means if miss, we do nothing, and should not consume token
    if (this._miss) ParsingWorker._index--;
    return this._result;
  }
}

function next<T extends NodeKind | LiteralNodeKind, N extends null | unknown = unknown>(): ParsingWorker<T, N> {
  return new ParsingWorker<T, N>();
}

//----------------------------------------------------------------------------------------------

function parseProgram(): Node<"Program"> {
  const node = createNode("Program");
  next().match("PROGRAM").or_err("Expect keyword `program`");
  node.name = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  node.declare = parseDeclarePart();
  node.body = parseProgramBody();
  next().match("DOT").or_err("Expect `.`");
  return node as Node<"Program">;
}

function parseDeclarePart(): Node<"DeclarePart"> {
  const node = createNode("DeclarePart");
  node.types = parseTypeDec();
  node.vars = parseVarDec();
  node.procs = parseProcDec();
  return node as Node<"DeclarePart">;
}

function parseTypeDec(): Node<"TypeDeclaration"> | null {
  return next<"TypeDeclaration", null>()
  .in_predict(5).then_take(() => null)
  .in_predict(6).then_skip().then_take(parseTypeDecList)
  .or_err("Expect keyword `type`, `var`, `procedure` or `begin`")!;
}

function parseTypeDecList(): Node<"TypeDeclaration"> {
  const node = createNode("TypeDeclaration");
  node.id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  next().match("EQ").or_err("Expect `=`");
  node.type = parseTypeName();
  next().match("SEMI").or_err("Expect `;`");
  node.sibling = parseTypeDecMore();
  return node as Node<"TypeDeclaration">;
}

function parseTypeDecMore(): Node<"TypeDeclaration"> | null {
  return next<"TypeDeclaration", null>()
  .in_predict(9).then_take(() => null)
  .in_predict(10).then_take(parseTypeDecList)
  .or_err("Expect an identifier or keyword `var`, `procedure`, `begin`")!;
}

function parseTypeName(): Node<SnlTypeKind> {
  return next<SnlTypeKind>()
  .in_predict(12).then_take(parseBaseType)
  .in_predict(13).then_take(parseStructureType)
  .in_predict(14).then_take(() => {
    const node = createNode("IdType");
    node.id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
    return node as Node<"IdType">;  
  })
  .or_err("Expect an identifier or keyword `integer`, `char`, `array`, `record`")!;
}

function parseBaseType(): Node<"IntegerType" | "CharType"> {  
  return next<"IntegerType" | "CharType">()
  .in_predict(15).then_skip().then_take(() => createNode("IntegerType") as Node<"IntegerType">)
  .in_predict(16).then_skip().then_take(() => createNode("CharType") as Node<"CharType">)
  .or_err("Expect keyword `integer` or `char`")!;
}

function parseStructureType(): Node<"ArrayType" | "RecordType"> {
  return next<"ArrayType" | "RecordType">()
  .in_predict(17).then_skip().then_take(parseArrayType)
  .in_predict(18).then_skip().then_take(parseRecordType)
  .or_err("Expect keword `array` or `record`")!;
}

function parseArrayType(): Node<"ArrayType"> {
  const node = createNode("ArrayType");
  next().match("L_SQUARE").or_err("Expect `[`");
  node.low = next<"IntegerLiteral">().match("INTC").then_take().or_err("Expect an integer")!;
  next().match("RANGE").or_err("Expect `..`");
  node.high = next<"IntegerLiteral">().match("INTC").then_take().or_err("Expect an integer")!;
  next().match("R_SQUARE").or_err("Expect `]`");
  next().match("OF").or_err("Expect keyword `of`");
  node.elemType = parseBaseType();
  return node as Node<"ArrayType">;
}

function parseRecordType(): Node<"RecordType"> {
  const node = createNode("RecordType");
  node.fields = parseFieldDecList();
  next().match("END").or_err("Expect keyword `end`");
  return node as Node<"RecordType">;
}

function parseFieldDecList(): Node<"VarDeclaration"> {
  const node = createNode("VarDeclaration");
  node.type = next<SnlTypeKind>()
    .in_predict(23).then_take(parseBaseType)
    .in_predict(24).then_skip().then_take(parseArrayType)
    .or_err("Expect keyword `integer`, `char` or `array`")!;
  node.ids = parseIdList();
  next().match("SEMI").or_err("Expect `;`");
  node.sibling = parseFieldDecMore();
  return node as Node<"VarDeclaration">;
}

function parseFieldDecMore(): Node<"VarDeclaration"> | null {
  return next<"VarDeclaration", null>()
  .in_predict(25).then_take(() => null)
  .in_predict(26).then_take(parseFieldDecList)
  .or_err("Expect keyword `end`, `integer`, `char`, `array`")!;
}

function parseIdList(): Node<"Identifier"> {
  const id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  id.sibling = parseIdMore();
  return id as Node<"Identifier">;
}

function parseIdMore(): Node<"Identifier"> | null {
  return next<"Identifier", null>()
  .in_predict(28).then_take(() => null)
  .in_predict(29).then_skip().then_take(parseIdList)
  .or_err("Expect `;` or `,`")!;
}

function parseVarDec(): Node<"VarDeclaration"> | null {
  return next<"VarDeclaration", null>()
  .in_predict(30).then_take(() => null)
  .in_predict(31).then_skip().then_take(parseVarDecList)
  .or_err("Expect keyword `var`, `procedure` or `begin`")!;
}

function parseVarDecList(): Node<"VarDeclaration"> {
  const node = createNode("VarDeclaration");
  node.type = parseTypeName();
  node.ids = parseVarIdList();
  next().match("SEMI").or_err("Expect `;`")
  node.sibling = parseVarDecMore();
  return node as Node<"VarDeclaration">;
}

function parseVarDecMore(): Node<"VarDeclaration"> | null {
  return next<"VarDeclaration", null>()
  .in_predict(34).then_take(() => null)
  .in_predict(35).then_take(parseVarDecList)
  .or_err("Expect a type or keword `procedure`, `begin`")!;
}

function parseVarIdList(): Node<"Identifier"> {
  const id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  id.sibling = parseVarIdMore();
  return id as Node<"Identifier">;
}

function parseVarIdMore(): Node<"Identifier"> | null {
  return next<"Identifier", null>()
  .in_predict(37).then_take(() => null)
  .in_predict(38).then_skip().then_take(parseVarIdList)
  .or_err("Expect `;` or `,`")!;
}

function parseProcDec(): Node<"ProcDeclaration"> | null {
  return next<"ProcDeclaration", null>()
  .in_predict(39).then_take(() => null)
  .in_predict(40).then_skip().then_take(parseProcDecList)
  .or_err("Expect keyword `procedure` or `begin`")!;
}

function parseProcDecList(): Node<"ProcDeclaration"> {
  const node = createNode("ProcDeclaration");
  node.name = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  next().match("L_PAREN").or_err("Expect `(`");
  node.params = parseParamList();
  next().match("R_PAREN").or_err("Expect `)`")
  next().match("SEMI").or_err("Expect `;`")
  node.declare = parseDeclarePart();
  node.body = parseProgramBody();
  node.sibling = parseProcDecMore();
  return node as Node<"ProcDeclaration">;
}

function parseProcDecMore(): Node<"ProcDeclaration"> | null {
  return next<"ProcDeclaration", null>()
  .in_predict(42).then_take(() => null)
  .in_predict(43).then_skip().then_take(parseProcDecList)
  .or_err("Expect keyword `procedure` or `begin`")!;
}

function parseParamList(): Node<"ParamDeclaration"> | null {
  return next<"ParamDeclaration", null>()
  .in_predict(45).then_take(() => null)
  .in_predict(46).then_take(parseParamDecList)
  .or_err("Expect a type or `)`")!;
}

function parseParamDecList(): Node<"ParamDeclaration"> {
  const node = parseParam();
  node.sibling = parseParamMore();
  return node as Node<"ParamDeclaration">;
}

function parseParamMore(): Node<"ParamDeclaration"> | null {
  return next<"ParamDeclaration", null>()
  .in_predict(48).then_take(() => null)
  .in_predict(49).then_skip().then_take(parseParamDecList)
  .or_err("Expect `)` or `;`")!;
}

function parseParam(): Node<"ParamDeclaration"> {
  const node = createNode("ParamDeclaration");
  node.passBy = next<"value" | "ref">()
    .in_predict(50).then_take(() => "value")
    .in_predict(51).then_skip().then_take(() => "ref")
    .or_err("Expect a type or keyword `var`")!;
  node.type = parseTypeName();
  node.ids = parseFormList();
  node.sibling = parseParamMore();
  return node as Node<"ParamDeclaration">;
}

function parseFormList(): Node<"Identifier"> {
  const id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  id.sibling = parseFidMore();
  return id as Node<"Identifier">;
}

function parseFidMore(): Node<"Identifier"> | null {
  return next<"Identifier", null>()
  .in_predict(53).then_take(() => null)
  .in_predict(54).then_skip().then_take(parseFormList)
  .or_err("Expect `;`, `,` or `)`")!;
}

function parseProgramBody(): Node<"ProgramBody"> {
  const node = createNode("ProgramBody");
  next().match("BEGIN").or_err("Expect keyword `begin`")
  node.stms = parseStmList();
  next().match("END").or_err("Expect keyword `end`")
  return node as Node<"ProgramBody">;
}

function parseStmList(): Node<StmKind> {
  const node = parseStm();
  node.sibling = parseStmMore();
  return node as Node<StmKind>;
}

function parseStmMore(): Node<StmKind> | null {
  return next<StmKind, null>()
  .in_predict(59).then_take(() => null)
  .in_predict(60).then_skip().then_take(parseStmList)
  .or_err("Expect `;` or keyword `end`, `else, `fi`, `endwh`")!;
}

function parseStm(): Node<StmKind> {
  return next<StmKind>()
  .in_predict(61).then_skip().then_take(parseIfStm)
  .in_predict(62).then_skip().then_take(parseWhileStm)
  .in_predict(63).then_skip().then_take(parseReadStm)
  .in_predict(64).then_skip().then_take(parseWriteStm)
  .in_predict(65).then_skip().then_take(parseReturnStm)
  .in_predict(66).then_take(parseAssCall)
  .or_err("Expect an identifier or keyword `if`, `while`, `read`, `write`, `return`")!;
}

function parseIfStm(): Node<"IfStm"> {
  const node = createNode("IfStm");
  node.test = parseRelExp();
  next().match("THEN").or_err("Expect keyword `then`");
  node.thenStms = parseStmList();
  next().match("ELSE").or_err("Expect keyword `else`");
  node.elseStms = parseStmList();
  next().match("FI").or_err("Expect keyword `fi`")
  return node as Node<"IfStm">;
}

function parseWhileStm(): Node<"WhileStm"> {
  const node = createNode("WhileStm");
  node.test = parseRelExp();
  next().match("DO").or_err("Expect keyword `do`");
  node.loopStms = parseStmList();
  next().match("ENDWH").or_err("Expect keyword `endwh`");
  return node as Node<"WhileStm">;
}

function parseReadStm(): Node<"ReadStm"> {
  const node = createNode("ReadStm");
  next().match("L_PAREN").or_err("Expect `(`");
  node.to = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  next().match("R_PAREN").or_err("Expect `)`");
  return node as Node<"ReadStm">;
}

function parseWriteStm(): Node<"WriteStm"> {
  const node = createNode("WriteStm")
  next().match("L_PAREN").or_err("Expect `(`");
  node.what = parseExp();
  next().match("R_PAREN").or_err("Expect `)`");
  return node as Node<"WriteStm">;
}

function parseReturnStm(): Node<"ReturnStm"> {
  const node = createNode("ReturnStm")
  next().match("L_PAREN").or_err("Expect `(`")
  node.what = parseExp();
  next().match("R_PAREN").or_err("Expect `)`")
  return node as Node<"ReturnStm">;
}

function parseAssCall(): Node<"AssignStm" | "CallStm"> {
  const id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  return next<"AssignStm" | "CallStm">()
  .in_predict(67).then_take(() => parseAssignmentRest(id))
  .in_predict(68).then_skip().then_take(() => parseCallStmRest(id))
  .or_err("Unexpected token")!;
}

function parseAssignmentRest(id: Node<"Identifier">): Node<"AssignStm"> {
  const left = createNode("Variable");
  left.id = id;
  left.more = parseVariMore();
  const node = createNode("AssignStm");
  node.left = left as Node<"Variable">;
  next().match("ASSIGN").or_err("Expect `:=`");
  node.right = parseExp();
  return node as Node<"AssignStm">;
}

function parseCallStmRest(id: Node<"Identifier">): Node<"CallStm"> {
  const node = createNode("CallStm");
  node.fn = id;
  node.args = parseActParamList();
  next().match("R_PAREN").or_err("Expect `)`");
  return node as Node<"CallStm">;
}

function parseActParamList(): Node<ExpKind> | null {
  return next<ExpKind, null>()
  .in_predict(77).then_take(() => null)
  .in_predict(78).then_take(() => {
    const exp = parseExp();
    exp.sibling = parseActParamMore();
    return exp as Node<ExpKind>;  
  })
  .or_err("Expect `)` or an expression")!;
}

function parseActParamMore(): Node<ExpKind> | null {
  return next<ExpKind, null>()
  .in_predict(79).then_take(() => null)
  .in_predict(80).then_skip().then_take(parseActParamList)
  .or_err("Expect `,` or `)`")!;
}

function parseRelExp(): Node<"OpExp"> {
  const node = createNode("OpExp");
  node.left = parseExp();
  node.op = next<"<" | "=">().is_op(["<", "="]).then_take().or_err("Expect `<` or `=`")!;
  node.right = parseExp();
  return node as Node<"OpExp">;
}

function parseExp(): Node<ExpKind> {
  let exp = parseTerm();
  while (true) {
    const op = next<"+" | "-">().is_op(["+", "-"]).then_take().or_omit();
    if (!op) break;
    const otherTerm = parseTerm();
    const addOpExp = createNode("OpExp");
    addOpExp.left = exp;
    addOpExp.op = op;
    addOpExp.right = otherTerm;
    exp = addOpExp as Node<ExpKind>;
  }
  return exp;
}

function parseTerm(): Node<ExpKind> {
  let term = parseFactor();
  while (true) {
    const op = next<"*" | "/">().is_op(["*", "/"]).then_take().or_omit();
    if (!op) break;
    const otherFactor = parseFactor();
    const multOpExp = createNode("OpExp");
    multOpExp.left = term;
    multOpExp.op = op;
    multOpExp.right = otherFactor;
    term = multOpExp as Node<ExpKind> ;
  }
  return term as Node<ExpKind>;
}

function parseFactor(): Node<ExpKind>  {
  return next<ExpKind>()
  .in_predict(89).then_skip().then_take(() => {
    const node = parseExp();
    next().match("R_PAREN").or_err("Expect `)`");
    return node as Node<ExpKind>;
  })
  .in_predict(90).then_take(() => {
    const node = createNode("ConstExp");
    node.content = next<"IntegerLiteral">().match("INTC").then_take().or_err("Expect an integer")!;
    return node as Node<"ConstExp">;
  })
  .in_predict(91).then_take(() => {
    const node = createNode("IdExp");
    node.content = parseVariable();
    return node as Node<"IdExp">;
  })
  .or_err("Expect an expression")!;
}

function parseVariable(): Node<"Variable"> {
  const node = createNode("Variable");
  node.id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  node.more = parseVariMore();
  return node as Node<"Variable">;
}

function parseVariMore(): Node<"ArrayVariMore" | "FieldVariMore"> | null {
  return next<"ArrayVariMore" | "FieldVariMore", null>()
  .in_predict(93).then_take(() => null)
  .in_predict(94).then_skip().then_take(() => {
    const node = createNode("ArrayVariMore");
    node.index = parseExp();
    next().match("R_SQUARE").or_err("Expect `]`")
    return node as Node<"ArrayVariMore">;
  })
  .in_predict(95).then_skip().then_take(parseFieldVar)
  .or_err("Unexpected token")!;
}

function parseFieldVar(): Node<"FieldVariMore"> {
  const node = createNode("FieldVariMore");
  node.id = next<"Identifier">().match("ID").then_take().or_err("Expect an identifier")!;
  node.more = parseFieldVarMore();
  return node as Node<"FieldVariMore">;
}

function parseFieldVarMore(): Node<"ArrayVariMore"> | null {
  return next<"ArrayVariMore", null>()
  .in_predict(97).then_take(() => null)
  .in_predict(98).then_skip().then_take(() => {
    const node = createNode("ArrayVariMore");
    node.index = parseExp();
    next().match("R_SQUARE").or_err("Expect `]`")
    return node as Node<"ArrayVariMore">;  
  })
  .or_err("Unexpected token")!;
}

//----------------------------------------------------------------------------------------------

function parser(tokens: Token[]): [AST, null] | [null, SyntaxError] {
  ParsingWorker._tokens = tokens;
  ParsingWorker._index = 0;
  try {
    const ast = parseProgram();
    return [ast, null];
  } catch (err) {
    if (err instanceof SyntaxError) return [null, err]; else throw err;
  }
}

export default parser;
