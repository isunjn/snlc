type Base = {
  // TODO: indicate the span of every AST node
  // span: { start: number; end: number}
}

type Identifier = Base & {
  kind: "Identifier";
  value: string;
  sibling: Identifier | null;
  // identifier's line and column are used by sem-analyzer
  line: number;
  column: number;
}

type IntegerLiteral = Base & {
  kind: "IntegerLiteral";
  value: number;
  // integerliteral's line and column are used by sem-analyzer
  line: number;
  column: number;
}

// type CharLiteral = Base & {
//   kind: "CharLiteral";
//   value: string;
// }

//----------------------------------------------------------------

type Program = Base & {
  kind: "Program";
  name: Identifier;
  declare: DeclarePart;
  body: ProgramBody;
}

type ProgramBody = Base & {
  kind: "ProgramBody";
  stms: Stm;
}

type DeclarePart = Base & {
  kind: "DeclarePart";
  types: TypeDeclaration | null;
  vars: VarDeclaration | null;
  procs: ProcDeclaration | null;
}

//----------------------------------------------------------------

type TypeDeclaration = Base & {
  kind: "TypeDeclaration";
  id: Identifier;
  type: SnlType;
  sibling: TypeDeclaration | null;
}

type VarDeclaration = Base & {
  kind: "VarDeclaration";
  ids: Identifier;
  type: SnlType;
  sibling: VarDeclaration | null;
}

type ParamDeclaration = Base & {
  kind: "ParamDeclaration";
  ids: Identifier;
  type: SnlType;
  passBy: "value" | "ref";
  sibling: ParamDeclaration | null;
}

type ProcDeclaration = Base & {
  kind: "ProcDeclaration";
  name: Identifier;
  params: ParamDeclaration | null;
  declare: DeclarePart;
  body: ProgramBody;
  sibling: ProcDeclaration | null;
}

//----------------------------------------------------------------

type SnlType = IntegerType | CharType | ArrayType | RecordType | IdType;

type IntegerType = Base & {
  kind: "IntegerType";
}

type CharType = Base & {
  kind: "CharType";
}

type ArrayType = Base & {
  kind: "ArrayType";
  low: IntegerLiteral;
  high: IntegerLiteral;
  elemType: IntegerType | CharType;
}

type RecordType = Base & {
  kind: "RecordType";
  fields: VarDeclaration;
}

type IdType = Base & {
  kind: "IdType";
  id: Identifier;
}

//----------------------------------------------------------------

type Stm = IfStm | WhileStm | ReadStm | WriteStm | ReturnStm | AssignStm | CallStm;

type IfStm = Base & {
  kind: "IfStm";
  test: OpExp;
  thenStms: Stm;
  elseStms: Stm;
  sibling: Stm | null;
}

type WhileStm = Base & {
  kind: "WhileStm";
  test: OpExp;
  loopStms: Stm;
  sibling: Stm | null;
}

type ReadStm = Base & {
  kind: "ReadStm";
  to: Identifier;
  sibling: Stm | null;
}

type WriteStm = Base & {
  kind: "WriteStm";
  what: Exp;
  sibling: Stm | null;
}

type ReturnStm = Base & {
  kind: "ReturnStm";
  what: Exp;
  sibling: Stm | null;
}

type AssignStm = Base & {
  kind: "AssignStm";
  left: Variable;
  right: Exp;
  sibling: Stm | null;
}

type CallStm = Base & {
  kind: "CallStm";
  fn: Identifier;
  args: Exp | null;
  sibling: Stm | null;
}

//----------------------------------------------------------------

export type Exp = OpExp | ConstExp | IdExp;

type OpExp = Base & {
  kind: "OpExp";
  op: "+" | "-" | "*" | "/" | "<" | "=";
  left: Exp;
  right: Exp;
  sibling: Exp | null;
}

type ConstExp = Base & {
  kind: "ConstExp";
  content: IntegerLiteral;
  sibling: Exp | null;
}

type IdExp = Base & {
  kind: "IdExp";
  content: Variable;
  sibling: Exp | null;
}

//----------------------------------------------------------------

