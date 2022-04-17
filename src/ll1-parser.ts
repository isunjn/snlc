// LL(1) parser

import type { Token } from "./common/token";
import type { Symbo, T_Symbo, N_Symbo } from "./common/grammar";
import type { NodeKind, ExpKind, NullableNode, Node, AST } from "./common/ast";
import { createNode} from "./common/ast";
import { grammar } from "./common/grammar";
import { getPredictTable } from "./common/predict";
import { SyntaxError, errMsgOf } from "./common/error";

//----------------------------------------------------------------------------------------------

type Pointer = [Record<string, unknown>, string]; // we loose type safe on this so-called `pointer` type 😢

//----------------------------------------------------------------------------------------------

const TABLE = getPredictTable();                  // predict table
const ACTIONS = getActions();                     // each rule may have an action, which is used to build AST

let TOKENS: Token[];                              // input tokens
let INDEX: number;                                // current token index

let SYMBO_STACK: Symbo[];                         // symbo stack
let AST_STACK: Pointer[];                         // AST node `pointer` stack

let ASS_OR_CALL_ID: Node<"Identifier">;           // later used in assign_stm or call_stm
let PASS_BY: "value" | "ref";                     // how call_stm argument is passed

let OPERATOR_STACK: ("+" | "-" | "*" | "/")[];    // operator stack, used to build expression node
let OPERAND_STACK: NullableNode<ExpKind>[];       // operand stack, used to build expression node
let EXP_SHOULD_LINK: boolean;                     // flag, indicate whether current expression should link to AST or not
let EXP_SHOULD_SIBLING: boolean;                  // flag, indicate whether we are processing argument expression or not
let EXP_NOT_OVER: boolean;                        // flag, indicate whether current expression is over or not
let EXP_INFO_STACK: [number, boolean, boolean][]; // record a [startPositionInOperandStack, shouldLink, shouldSibling] tuple for every expression

//----------------------------------------------------------------------------------------------

function isNonTerminal(symbo: Symbo): symbo is N_Symbo {
  return TABLE.has(symbo as N_Symbo);
}

// create the corresponding node, link it to AST, and prepare it for further linking
function link(kind: NodeKind | null, keys: string[] = []) {
  if (kind === null) {
    AST_STACK.pop();
    return;
  }
  const node = createNode(kind);
  switch (kind) {
    case "Identifier": 
      (<NullableNode<"Identifier">>node).value = TOKENS[INDEX].sem!;
      (<NullableNode<"Identifier">>node).line = TOKENS[INDEX].line;
      (<NullableNode<"Identifier">>node).column = TOKENS[INDEX].column;
      break;
    case "IntegerLiteral": 
      (<NullableNode<"IntegerLiteral">>node).value = parseInt(TOKENS[INDEX].sem!);
      (<NullableNode<"IntegerLiteral">>node).line = TOKENS[INDEX].line;
      (<NullableNode<"IntegerLiteral">>node).column = TOKENS[INDEX].column;
      break;
    case "ParamDeclaration": (<NullableNode<"ParamDeclaration">>node).passBy = PASS_BY!; break;
    case "CallStm": (<NullableNode<"CallStm">>node).fn = ASS_OR_CALL_ID; break;
    case "Variable": if (!keys.includes("id")) (<NullableNode<"Variable">>node).id = ASS_OR_CALL_ID; break; // variable of the assign stm
    default: break;
  }
  const [pNode, pKey] = AST_STACK.pop()!; // the link position
  pNode[pKey] = node; // link
  for (const key of keys) {
    AST_STACK.push([node, key]);
  }
}

// start parsing one expression
function startOneExp() {
  // if should start a new expression, record the current info, push into stack
  if (!EXP_NOT_OVER) EXP_INFO_STACK.push([OPERAND_STACK.length, EXP_SHOULD_LINK, EXP_SHOULD_SIBLING]);
  // reset all flags
  EXP_SHOULD_LINK = true;
  EXP_SHOULD_SIBLING = false;
  EXP_NOT_OVER = false;
}

// finish this expression parsing
function endOneExp() {
  const [startPos, shouldLink, shouldSibling] = EXP_INFO_STACK.pop()!;
  while (OPERAND_STACK.length !== startPos + 1) {
    const exp = createNode("OpExp");
    exp.right = OPERAND_STACK.pop()! as Node<ExpKind>;
    exp.left = OPERAND_STACK.pop()! as Node<ExpKind>;
    exp.op = OPERATOR_STACK.pop()!;
    OPERAND_STACK.push(exp); // push the new exp back
  }
  // if should, link it to AST, or leave it in operand stack
  if (shouldLink) {
    const finalExp = OPERAND_STACK.pop()!;
    const [pNode, pKey] = AST_STACK.pop()!;
    pNode[pKey] = finalExp;
    // push [exp, "sibling"] into ast stack if should sibling
    if (shouldSibling) AST_STACK.push([finalExp, "sibling"]);
  }
}

