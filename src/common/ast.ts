type BaseType = "INTEGER" | "CHAR";
type OpType = "LT" | "EQ" | "PLUS" | "MINUS" | "MULTI" | "DEVIDE";

type NodeKind = 
  | "Program"
  | "DeclarePart"
  | "ProgramBody"
  | "TypeDecPart"
  | "VarDecPart"
  | "ProcDecPart"
  | "TypeDec"
  | "VarDec"
  | "ProcDec"
  | "Stm"
  | "Exp";

type DecKind = 
  | "Integer"
  | "Char"
  | "Array"
  | "Record"
  | "Id";

type StmKind = 
  | "If"
  | "While"
  | "Read"
  | "Write"
  | "Return"
  | "Assign"
  | "Call";

type ExpKind =
  | "Op"
  | "Const"
  | "Id";

type VariableKind =
  | "Id"
  | "Array"
  | "Field";

type FieldKind = 
  | "Id"
  | "Array";

type Node<T, K = never> = { kind: Extract<NodeKind, T>; } & (
  T extends "Program"     ? { name: "ID"; declare: Node<"DeclarePart">; body: Node<"ProgramBody"> }                        : 
  T extends "PragramBody" ? { stms: StmNode<StmKind> }                                                                   :
  T extends "DeclarePart" ? { typePart: Node<"TypeDecPart">;  varPart: Node<"VarDecPart">; procPart: Node<"ProcDecPart"> } :
  T extends "TypeDecPart" ? { types: TypeDecNode<DecKind> }                                                                :
  T extends "VarDecPart"  ? { vars: VarDecNode<DecKind> }                                                                  :
  T extends "ProcDecPart" ? { procs: ProcDecNode }                                                                         :
  T extends "TypeDec"     ? TypeDecNode<K>                                                                                 :
  T extends "VarDec"      ? VarDecNode<K>                                                                                  :
  T extends "ProcDec"     ? ProcDecNode                                                                                    :
  T extends "Stm"         ? StmNode<K>                                                                                     :
  T extends "Exp"         ? ExpNode<K>                                                                                     :
  never
);

// DecNode is used as base structure of TypeDecNode / VarDecNode / ParamDecNode, since they share a similar pattern
type DecNode<K> = { decKind: Extract<DecKind, K> } & (
  K extends "Integer" | "Char" ? Record<string, never>                                        :
  K extends "Array"            ? { low: "INTC"; high: "INTC"; itemType: BaseType }            :
  K extends "Record"           ? { fields: VarDecNode<Exclude<DecKind, "Record" | "Id">>[] }  :
  K extends "Id"               ? { typeIdentifier: "ID" }                                     :
  never
);
type TypeDecNode<K> = DecNode<K> & { identifier: "ID"; sibling: TypeDecNode<DecKind> };
type VarDecNode<K> = DecNode<K> & { identifiers: "ID"[]; sibling: VarDecNode<DecKind> };
type ParamDecNode<K> = DecNode<K> & { identifiers: "ID"[]; passBy: "value" | "reference"; sibling: ParamDecNode<DecKind> };

type ProcDecNode = {
  procName: "ID";
  params: ParamDecNode<DecKind>;
  declare: Node<"DeclarePart">;
  body: Node<"ProgramBody">;
  silbing: ProcDecNode;
};

type StmNode<S> = { stmKind: Extract<StmKind, S>; sibling: StmNode<StmKind> } & (
  S extends "If"     ? { relExp: ExpNode<ExpKind>; thenStms: StmNode<StmKind>; elseStms: StmNode<StmKind>; } :
  S extends "While"  ? { relExp: ExpNode<ExpKind>; loopStms: StmNode<StmKind> }                                :
  S extends "Read"   ? { readTo: "ID" }                                                                          :
  S extends "Write"  ? { writeExp: ExpNode<ExpKind> }                                                            :
  S extends "Return" ? { returnExp: ExpNode<ExpKind> }                                                           :
  S extends "Assign" ? { lhs: VariableNode<VariableKind>; rhs: ExpNode<ExpKind> }                                :
  S extends "Call"   ? { procName: "ID"; actualParams: ExpNode<ExpKind>[] }                                      :
  never
);

type ExpNode<E> = { expKind: Extract<ExpKind, E> } & (
  E extends "Op"    ? { op: OpType; lhs: ExpNode<ExpKind>; rhs: ExpNode<ExpKind> } :
  E extends "Const" ? { value: "INTC" }                                            :
  E extends "Id"    ? VariableNode<VariableKind>                                   :
  never
);

type VariableNode<V> = { variableKind: Extract<VariableKind, V>; identifier: "ID" } & (
  V extends "Id"    ? Record<string, never>            :
  V extends "Array" ? { arrayIndex: ExpNode<ExpKind> } :
  V extends "Field" ? FieldNode<FieldKind>             :
  never
);

type FieldNode<F> = { fieldKind: Extract<FieldKind, F>; identifier: "ID" } & (
  F extends "Id"    ? Record<string, never>            :
  F extends "Array" ? { arrayIndex: ExpNode<ExpKind> } :
  never
);

export type {
  Node,
  TypeDecNode,
  VarDecNode,
  ParamDecNode,
  ProcDecNode,
  StmNode,
  ExpNode,
  VariableNode,
  FieldNode,
}
