type Base = {
  // TODO:
  // span: { start: number; end: number}
}

export type Identifier = Base & {
  kind: "Identifier";
  value: string;
  sibling: Identifier | null;
}

export type IntegerLiteral = Base & {
  kind: "IntegerLiteral";
  value: number;
  sibling: IntegerLiteral | null;
}

// TODO:
// export type CharLiteral = Base & {
//   value: string;
// }

export function createIndifiter(value: string): Identifier {
  return { kind: "Identifier", value, sibling: null };
}

export function createIntegerLiteral(value: number): IntegerLiteral {
  return { kind: "IntegerLiteral", value, sibling: null };
}

//----------------------------------------------------------------

export type Program = Base & {
  kind: "Program";
  name: Identifier;
  declare: DeclarePart;
  body: ProgramBody;
}

export type ProgramBody = Base & {
  kind: "ProgramBody";
  stms: Stm;
}

//----------------------------------------------------------------

export type DeclarePart = Base & {
  kind: "DeclarePart";
  typePart: TypeDeclarePart | null;
  varPart: VarDeclarePart | null;
  procPart: ProcDeclarePart | null;
}

export type TypeDeclarePart = Base & {
  kind: "TypeDeclarePart";
  types: TypeDeclaration;
}

export type VarDeclarePart = Base & {
  kind: "VarDeclarePart";
  vars: VarDeclaration;
}

export type ParamDeclarePart = Base & {
  kind: "ParamDeclarePart";
  params: ParamDeclaration | null;
}

export type ProcDeclarePart = Base & {
  kind: "ProcDeclarePart";
  procs: ProcDeclaration;
}

//----------------------------------------------------------------

export type TypeDeclaration = Base & {
  kind: "TypeDeclaration";
  id: Identifier;
  type: SnlType;
  sibling: TypeDeclaration | null;
}

export type VarDeclaration = Base & {
  kind: "VarDeclaration";
  ids: Identifier;
  type: SnlType;
  sibling: VarDeclaration | null;
}

export type ParamDeclaration = Base & {
  kind: "ParamDeclaration";
  ids: Identifier;
  type: SnlType;
  passBy: "value" | "ref";
  sibling: ParamDeclaration | null;
}

export type ProcDeclaration = Base & {
  kind: "ProcDeclaration";
  name: Identifier;
  params: ParamDeclarePart;
  declare: DeclarePart;
  body: ProgramBody;
  sibling: ProcDeclaration | null;
}

//----------------------------------------------------------------

export type SnlType = IntegerType | CharType | ArrayType | RecordType | IdType;

export type IntegerType = Base & {
  kind: "IntegerType";
}

export type CharType = Base & {
  kind: "CharType";
}

export type ArrayType = Base & {
  kind: "ArrayType";
  low: IntegerLiteral;
  high: IntegerLiteral;
  elemType: IntegerType | CharType;
}

export type RecordType = Base & {
  kind: "RecordType";
  fields: VarDeclaration;
}

export type IdType = Base & {
  kind: "IdType";
  id: Identifier;
}

//----------------------------------------------------------------

export type Stm = IfStm | WhileStm | ReadStm | WriteStm | ReturnStm | AssignStm | CallStm;

export type IfStm = Base & {
  kind: "IfStm";
  test: OpExp;
  thenStms: Stm;
  elseStms: Stm | null;
  sibling: Stm | null;
}

export type WhileStm = Base & {
  kind: "WhileStm";
  test: OpExp;
  loopStms: Stm;
  sibling: Stm | null;
}

export type ReadStm = Base & {
  kind: "ReadStm";
  to: Identifier;
  sibling: Stm | null;
}

export type WriteStm = Base & {
  kind: "WriteStm";
  what: Exp;
  sibling: Stm | null;
}

export type ReturnStm = Base & {
  kind: "ReturnStm";
  what: Exp;
  sibling: Stm | null;
}

export type AssignStm = Base & {
  kind: "AssignStm";
  left: Variable;
  right: Exp;
  sibling: Stm | null;
}

export type CallStm = Base & {
  kind: "CallStm";
  fn: Identifier;
  args: Exp;
  sibling: Stm | null;
}

//----------------------------------------------------------------

export type Exp = OpExp | ConstExp | IdExp;

export type OpExp = Base & {
  kind: "OpExp";
  op: "+" | "-" | "*" | "/" | "<" | "=";
  left: Exp;
  right: Exp;
  sibling: Exp | null;
}

export type ConstExp = Base & {
  kind: "ConstExp";
  content: IntegerLiteral;
  sibling: Exp | null;
}

export type IdExp = Base & {
  kind: "IdExp";
  content: Variable;
  sibling: Exp | null;
}

//----------------------------------------------------------------

export type Variable = Base & {
  kind: "Variable";
  id: Identifier;
  more: ArrayVariMore | FieldVariMore | null;
}

export type ArrayVariMore = Base & {
  kind: "ArrayVariMore";
  index: Exp;
}

export type FieldVariMore = Base & {
  kind: "FieldVariMore";
  id: Identifier;
  more: ArrayVariMore | null;
}

//================================================================

export type NodeKind = 
  | "Identifier"
  | "IntegerLiteral"
  | "Program"
  | "ProgramBody"
  | "DeclarePart"
  | "TypeDeclarePart"
  | "VarDeclarePart"
  | "ParamDeclarePart"
  | "ProcDeclarePart"
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
  T extends "TypeDeclarePart"  ? TypeDeclarePart  :
  T extends "VarDeclarePart"   ? VarDeclarePart   :
  T extends "ParamDeclarePart" ? ParamDeclarePart :
  T extends "ProcDeclarePart"  ? ProcDeclarePart  :
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

type Nullable<T> = { [P in keyof T]: T[P] | null };

export type NullableNode<T extends NodeKind> = 
  T extends "Identifier"       ? Nullable<Identifier>       :
  T extends "IntegerLiteral"   ? Nullable<IntegerLiteral>   :
  T extends "Program"          ? Nullable<Program>          :
  T extends "ProgramBody"      ? Nullable<ProgramBody>      :
  T extends "DeclarePart"      ? Nullable<DeclarePart>      :
  T extends "TypeDeclarePart"  ? Nullable<TypeDeclarePart>  :
  T extends "VarDeclarePart"   ? Nullable<VarDeclarePart>   :
  T extends "ParamDeclarePart" ? Nullable<ParamDeclarePart> :
  T extends "ProcDeclarePart"  ? Nullable<ProcDeclarePart>  :
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

export function createNullableNode<T extends NodeKind>(kind: T): NullableNode<T> {
  switch (kind) {
    case "Identifier":       return { kind, value: null, sibling: null }                                         as NullableNode<T>;
    case "IntegerLiteral":   return { kind, value: null, sibling: null }                                         as NullableNode<T>;
    case "Program":          return { kind, name: null, declare: null, body: null }                              as NullableNode<T>;
    case "ProgramBody":      return { kind, stms: null }                                                         as NullableNode<T>;
    case "DeclarePart":      return { kind, typePart: null, varPart: null, procPart: null }                      as NullableNode<T>;
    case "TypeDeclarePart":  return { kind, types: null }                                                        as NullableNode<T>;
    case "VarDeclarePart":   return { kind, vars: null }                                                         as NullableNode<T>;
    case "ParamDeclarePart": return { kind, params: null }                                                       as NullableNode<T>;
    case "ProcDeclarePart":  return { kind, procs: null }                                                        as NullableNode<T>;
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
