import type { Symbo, T_Symbo, N_Symbo } from "./grammar";
import { grammar } from "./grammar";

function getPredictSets(): Map<number, Set<T_Symbo>> {
  
  const firstSets = new Map<N_Symbo, Set<T_Symbo>>();
  for (const rule of grammar.values()) {
    firstSets.set(rule.left, new Set<T_Symbo>());
  }

  function isTerminal(symbo: Symbo): symbo is T_Symbo {
    return firstSets.get(symbo as N_Symbo) === undefined;
  }

  function getFirstSetOfRight(symbos: Symbo[]): T_Symbo[] {
    if (symbos.length === 0) return ["EPSILON"];
    const symbo = symbos[0];

    // A -> aW' / A -> ε
    if (isTerminal(symbo)) return [symbo];
    
    // A -> BW'
    const FiB = firstSets.get(symbo)!;
    if (!FiB.has("EPSILON")) { // Fi(B)
      return [...FiB];
    } else { // (Fi(B) - {ε}) U Fi(W')
      symbos.shift();
      return [
        ...([...FiB].filter(s => s !== "EPSILON")),
        ...(getFirstSetOfRight(symbos))
      ];
    }
  }

  /* get first sets */

  let isFiConverge = false;
  while (!isFiConverge) {
    isFiConverge = true;
    for (const rule of grammar.values()) {
      // let's say rule is A -> W
      const FiA = firstSets.get(rule.left)!;
      const FiW = getFirstSetOfRight([...rule.right]);

      for (const symbo of FiW) {
        if (!FiA.has(symbo)) {
          FiA.add(symbo);
          isFiConverge = false;
        }
      }
    }
  }

  /* get follow sets */

  const followSets = new Map<N_Symbo, Set<T_Symbo>>();
  for (const rule of grammar.values()) {
    followSets.set(rule.left, new Set<T_Symbo>());
  }
  followSets.get("Program")!.add("EOI");

  let isFoConverge = false;
  while (!isFoConverge) {
    isFoConverge = true;
    for (const rule of grammar.values()) {
      // let's say rule is B -> xAw
      const FoB = followSets.get(rule.left)!;
      const symbos = rule.right;
      let index = 0;
      while (true) {
        while (index < symbos.length && isTerminal(symbos[index])) {
          index++;
        }
        if (index === symbos.length) break;
        const FoA = followSets.get(symbos[index] as N_Symbo)!;
        const FiW = getFirstSetOfRight(symbos.slice(index + 1));
        if (index === symbos.length - 1 || FiW.find(s => s === "EPSILON")) {
          // if there is nothing after A or ε is in Fi(w), we add Fo(B) to Fo(A)
          for (const symbo of FoB) {
            if (!FoA.has(symbo)) {
              FoA.add(symbo);
              isFoConverge = false;
            }
          }
        }
        for (const symbo of FiW.filter(s => s !== "EPSILON")) {
          // add every terminal in Fi(w) to Fo(A)
          if (!FoA.has(symbo)) {
            FoA.add(symbo);
            isFoConverge = false;
          }
        }
        index++;
      }

    }
  }

  /* get predict sets */

  const predictSets = new Map<number, Set<T_Symbo>>();
  for (const ruleIdx of grammar.keys()) {
    predictSets.set(ruleIdx, new Set<T_Symbo>());
  }

  for (const [ruleIdx, rule] of grammar) {
    // let's say rule is A -> B
    const set = predictSets.get(ruleIdx)!;
    const FiB = getFirstSetOfRight([...rule.right]);
    if (FiB.find(s => s === "EPSILON")) {
      // ε is in Fi(B), predict set is (Fi(B) - {ε}) U Fo(A)
      for (const symbo of FiB.filter(s => s !== "EPSILON")) set.add(symbo);
      for (const symbo of followSets.get(rule.left)!) set.add(symbo);
    } else {
      // ε not in Fi(B), predict set is Fi(B)
      for (const symbo of FiB) set.add(symbo);
    }
  }

  return predictSets;
}

function getPredictTable(): Map<N_Symbo, Map<T_Symbo, number>> {
  const predictSets = getPredictSets();
  const predictTable = new Map<N_Symbo, Map<T_Symbo, number>>();
  for (const [ruleIdx, symbos] of predictSets) {
    const rule = grammar.get(ruleIdx)!;
    const row = predictTable.get(rule.left) || new Map<T_Symbo, number>();
    for (const symbo of symbos) {
      row.set(symbo, ruleIdx);
    }
    // TODO: handle with syntax errors, should be in table
    predictTable.set(rule.left, row);
  }
  return predictTable;  
}

export {
  getPredictSets,
  getPredictTable,
}
