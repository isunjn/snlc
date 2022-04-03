import lexer from "../src/lexer";

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
    return;
  }

  const [tokens, errors] = lexer(data);

  if (tokens.length > 0) {
    console.log("---------------------> Tokens:");
    for (const token of tokens) {
      console.log(token.toString());
    }
    console.log("<---------------------\n");
  }

  if (errors.length > 0) {
    console.log("---------------------> LexErrors:");
    for (const error of errors) {
      console.log(error.toString());
    }
    console.log("<---------------------");
  }
});