function handleConstExp() {
  const num = createNode("IntegerLiteral", TOKENS[INDEX].line, TOKENS[INDEX].column);
  num.value = parseInt(TOKENS[INDEX].sem!);
  const exp = createNode("ConstExp");
  exp.content = num as Node<"IntegerLiteral">;
  OPERAND_STACK.push(exp);
}

function handleIdExp() {
  const exp = createNode("IdExp");
  OPERAND_STACK.push(exp);
  AST_STACK.push([exp, "content"]); // push [exp, "content"] into ast stack to be linked later
}

const priority = new Map<"*" | "/" | "+" | "-", number>().set("*", 2).set("/", 2).set("+", 1).set("-", 1);

function handleOp(op: "<" | "=" | "*" | "/" | "+" | "-") {
  if (op === "<" || op === "=") {
    // link "<" or "=" to [RelExp, "op"]
    const [pNode, pKey] = AST_STACK.pop()!;
    pNode[pKey] = op;
    return;
  }
  // if op's priority is lower, then should pop two operand and one operator to build an OpExp
  const startPos = EXP_INFO_STACK.at(-1)![0];
  let topOp = OPERATOR_STACK.at(-1) ;
  while ((OPERAND_STACK.length >= startPos + 2) && (priority.get(topOp!)! >= priority.get(op)!)) {
    const exp = createNode("OpExp");
    exp.right = OPERAND_STACK.pop()! as Node<ExpKind>;
    exp.left = OPERAND_STACK.pop()! as Node<ExpKind>;
    exp.op = OPERATOR_STACK.pop()!;
    OPERAND_STACK.push(exp); // push the new exp back
    topOp = OPERATOR_STACK.at(-1);
  }
  OPERATOR_STACK.push(op);
}

// each rule may have an action (a function), which is used to build AST
function getActions(): Map<number, () => unknown> {
  return new Map<number, () => unknown>()
    .set(3, () => link("Identifier"))
    .set(4, () => link("DeclarePart", ["procs", "vars", "types"]))
    .set(5, () => link(null))
    .set(8, () => link("TypeDeclaration", ["sibling", "type", "id"]))
    .set(9, () => link(null))
    .set(11, () => link("Identifier"))
    .set(14, () => {
      link("IdType", ["id"]);
      link("Identifier");
    })
    .set(15, () => link("IntegerType"))
    .set(16, () => link("CharType"))
    .set(19, () => link("ArrayType", ["elemType", "high", "low"]))
    .set(20, () => link("IntegerLiteral"))
    .set(21, () => link("IntegerLiteral"))
    .set(22, () => link("RecordType", ["fields"]))
    .set(23, () => link("VarDeclaration", ["sibling", "ids", "type"]))
    .set(24, () => link("VarDeclaration", ["sibling", "ids", "type"]))
    .set(25, () => link(null))
    .set(27, () => link("Identifier", ["sibling"]))
    .set(28, () => link(null))
    .set(30, () => link(null))
    .set(33, () => link("VarDeclaration", ["sibling", "ids", "type"]))
    .set(34, () => link(null))
    .set(36, () => link("Identifier", ["sibling"]))
    .set(37, () => link(null))
    .set(39, () => link(null))
    .set(41, () => link("ProcDeclaration", ["sibling", "body", "declare", "params", "name"]))
    .set(42, () => link(null))
    .set(44, () => link("Identifier"))
    .set(45, () => link(null))
    .set(48, () => link(null))
    .set(50, () => {
      PASS_BY = "value";
      link("ParamDeclaration", ["sibling", "ids", "type"]);
    })
    .set(51, () => {
      PASS_BY = "ref";
      link("ParamDeclaration", ["sibling", "ids", "type"]);
    })
    .set(52, () => link("Identifier", ["sibling"]))
    .set(53, () => link(null))
    .set(57, () => link("ProgramBody", ["stms"]))
    .set(59, () => link(null))
    .set(66, () => {
      const id = createNode("Identifier");
      id.value = TOKENS[INDEX].sem!;
      id.line = TOKENS[INDEX].line;
      id.column = TOKENS[INDEX].column;
      ASS_OR_CALL_ID = id as Node<"Identifier">;
    })
    .set(69, () => {
      link("AssignStm", ["sibling", "right", "left"]);
      link("Variable", ["more"]); // assign stm left variable, use ASS_OR_CALL_ID as "id"
    })
    .set(70, () => link("IfStm", ["sibling", "elseStms", "thenStms", "test"]))
    .set(71, () => link("WhileStm", ["sibling", "loopStms", "test"]))
    .set(72, () => link("ReadStm", ["sibling", "to"]))
    .set(73, () => link("Identifier"))
    .set(74, () => link("WriteStm", ["sibling", "what"]))
    .set(75, () => link("ReturnStm", ["sibling", "what"]))
    .set(76, () => link("CallStm", ["sibling", "args"])) // use ASS_OR_CALL_ID as "fn"
    .set(77, () => link(null))
    .set(78, () => EXP_SHOULD_SIBLING = true)
    .set(79, () => link(null))
    .set(81, () => link("OpExp", ["right", "op", "left"]))
    .set(83, () => startOneExp())
    .set(84, () => endOneExp())
    .set(85, () => {
      EXP_SHOULD_LINK = false;
      EXP_NOT_OVER = true;
    })
    .set(89, () => EXP_SHOULD_LINK = false)
    .set(90, () => handleConstExp())
    .set(91, () => handleIdExp())
    .set(92, () => {
      link("Variable", ["more", "id"]);
      link("Identifier");
    })
    .set(93, () => link(null))
    .set(94, () => link("ArrayVariMore", ["index"]))
    .set(95, () => link("FieldVariMore", ["more", "id"]))
    .set(96, () => link("Identifier"))
    .set(97, () => link(null))
    .set(98, () => link("ArrayVariMore", ["index"]))
    .set(99, () => handleOp("<"))
    .set(100, () => handleOp("="))
    .set(101, () => handleOp("+"))
    .set(102, () => handleOp("-"))
    .set(103, () => handleOp("*"))
    .set(104, () => handleOp("/"));
}