type Variable = Base & {
  kind: "Variable";
  id: Identifier;
  more: ArrayVariMore | FieldVariMore | null;
}

type ArrayVariMore = Base & {
  kind: "ArrayVariMore";
  index: Exp;
}

type FieldVariMore = Base & {
  kind: "FieldVariMore";
  id: Identifier;
  more: ArrayVariMore | null;
}

//================================================================

type Nullable<T> = { [P in keyof T]: T[P] | null };
export type AST = Node<"Program">;

export type LiteralNodeKind = "value" | "ref" | "<" | "=" | "+" | "-" | "*" | "/";
export type DeclarationKind = "TypeDeclaration" | "VarDeclaration" | "ParamDeclaration" | "ProcDeclaration";
export type SnlTypeKind = "IntegerType" | "CharType" | "ArrayType" | "RecordType" | "IdType";
export type StmKind = | "IfStm" | "WhileStm" | "ReadStm" | "WriteStm" | "ReturnStm" | "AssignStm" | "CallStm";
export type ExpKind = "OpExp" | "ConstExp" | "IdExp";
export type NodeKind = 
  | "Identifier"
  | "IntegerLiteral"
  | "Program"
  | "ProgramBody"
  | "DeclarePart"
  | "TypeDeclaration"
  | "VarDeclaration"
  | "ParamDeclaration"
  | "ProcDeclaration"
  | "IntegerType"
  | "CharType"
  | "ArrayType"
  | "RecordType"
  | "IdType"
  | "IfStm"
  | "WhileStm"
  | "ReadStm"
  | "WriteStm"
  | "ReturnStm"
  | "AssignStm"
  | "CallStm"
  | "OpExp"
  | "ConstExp"
  | "IdExp"
  | "Variable"
  | "ArrayVariMore"
  | "FieldVariMore";

export type Node<T extends NodeKind> = 
  T extends "Identifier"       ? Identifier       :
  T extends "IntegerLiteral"   ? IntegerLiteral   :
  T extends "Program"          ? Program          :
  T extends "ProgramBody"      ? ProgramBody      :
  T extends "DeclarePart"      ? DeclarePart      :
  T extends "TypeDeclaration"  ? TypeDeclaration  :
  T extends "VarDeclaration"   ? VarDeclaration   :
  T extends "ParamDeclaration" ? ParamDeclaration :
  T extends "ProcDeclaration"  ? ProcDeclaration  :
  T extends "IntegerType"      ? IntegerType      :
  T extends "CharType"         ? CharType         :
  T extends "ArrayType"        ? ArrayType        :
  T extends "RecordType"       ? RecordType       :
  T extends "IdType"           ? IdType           :
  T extends "IfStm"            ? IfStm            :
  T extends "WhileStm"         ? WhileStm         :
  T extends "ReadStm"          ? ReadStm          :
  T extends "WriteStm"         ? WriteStm         :
  T extends "ReturnStm"        ? ReturnStm        :
  T extends "AssignStm"        ? AssignStm        :
  T extends "CallStm"          ? CallStm          :
  T extends "OpExp"            ? OpExp            :
  T extends "ConstExp"         ? ConstExp         :
  T extends "IdExp"            ? IdExp            :
  T extends "Variable"         ? Variable         :
  T extends "ArrayVariMore"    ? ArrayVariMore    :
  T extends "FieldVariMore"    ? FieldVariMore    :
  never;

