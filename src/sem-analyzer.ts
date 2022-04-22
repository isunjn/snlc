// semantic analyzer

import { AST, Node, StmKind, SnlTypeKind, ExpKind } from "./common/ast";
import { SemError } from "./common/error";

//-----------------------------------------------------------------------------

// the word `type` got too many different meanings in this file
// we use `Ty` to indicate the inner presentation of SNL type
type Ty = IntegerTy | CharTy | BoolTy | ArrayTy | RecordTy;

// all ty are stored in an array, use it's index to point to, -1 represented as an error
type TyIdx = number;

type IntegerTy = {
  kind: "integer";
}

type CharTy = {
  kind: "char";
}

type BoolTy = {
  kind: "bool";
}

type ArrayTy = {
  kind: "array";
  elemTy: TyIdx;
}

type RecordTy = {
  kind: "record";
  fields: Map<string, TyIdx>; // fieldname -> TyIdx
}

//-----------------------------------------------------------------------------

type SymboTable = Map<string, TableItem>;

type TableItem = TypeItem | VarItem | ProcItem;

type TypeItem = {
  kind: "type";
  ty: TyIdx;
}

type VarItem = {
  kind: "var";
  ty: TyIdx;
  access: "dir" | "indir";
}

type ProcItem = {
  kind: "proc";
  params: VarItem[];
}

//-----------------------------------------------------------------------------

// The `Scope` here is representing the whole nested scope of program
class Scope {
  _tys: Ty[]= [];
  _tables: SymboTable[] = [];

  constructor(programName: string) {
    // push program name as the first item in symbo table
    this._tables.push(new Map<string, TableItem>().set(programName, { kind: "proc", params: [] }));
    // init primitive ty
    this._tys.push({ kind: "integer" }); // avoid 0 index, it can be error-prone
    this._tys.push({ kind: "integer" }); // 1
    this._tys.push({ kind: "char" });    // 2
    this._tys.push({ kind: "bool" });    // 3
  }

  // nest into a procedure
  in() {
    this._tables.push(new Map<string, TableItem>());
  }

  // nest out from a procedure
  out() {
    this._tables.pop();
  }

  entryTy(ty: Ty): TyIdx {
    this._tys.push(ty);
    return this._tys.length - 1;
  }

  findTy(idx: TyIdx): Ty | undefined {
    return this._tys[idx];
  }

  entryItem(id: Node<"Identifier">, item: TableItem) {
    if (this._tables.at(-1)!.has(id.value)) {
      ERRORS.push(new SemError(id.line, id.column, `Duplicate identifier`));
    } else {
      this._tables.at(-1)!.set(id.value, item);
    }
  }

  findItem(id: string): TableItem | undefined {
    for (let i = this._tables.length - 1; i >= 0; i--) {
      const item = this._tables[i].get(id);
      if (item) return item;
    }
  }
}

//-----------------------------------------------------------------------------

let SCOPE: Scope;
let ERRORS: SemError[];

//-----------------------------------------------------------------------------

function getTyOf(node: Node<SnlTypeKind>): TyIdx {
  if (node.kind === "IntegerType") return 1; // integer ty
  if (node.kind === "CharType") return 2; // char ty
  if (node.kind === "ArrayType") {
    if (node.low.value > node.high.value) {
      ERRORS.push(new SemError(node.low.line, node.low.column, `\`${node.low.value}\` is greater than \`${node.high.value}\``));
    }
    const elemTy = getTyOf(node.elemType);
    if (elemTy !== -1) {
      return SCOPE.entryTy({ kind: "array", elemTy: getTyOf(node.elemType)});
    } else {
      return -1;
    }
  }
  if (node.kind === "RecordType") {
    const filedMap = new Map<string, TyIdx>();
    let f: Node<"VarDeclaration"> | null = node.fields;
    while (f) {
      const ty = getTyOf(f.type);
      if (ty !== -1) {
        let id: Node<"Identifier"> | null = f.ids;
        while (id) {
          if (filedMap.has(id.value)) {
            ERRORS.push(new SemError(id.line, id.column, `Duplicate identifier`));
          } else {
            filedMap.set(id.value, ty);
          }
          id = id.sibling;
        }
      }
      f = f.sibling;
    }
    return SCOPE.entryTy({ kind: "record", fields: filedMap });
  }
  if (node.kind === "IdType") {
    const item = SCOPE.findItem(node.id.value);
    if (!item) {
      ERRORS.push(new SemError(node.id.line, node.id.column, `Identifier \`${node.id.value}\` not found`));
      return -1;
    } else if (item.kind !== "type") {
      ERRORS.push(new SemError(node.id.line, node.id.column, `Identifier \`${node.id.value}\` is not a type`));
      return -1;
    } else {
      return item.ty;
    }
  }
  throw "panic!";
}

