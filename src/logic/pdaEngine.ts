import type { PDADefinition, SimulationState } from "../types/pda.types";

export const createInitialState = (input: string, def: PDADefinition): SimulationState => ({
  currentState: def.startState,
  stack: [def.startStackSymbol],
  input,
  index: 0,
  status: "running"
});

const MAX_STEPS = 1000;

export const evaluatePDA = (def: PDADefinition, input: string): SimulationState => {
  let currentState: SimulationState = createInitialState(input, def);

  let stepCount = 0;
  while (currentState.status === "running") {
    if (stepCount >= MAX_STEPS) {
      return {
        ...currentState,
        status: "rejected",
        reason: `Simulation aborted: Exceeded maximum logical limit (${MAX_STEPS} steps). Possible infinite epsilon-loop detected.`
      };
    }
    currentState = stepPDA(currentState, def);
    stepCount++;
  }

  return currentState;
};

export function stepPDA(state: SimulationState, pdaDef: PDADefinition): SimulationState {
  // Prevent extra execution cycle if already finished
  if (state.status !== "running") return state;

  const isInputFullyConsumed = state.index >= state.input.length;
  const currentInput = !isInputFullyConsumed ? state.input[state.index] : null;
  // Use empty string to robustly denote empty stack or missing symbol
  const currentStackTop = state.stack.length > 0 ? state.stack[0] : "";

  // DETERMINISTIC APPROXIMATION: 
  // Simulator uses the first valid transition it encounters. 
  // It checks input transitions FIRST, then epsilon transitions SECOND.

  let validTransition = undefined;
  
  // 1. Explicitly check for exact input transition matches
  if (currentInput !== null) {
      const inputCandidates = pdaDef.transitions.filter(
        (t) =>
          t.from === state.currentState &&
          t.input === currentInput &&
          t.stackTop === currentStackTop // Explicit Stack Top Validation
      );
      if (inputCandidates.length > 0) {
        validTransition = inputCandidates[0];
      }
  }

  // 2. Explicitly check for epsilon transitions if no input transition was found
  if (!validTransition) {
    const epsilonCandidates = pdaDef.transitions.filter(
      (t) =>
        t.from === state.currentState &&
        t.input === null &&
        t.stackTop === currentStackTop // Explicit Stack Top Validation
    );
    if (epsilonCandidates.length > 0) {
      validTransition = epsilonCandidates[0];
    }
  }

  // 3. NO TRANSITION CASE: Explicit Acceptance Model (Final-State Acceptance)
  if (!validTransition) {
     const isAcceptState = pdaDef.acceptStates.includes(state.currentState);
     
     if (isInputFullyConsumed && isAcceptState) {
       return { ...state, status: "accepted" };
     }

     // Deduce granular rejection reason
     let reason = "no-transition";
     const potentialTransitions = pdaDef.transitions.filter(
       (t) => t.from === state.currentState && (t.input === currentInput || t.input === null)
     );

     if (potentialTransitions.length > 0) {
       reason = "stack-mismatch";
     } else if (!isInputFullyConsumed) {
       reason = "input-remaining";
     }
     
     return {
       ...state,
       status: "rejected",
       reason: reason,
     };
  }

  // --- TRANSITION APPLICATION ---
  const newStack = [...state.stack];
  
  // Pop stack top exactly matching transition requirements
  if (validTransition.stackTop !== "" && validTransition.stackTop !== null) {
     if (newStack.length === 0) {
        // Safe stack boundary checking
        return { ...state, status: "rejected" };
     }
     newStack.shift(); 
  }
  
  // Push new symbols onto stack (array layout forces start at index 0)
  // Ensure we push in the exact array order, the first element becomes the new top
  if (validTransition.push && validTransition.push.length > 0) {
    for (let i = validTransition.push.length - 1; i >= 0; i--) {
      newStack.unshift(validTransition.push[i]);
    }
  }

  // Epsilon transitions must NOT move input index
  const inputConsumed = validTransition.input !== null;
  const newIndex = inputConsumed ? state.index + 1 : state.index;

  return {
    ...state,
    currentState: validTransition.to,
    stack: newStack,
    index: newIndex,
    lastTransitionId: validTransition.id,
  };
}
