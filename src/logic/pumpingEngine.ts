export type LanguagePattern = "0*1*" | "0^n1^n" | "0^n1^n2^n";

export interface PumpingResult {
  pumpedString: string;
  isContradiction: boolean;
  proofExplanation: string;
}

export const generateString = (pattern: LanguagePattern, p: number) => {
  if (pattern === "0*1*" || pattern === "0^n1^n") return "0".repeat(p) + "1".repeat(p);
  return "0".repeat(p) + "1".repeat(p) + "2".repeat(p);
};

export const evaluateRegular = (
  x: string, 
  y: string, 
  z: string, 
  i: number, 
  pattern: LanguagePattern
): PumpingResult => {
  const pumpedString = x + y.repeat(i) + z;
  let isContradiction = false;
  let proofExplanation = "";

  if (pattern === "0*1*") {
    if (/10/.test(pumpedString)) {
      isContradiction = true;
      proofExplanation = "Contradiction: Pumping created 1s before 0s, violating 0*1*.";
    } else {
      isContradiction = false;
      proofExplanation = "No contradiction: String format 0*1* maintained perfectly. Validates that this language cleanly passes Regular constraints.";
    }
  } else if (pattern === "0^n1^n") {
    const zeros = (pumpedString.match(/0/g) || []).length;
    const ones = (pumpedString.match(/1/g) || []).length;

    if (/10/.test(pumpedString)) {
      isContradiction = true;
      proofExplanation = "Contradiction: Pumping crossed boundaries (1s before 0s). Sequence order corrupted.";
    } else if (zeros !== ones) {
      isContradiction = true;
      proofExplanation = `Contradiction: Mathematical invariant broken. Ratios (0s: ${zeros}, 1s: ${ones}) diverged natively proving non-Regularity.`;
    } else {
      isContradiction = false;
      proofExplanation = `No contradiction for iteration i=${i}. (Math holds momentarily).`;
    }
  }

  return { pumpedString, isContradiction, proofExplanation };
};

export const evaluateCFL = (
  u: string, 
  v: string, 
  w: string, 
  x: string, 
  y: string, 
  i: number, 
  pattern: LanguagePattern
): PumpingResult => {
  const pumpedString = u + v.repeat(i) + w + x.repeat(i) + y;
  let isContradiction = false;
  let proofExplanation = "";

  if (pattern === "0^n1^n2^n") {
    const zeros = (pumpedString.match(/0/g) || []).length;
    const ones = (pumpedString.match(/1/g) || []).length;
    const twos = (pumpedString.match(/2/g) || []).length;
    
    if (/10|20|21/.test(pumpedString)) {
      isContradiction = true;
      proofExplanation = "Contradiction: Topological sequence violation. Symbols overlapped boundaries.";
    } else if (!(zeros === ones && ones === twos)) {
      isContradiction = true;
      proofExplanation = `Contradiction: Multi-invariant inequality (0s: ${zeros}, 1s: ${ones}, 2s: ${twos}). A Pushdown Automaton cannot track 3 ratios simultaneously. Proves non-CFL.`;
    } else {
      isContradiction = false;
      proofExplanation = `No contradiction for iteration i=${i}. Structure holds momentarily.`;
    }
  }

  return { pumpedString, isContradiction, proofExplanation };
};
