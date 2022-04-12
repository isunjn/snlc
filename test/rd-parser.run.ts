import lexer from "../src/lexer";
import parser from "../src/rd-parser";
import { printAST } from "../src/common/ast";

import fs from "fs";
import path from "path";

const fileName = process.argv[2];

if (!fileName) {
  console.error("Need a file name!");
  process.exit(1);
}

const f = path.format({ dir: "sample", name: fileName, ext: ".snl" });

fs.readFile(f, "utf-8", (err, data) => {
  if (err) {
    console.error("Error with reading file: ", err);
    process.exit(1);
  }

  const [tokens, lexerrs] = lexer(data);

  if (lexerrs.length > 0) {
    console.log("---------------------> LexErrors:");
    for (const error of lexerrs) {
      console.error(error.toString());
    }
    console.log("<---------------------");
    process.exit();
  }

  const [ast, syntaxerr] = parser(tokens);
  if (syntaxerr) {
    console.log("---------------------> SyntaxErrors:");
    console.error(syntaxerr.toString());
    console.log("<---------------------");
    process.exit();
  }

  printAST(ast);

});
