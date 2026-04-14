import type { PDADefinition } from "../types/pda.types";

export const samplePDA: PDADefinition = {
  inputAlphabet: ["0", "1"],
  stackAlphabet: ["X", "Z0"],
  startStackSymbol: "Z0",
  states: ["q0", "q1", "q2", "q3"],
  startState: "q0",
  acceptStates: ["q3"],
  transitions: [
    {
      id: "t1",
      from: "q0",
      to: "q1",
      input: null, // ε
      stackTop: "Z0",
      push: ["Z0"]
    },
    {
      id: "t2",
      from: "q1",
      to: "q1",
      input: "0",
      stackTop: "Z0",
      push: ["X", "Z0"] // Push X on Z0
    },
    {
      id: "t3",
      from: "q1",
      to: "q1",
      input: "0",
      stackTop: "X",
      push: ["X", "X"] // Push X on X
    },
    {
      id: "t4",
      from: "q1",
      to: "q2",
      input: "1",
      stackTop: "X",
      push: [] // Pop X
    },
    {
      id: "t5",
      from: "q2",
      to: "q2",
      input: "1",
      stackTop: "X",
      push: [] // Pop X
    },
    {
      id: "t_empty",
      from: "q1",
      to: "q3",
      input: null, // eps
      stackTop: "Z0",
      push: ["Z0"] // Empty string valid acceptance
    },
    {
      id: "t6",
      from: "q2",
      to: "q3",
      input: null, // eps
      stackTop: "Z0",
      push: ["Z0"] // Leave Z0, go to accept
    }
  ],
};