function buildTable(params: Node<"ParamDeclaration"> | null, declare: Node<"DeclarePart">) {
  // params
  let param = params;
  while (param) {
    const ty = getTyOf(param.type);
    if (ty !== -1) {
      const access = param.passBy === "value" ? "dir" : "indir";
      let id: Node<"Identifier"> | null = param.ids;
      while (id) {
        SCOPE.entryItem(id, { kind: "var", access, ty });
        id = id.sibling;
      }
    }
    param = param.sibling;
  }
  
  // types
  let t = declare.types;
  while (t) {
    const ty = getTyOf(t.type);
    if (ty !== -1) {
      SCOPE.entryItem(t.id, { kind: "type", ty});
    }
    t = t.sibling;
  }

  // vars
  let v = declare.vars;
  while (v) {
    const ty = getTyOf(v.type);
    if (ty !== -1) {
      let id: Node<"Identifier"> | null = v.ids;
      while (id) {
        SCOPE.entryItem(id, { kind: "var", access: "dir", ty });
        id = id.sibling;
      }
    }
    v = v.sibling;
  }

  // procs
  let p = declare.procs;
  while (p) {
    const paramsItemArray: VarItem[] = [];
    let param = p.params;
    while (param) {
      const ty = getTyOf(param.type);
      if (ty !== -1) {
        const access = param.passBy === "value" ? "dir" : "indir";
        let id: Node<"Identifier"> | null = param.ids;
        while (id) {
          paramsItemArray.push({ kind: "var", access, ty});
          id = id.sibling;
        }
      }
      param = param.sibling;
    }
    SCOPE.entryItem(p.name, { kind: "proc", params: paramsItemArray});
    
    // recursively process every proc
    SCOPE.in();
    buildTable(p.params, p.declare);
    checkStms(p.body.stms);
    SCOPE.out();

    p = p.sibling;
  }
}

function checkStms(stms: Node<StmKind>) {
  let stm: Node<StmKind> | null = stms;
  while (stm) {
    if (stm.kind === "IfStm") {
      checkExp(stm.test); // non_bool_type_error is detected in parsing phase
      checkStms(stm.thenStms);
      checkStms(stm.elseStms);
    } else if (stm.kind === "WhileStm") {
      checkExp(stm.test); // non_bool_type_error is detected in parsing phase
      checkStms(stm.loopStms);
    } else if (stm.kind === "ReadStm") {
      const item = SCOPE.findItem(stm.to.value);
      if (!item) {
        ERRORS.push(new SemError(stm.to.line, stm.to.column, `Identifier \`${stm.to.value}\` not found`));
      } else if (item.kind !== "var") {
        ERRORS.push(new SemError(stm.to.line, stm.to.column, `Identifier \`${stm.to.value}\` is not a variable`));
      }
    } else if (stm.kind === "WriteStm" || stm.kind === "ReturnStm") {
      checkExp(stm.what);
    } else if (stm.kind === "AssignStm") {
      const leftTy = checkVariable(stm.left);
      const rightTy = checkExp(stm.right);
      if (leftTy !== -1 && rightTy[0] !== -1 && leftTy !== rightTy[0]) {
        ERRORS.push(new SemError(stm.left.id.line, stm.left.id.column, `Type mismatch of assign statement's two sides`));
      }
    } else if (stm.kind === "CallStm") {
      const item = SCOPE.findItem(stm.fn.value);
      if (!item) {
        ERRORS.push(new SemError(stm.fn.line, stm.fn.column, `Identifier \`${stm.fn.value}\` not found`));
      } else if (item.kind !== "proc") {
        ERRORS.push(new SemError(stm.fn.line, stm.fn.column, `Identifier \`${stm.fn.value}\` is not a procedure`));
      } else {
        const argsTy: TyIdx[] = [];
        let argExp = stm.args;
        while (argExp) {
          argsTy.push(checkExp(argExp)[0]);
          argExp = argExp.sibling;
        }
        if (argsTy.length !== item.params.length) {
          ERRORS.push(new SemError(stm.fn.line, stm.fn.column, `Expect ${item.params.length} argument(s), but got ${argsTy.length}`));
        } else {
          for (let i = 0; i < argsTy.length; i++) {
            if (argsTy[i] !== -1 && argsTy[i] !== item.params[i].ty) {
              ERRORS.push(new SemError(stm.fn.line, stm.fn.column, `Type mismatch of the \`${i + 1}\`th argument and parameter`));
            }
          }
        }
      }
    }
    stm = stm.sibling;
  }
}