//----------------------------------------------------------------------------------------------

// LL(1) parsing
function parse(): AST {
  SYMBO_STACK.push("EOI");     // the end symbo
  SYMBO_STACK.push("Program"); // the start symbo

  const program = createNode("Program");
  AST_STACK.push([program, "body"]);
  AST_STACK.push([program, "declare"]);
  AST_STACK.push([program, "name"]);

  while(true) {
    const currentToken = TOKENS[INDEX];
    const topSymbo = SYMBO_STACK.at(-1)!;

    // if (#,#), then parsing is finished without error
    if (currentToken.lex === "EOI" && topSymbo === "EOI") break;

    if (currentToken.lex === "EOI") throw new SyntaxError(currentToken.line, currentToken.column, "Program not finished");

    if (isNonTerminal(topSymbo)) {
      // try get grammar rule from table, throw error if failed
      const ruleIdx = TABLE.get(topSymbo)!.get(currentToken.lex as T_Symbo);
      if (!ruleIdx) throw new SyntaxError(currentToken.line, currentToken.column, errMsgOf(topSymbo));
      // pop the symbo stack, push symbos of the rule's right reversely
      SYMBO_STACK.pop();
      const rule = grammar.get(ruleIdx)!;
      for (let i = rule.right.length - 1; i >= 0; i--) {
        if (rule.right[i] !== "EPSILON") SYMBO_STACK.push(rule.right[i]);
      }
      // check if the rule has action need to be performed
      const action = ACTIONS.get(ruleIdx);
      if (action) action();
      continue;
    }
    
    // when top symbo is terminal symbo
    if (currentToken.lex === topSymbo) {
      SYMBO_STACK.pop(); // if match, pop symbo stack
      INDEX++; // token go next
    } else {
      throw new SyntaxError(currentToken.line, currentToken.column, errMsgOf(topSymbo));
    }
  }
  
  return program as AST;
}

//----------------------------------------------------------------------------------------------

function parser(tokens: Token[]): [AST , null] | [null , SyntaxError] {
  TOKENS = tokens;
  INDEX = 0;
  SYMBO_STACK = [];
  AST_STACK = [];
  OPERATOR_STACK = [];
  OPERAND_STACK = [];
  EXP_SHOULD_LINK = true;
  EXP_SHOULD_SIBLING = false;
  EXP_NOT_OVER = false;
  EXP_INFO_STACK = [];

  try {
    return [parse(), null];
  } catch (err) {
    if (err instanceof SyntaxError) return [null, err]; else throw err;
  }
}

export default parser;
