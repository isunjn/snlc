type Base = {
  // span: { start: number; end: number}
}

export type Identifier = Base & {
  value: string;
}

export type IntegerLiteral = Base & {
  value: number;
}

// export type CharLiteral = Base & {
//   value: string;
// }

//----------------------------------------------------------------

export type Program = Base & {
  kind: "Program";
  name: Identifier;
  declare: DeclarePart;
  body: ProgramBody;
}

export type ProgramBody = Base & {
  kind: "ProgramBody";
  stms: Stm[];
}

export type DeclarePart = Base & {
  kind: "DeclarePart";
  types: TypeDeclaration[] | null;
  vars: VarDeclaration[] | null;
  procs: ProcDeclaration[] | null;
}

export type TypeDeclaration = Base & {
  kind: "TypeDeclaration";
  id: Identifier;
  type: SnlType;
}

export type VarDeclaration = Base & {
  kind: "VarDeclaration";
  ids: Identifier[];
  type: SnlType;
}

export type ParamDeclaration = Base & {
  kind: "ParamDeclaration";
  ids: Identifier[];
  type: SnlType;
  passBy: "value" | "reference";
}

export type ProcDeclaration = Base & {
  kind: "ProcDeclaration";
  name: Identifier;
  params: ParamDeclaration[];
  declare: DeclarePart;
  body: ProgramBody;
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
  fields: VarDeclaration[];
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
  thenStms: Stm[];
  elseStms: Stm[] | null;
}

export type WhileStm = Base & {
  kind: "WhileStm";
  test: OpExp;
  loopStms: Stm[];
}

export type ReadStm = Base & {
  kind: "ReadStm";
  to: Identifier;
}

export type WriteStm = Base & {
  kind: "WriteStm";
  what: Exp;
}

export type ReturnStm = Base & {
  kind: "ReturnStm";
  what: Exp;
}

export type AssignStm = Base & {
  kind: "AssignStm";
  left: Variable;
  right: Exp;
}

export type CallStm = Base & {
  kind: "CallStm";
  fn: Identifier;
  args: Exp[];
}

//----------------------------------------------------------------

export type Exp = OpExp | ConstExp | IdExp;

export type OpExp = Base & {
  kind: "OpExp";
  op: "+" | "-" | "*" | "/" | "<" | "=";
  left: Exp;
  right: Exp;
}

export type ConstExp = Base & {
  kind: "ConstExp";
  content: IntegerLiteral;
}

export type IdExp = Base & {
  kind: "IdExp";
  content: Variable;
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

export type GetTypeOf<T extends NodeKind> = 
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

type Nullable<T> = { [P in keyof T]: T[P] | null };

export type GetNullableTypeOf<T extends NodeKind> = 
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

export function createNode<T extends NodeKind>(kind: T): GetNullableTypeOf<T> {
  switch (kind) {
    case "Program":
      return { kind, name: null, declare: null, body: null } as GetNullableTypeOf<T>;
    case "ProgramBody":
      return { kind, stms: null } as GetNullableTypeOf<T>;
    case "DeclarePart":
      return { kind, types: null, vars: null, procs: null } as GetNullableTypeOf<T>;
    case "TypeDeclaration":
      return { kind, id: null, type: null } as GetNullableTypeOf<T>;
    case "VarDeclaration":
      return { kind, ids: null, type: null } as GetNullableTypeOf<T>;
    case "ParamDeclaration":
      return { kind, ids: null, type: null, passBy: null } as GetNullableTypeOf<T>;
    case "ProcDeclaration":
      return { kind, name: null, params: null, declare: null, body: null } as GetNullableTypeOf<T>;
    case "IntegerType":
      return { kind } as GetNullableTypeOf<T>;
    case "CharType":
      return { kind } as GetNullableTypeOf<T>;
    case "ArrayType":
      return { kind, low: null, high: null, elemType: null } as GetNullableTypeOf<T>;
    case "RecordType":
      return { kind, fields: null } as GetNullableTypeOf<T>;
    case "IdType":
      return { kind, id: null } as GetNullableTypeOf<T>;
    case "IfStm":
      return { kind, test: null, thenStms: null, elseStms: null } as GetNullableTypeOf<T>;
    case "WhileStm":
      return { kind, test: null, loopStms: null } as GetNullableTypeOf<T>;
    case "ReadStm":
      return { kind, to: null } as GetNullableTypeOf<T>;
    case "WriteStm":
      return { kind, what: null } as GetNullableTypeOf<T>;
    case "ReturnStm":
      return { kind, what: null } as GetNullableTypeOf<T>;
    case "AssignStm":
      return { kind, left: null, right: null } as GetNullableTypeOf<T>;
    case "CallStm":
      return { kind, fn: null, args: null } as GetNullableTypeOf<T>;
    case "OpExp":
      return { kind, op: null, left: null, right: null } as GetNullableTypeOf<T>;
    case "ConstExp":
      return { kind, content: null } as GetNullableTypeOf<T>;
    case "IdExp":
      return { kind, content: null } as GetNullableTypeOf<T>;
    case "Variable":
      return { kind, id: null, more: null } as GetNullableTypeOf<T>;
    case "ArrayVariMore":
      return { kind, index: null } as GetNullableTypeOf<T>;
    case "FieldVariMore":
      return { kind, id: null, more: null } as GetNullableTypeOf<T>;
    default:
      throw "panic!";
  }
}
