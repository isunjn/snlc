// command line interface

import fs from "fs";
import path from "path";

import { AST, Node, NodeKind, DeclarationKind, StmKind, ExpKind } from "./common/ast";
import { getPredictSets, getPredictTable } from "./common/predict";
import { Error } from "./common/error";
import lexer from "./lexer";
import rdParser from "./rd-parser";
import ll1Parser from "./ll1-parser";
import analyzer from "./sem-analyzer";

//----------------------------------------------------------------------------------------------

let SHOW_SET = false;
let SHOW_TABLE = false;
let SHOW_TOKEN = false;
let SHOW_AST = false;
let USE_LL1 = false;

const MAGENTA='\u001b[35m', GREEN='\u001b[32m', RED='\u001b[31m', BLUE='\u001b[34m', NOCOLOR='\u001b[0m';

//----------------------------------------------------------------------------------------------

let file = process.argv[2];
if (!file) {
  console.error("Need a file name");
  process.exit(1);
}
const sample = path.format({ dir: "sample", name: file, ext: ".snl" });
const stat = fs.statSync(sample);
if (stat.isFile()) file = sample;
try {
  const stat = fs.statSync(file);
  if (!stat.isFile()) {
    console.error(file + " is not a file");
    process.exit(1);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}

const flags = process.argv.slice(3);
for (const flag of flags) {
  switch (flag) {
    case "--set": SHOW_SET = true; break;
    case "--table": SHOW_TABLE = true; break;
    case "--token": SHOW_TOKEN = true; break;
    case "--ast": SHOW_AST = true; break;
    case "--ll": USE_LL1 = true;  break;
    default:
      console.error("Unknown flag: " + flag);
      process.exit(1);
  }
}

fs.readFile(file, "utf-8", (err, code) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  if (SHOW_SET) {
    const sets = getPredictSets();
    for (const [idx, set] of sets) {
      console.log(idx, [...set]);
    }
    process.exit();
  }
  if (SHOW_TABLE) {
    const table = getPredictTable();    
    for (const [nonTerminal, row] of table) {
      console.log(GREEN, nonTerminal);
      for (const [terminal, number] of row) {
        console.log("    " + BLUE + terminal + "    " + MAGENTA + number);
      }
    }
    process.exit();
  }

  const [tokens, lexErrs] = lexer(code);
  if (SHOW_TOKEN && tokens.length > 0) {
    console.log("Tokens:\n------------------");
    for (const token of tokens) {
      console.log(
        token.line + ":" + token.column + "\t" + GREEN + token.lex + "\t" + 
        MAGENTA + (token.sem ? token.sem : '') + NOCOLOR
      );
    }
  }
  if (lexErrs.length > 0) {
    printErrors(code, lexErrs);
    process.exit();
  }
  if (SHOW_TOKEN) process.exit();

  const parser = USE_LL1 ? ll1Parser : rdParser;
  const [ast, syntaxErr] = parser(tokens);
  if (syntaxErr) {
    printErrors(code, [syntaxErr]);
    process.exit();
  }
  if (SHOW_AST) {
    printAST(ast);
    process.exit();
  }

  const semErrs = analyzer(ast);
  if (semErrs.length > 0) {
    printErrors(code, semErrs);
    process.exit();
  }

  console.log(GREEN + " ✓ Compile completed without error\n" + NOCOLOR);
});

//----------------------------------------------------------------------------------------------

function printErrors(code: string, errs: Error[]) {
  const lines = code.split("\n");
  const pad = errs.at(-1)!.line.toString().length;
  const errKind = errs[0].kind === "LexError" 
    ? "Lexical Error(s)" : errs[0].kind === "SyntaxError" 
    ? "Syntax Error(s)" 
    : "Semantic Error(s)";
  console.error(" ".repeat(pad) + BLUE + "--> " + RED + errKind);
  for (const err of errs) {
    console.error(" ".repeat(pad) + BLUE + " |");
    if (errKind === "Syntax Error(s)" && err.column <= 1 && err.line != 1) {
      console.error(BLUE + (err.line - 1).toString().padStart(pad) + " |  " + NOCOLOR + lines[err.line - 2]);
    }
    console.error(BLUE + err.line.toString().padStart(pad) + " |  " + NOCOLOR + lines[err.line - 1]);
    console.error(" ".repeat(pad) + BLUE + " | " + " ".repeat(err.column) + RED + "^  " + err.msg);
  }
  console.error("\n" + NOCOLOR);
}

function printAST(ast: AST) {
  const prefix: string[] = [];

  function printNode<T extends NodeKind>(node: Node<T> | Node<T>[], isLast: boolean, firstTimePrint = false) {
    if (!firstTimePrint) prefix.push(isLast ? "    " : "│   ");
    const items: ([string, Node<NodeKind> | string | number | null])[] = [];
    let alreadyInArr = false;
    if (Array.isArray(node)) {
      alreadyInArr = true;
      for (const item of node) items.push(["*", item]);
    } else {
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          if (key === "sibling" || key === "line" || key === "column") continue;
          items.push([key, node[key] as unknown as Node<NodeKind> | string | number | null])
        }
      }
    }
    for (const [idx, [key, value]] of items.entries()) {
      const isLast = idx === items.length-1 ? true : false;
      process.stdout.write(prefix.join('') + (isLast ? '└── ' : '├── ') + key);
      if (value === null || typeof value === "string" || typeof value === "number") {
        process.stdout.write(": " + (key === "kind" ? GREEN : MAGENTA) + value + NOCOLOR + "\n");
      } else {
        process.stdout.write("\n");
        let childrenIsArr = false;
        const arr = [];
        if (!alreadyInArr && mayHaveSibling(value)) {
          if (value.sibling) {
            childrenIsArr = true;
            let curr: typeof value | null = value;
            while(curr) {
              arr.push(curr);
              curr = curr.sibling;
            }
          }
        }
        if (childrenIsArr) printNode(arr, isLast);
        else printNode(value, isLast);
      }
    }
    prefix.pop();
  }

  function mayHaveSibling(node: Node<NodeKind>): node is (Node<"Identifier"> | Node<DeclarationKind> | Node<StmKind> | Node<ExpKind>) {
    return (<Node<"Identifier"> | Node<DeclarationKind> | Node<StmKind> | Node<ExpKind>>node).sibling !== undefined;
  }

  process.stdout.write("AST\n");
  printNode(ast, true, true);
}
