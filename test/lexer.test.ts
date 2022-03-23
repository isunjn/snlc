import lexer from "../src/lexer";
import { sample } from "./sample";

const [tokens, errors] = lexer(sample);

console.log("Tokens :\n-------------------------");
if (tokens.length === 0) {
  console.log("No Tokens");
} else {
  for (const token of tokens) {
    console.log(token.toString());
  }
}

console.log('\n');

console.log("LexErrors:\n--------------------------");
if (errors.length === 0) {
  console.log("No Lexer Errors");
} else {
  for (const error of errors) {
    console.log(error.toString());
  }
}
