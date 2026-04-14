export interface Transition {
  id: string;
  from: string;
  to: string;
  input: string | null;
  stackTop: string;
  push: string[];
}

export interface PDADefinition {
  inputAlphabet: string[];
  stackAlphabet: string[];
  startStackSymbol: string;
  states: string[];
  startState: string;
  acceptStates: string[];
  transitions: Transition[];
}

export interface SimulationState {
  currentState: string;
  stack: string[];
  input: string;
  index: number;
  status: "running" | "accepted" | "rejected";
  lastTransitionId?: string;
  reason?: string;
}
