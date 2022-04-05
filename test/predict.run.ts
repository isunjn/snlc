import { getPredictSets, getPredictTable } from "../src/common/predict";

const sets = getPredictSets();

console.log("-------------------> Predict Sets:");

for (const [idx, set] of sets) {
  console.log(idx, [...set]);
}

const table = getPredictTable();

console.log("-------------------> Predict Table:");

for (const [nonTerminal, row] of table) {
  console.log("> ", nonTerminal);
  for (const [terminal, symbo] of row) {
    console.log("  \t", terminal, symbo);
  }
}