// return the TyIdx and a [line, column] tuple
function checkExp(exp: Node<ExpKind>): [TyIdx, [number, number]] {
  if (exp.kind === "ConstExp") {
    return [1, [exp.content.line, exp.content.column]]; // integer ty
  }
  if (exp.kind === "IdExp") {
    return [checkVariable(exp.content), [exp.content.id.line, exp.content.id.column]];
  }
  if (exp.kind === "OpExp") {
    const leftTy = checkExp(exp.left);
    const rightTy = checkExp(exp.right);
    if (leftTy[0] === -1 || rightTy[0] === -1) return [-1, [-1, -1]];
    if (leftTy[0] !== rightTy[0]) {
      ERRORS.push(new SemError(leftTy[1][0], leftTy[1][1], `Type mismatch of operator expression's two sides`));
      return [-1, [-1, -1]];
    }
    if (exp.op === "<" || exp.op === "=") return [3, [leftTy[1][0], leftTy[1][0]]]; // bool ty
    else return [1, [leftTy[1][0], leftTy[1][0]]]; // integer ty
  }
  throw "panic!";
}

function checkVariable(v: Node<"Variable">): TyIdx {
  const item = SCOPE.findItem(v.id.value);
  if (!item) {
    ERRORS.push(new SemError(v.id.line, v.id.column, `Identifier \`${v.id.value}\` not found`));
    return -1;
  }
  if (item.kind !== "var") {
    ERRORS.push(new SemError(v.id.line, v.id.column, `Identifier \`${v.id.value}\` is not a variable`));
    return -1;
  }
  if (!v.more) return item.ty;
  if (v.more.kind === "ArrayVariMore") {
    return handleArrayVariMore(v.more.index, item.ty, v.id);
  }
  if (v.more.kind === "FieldVariMore") {
    const shouldBeRecordTy = SCOPE.findTy(item.ty);
    if (!shouldBeRecordTy) throw "panic!";
    if (shouldBeRecordTy.kind !== "record") {
      ERRORS.push(new SemError(v.id.line, v.id.column, `\`${v.id.value}\` is not a record`));
      return -1;
    }
    const fieldTy = shouldBeRecordTy.fields.get(v.more.id.value);
    if (!fieldTy) {
      ERRORS.push(new SemError(v.more.id.line, v.more.id.column, `Field \`${v.more.id.value}\` not found on \`${v.id.value}\``));
      return -1;
    }
    if (!v.more.more) return fieldTy;
    return handleArrayVariMore(v.more.more.index, fieldTy, v.more.id);
  }
  throw "panic!";

  // an inner private function
  function handleArrayVariMore(index: Node<ExpKind>, itemTy: TyIdx, it: Node<"Identifier">) {
    const shouldBeArrTy = SCOPE.findTy(itemTy);
    if (!shouldBeArrTy) throw "panic!";
    if (shouldBeArrTy.kind !== "array") {
      ERRORS.push(new SemError(it.line, it.column, `\`${it.value}\` is not an array`));
      return -1;
    } else {
      const indexTy = checkExp(index);
      if (indexTy[0] === -1) return -1;
      if (indexTy[0] !== 1) {
        ERRORS.push(new SemError(indexTy[1][0], indexTy[1][1], `Array index's type is not integer`));
        return -1;
      }  
      return shouldBeArrTy.elemTy;
    }
  }
}

//-----------------------------------------------------------------------------

function analyzer(ast: AST): SemError[] {
  ERRORS = [];
  SCOPE = new Scope(ast.name.value);
  buildTable(null, ast.declare);
  checkStms(ast.body.stms);
  return ERRORS;
}

export default analyzer;