export type NullableNode<T extends NodeKind> = 
  T extends "Identifier"       ? Nullable<Identifier>       :
  T extends "IntegerLiteral"   ? Nullable<IntegerLiteral>   :
  T extends "Program"          ? Nullable<Program>          :
  T extends "ProgramBody"      ? Nullable<ProgramBody>      :
  T extends "DeclarePart"      ? Nullable<DeclarePart>      :
  T extends "TypeDeclaration"  ? Nullable<TypeDeclaration>  :
  T extends "VarDeclaration"   ? Nullable<VarDeclaration>   :
  T extends "ParamDeclaration" ? Nullable<ParamDeclaration> :
  T extends "ProcDeclaration"  ? Nullable<ProcDeclaration>  :
  T extends "IntegerType"      ? Nullable<IntegerType>      :
  T extends "CharType"         ? Nullable<CharType>         :
  T extends "ArrayType"        ? Nullable<ArrayType>        :
  T extends "RecordType"       ? Nullable<RecordType>       :
  T extends "IdType"           ? Nullable<IdType>           :
  T extends "IfStm"            ? Nullable<IfStm>            :
  T extends "WhileStm"         ? Nullable<WhileStm>         :
  T extends "ReadStm"          ? Nullable<ReadStm>          :
  T extends "WriteStm"         ? Nullable<WriteStm>         :
  T extends "ReturnStm"        ? Nullable<ReturnStm>        :
  T extends "AssignStm"        ? Nullable<AssignStm>        :
  T extends "CallStm"          ? Nullable<CallStm>          :
  T extends "OpExp"            ? Nullable<OpExp>            :
  T extends "ConstExp"         ? Nullable<ConstExp>         :
  T extends "IdExp"            ? Nullable<IdExp>            :
  T extends "Variable"         ? Nullable<Variable>         :
  T extends "ArrayVariMore"    ? Nullable<ArrayVariMore>    :
  T extends "FieldVariMore"    ? Nullable<FieldVariMore>    :
  never;

export function createNode<T extends NodeKind>(kind: T, line?: number, column?: number): NullableNode<T> {
  switch (kind) {
    case "Identifier":       return { kind, value: null, sibling: null, line, column }                           as NullableNode<T>;
    case "IntegerLiteral":   return { kind, value: null, line, column }                                          as NullableNode<T>;
    case "Program":          return { kind, name: null, declare: null, body: null }                              as NullableNode<T>;
    case "ProgramBody":      return { kind, stms: null }                                                         as NullableNode<T>;
    case "DeclarePart":      return { kind, types: null, vars: null, procs: null }                               as NullableNode<T>;
    case "TypeDeclaration":  return { kind, id: null, type: null, sibling: null }                                as NullableNode<T>;
    case "VarDeclaration":   return { kind, ids: null, type: null, sibling: null }                               as NullableNode<T>;
    case "ParamDeclaration": return { kind, ids: null, type: null, passBy: null, sibling: null }                 as NullableNode<T>;
    case "ProcDeclaration":  return { kind, name: null, params: null, declare: null, body: null, sibling: null } as NullableNode<T>;
    case "IntegerType":      return { kind }                                                                     as NullableNode<T>;
    case "CharType":         return { kind }                                                                     as NullableNode<T>;
    case "ArrayType":        return { kind, low: null, high: null, elemType: null }                              as NullableNode<T>;
    case "RecordType":       return { kind, fields: null }                                                       as NullableNode<T>;
    case "IdType":           return { kind, id: null }                                                           as NullableNode<T>;
    case "IfStm":            return { kind, test: null, thenStms: null, elseStms: null, sibling: null }          as NullableNode<T>;
    case "WhileStm":         return { kind, test: null, loopStms: null, sibling: null }                          as NullableNode<T>;
    case "ReadStm":          return { kind, to: null, sibling: null }                                            as NullableNode<T>;
    case "WriteStm":         return { kind, what: null, sibling: null }                                          as NullableNode<T>;
    case "ReturnStm":        return { kind, what: null, sibling: null }                                          as NullableNode<T>;
    case "AssignStm":        return { kind, left: null, right: null, sibling: null }                             as NullableNode<T>;
    case "CallStm":          return { kind, fn: null, args: null, sibling: null }                                as NullableNode<T>;
    case "OpExp":            return { kind, op: null, left: null, right: null, sibling: null }                   as NullableNode<T>;
    case "ConstExp":         return { kind, content: null, sibling: null }                                       as NullableNode<T>;
    case "IdExp":            return { kind, content: null, sibling: null }                                       as NullableNode<T>;
    case "Variable":         return { kind, id: null, more: null }                                               as NullableNode<T>;
    case "ArrayVariMore":    return { kind, index: null }                                                        as NullableNode<T>;
    case "FieldVariMore":    return { kind, id: null, more: null }                                               as NullableNode<T>;
    default:                 throw "panic!";
  }
}
