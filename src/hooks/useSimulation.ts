import { useState, useEffect, useCallback, useRef } from "react";
import type { PDADefinition, SimulationState } from "../types/pda.types";
import { stepPDA } from "../logic/pdaEngine";

export function useSimulation(pdaDef: PDADefinition, initialInput: string) {
  const getInitialState = (input: string): SimulationState => ({
    currentState: pdaDef.startState,
    stack: ["Z0"], // Base starting stack 
    input,
    index: 0,
    status: "running",
  });

  const [state, setState] = useState<SimulationState>(getInitialState(initialInput));
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);

  const stateRef = useRef(state);
  stateRef.current = state;

  const step = useCallback(() => {
    setState((prev) => stepPDA(prev, pdaDef));
  }, [pdaDef]);

  const reset = useCallback((newInput?: string) => {
    setIsAutoRunning(false);
    setState(getInitialState(newInput !== undefined ? newInput : stateRef.current.input));
  }, []);

  const changeInput = useCallback((newInput: string) => {
    setIsAutoRunning(false);
    setState(getInitialState(newInput));
  }, []);

  useEffect(() => {
    if (!isAutoRunning) return;

    if (stateRef.current.status !== "running") {
      setIsAutoRunning(false);
      return;
    }

    const intervalId = setInterval(() => {
      // If status !== running, clear immediately to prevent any extra execution cycles
      if (stateRef.current.status !== "running") {
        setIsAutoRunning(false);
        clearInterval(intervalId);
        return;
      }
      step();
    }, speedMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAutoRunning, speedMs, step]);

  return {
    state,
    step,
    reset,
    changeInput,
    isAutoRunning,
    setIsAutoRunning,
    speedMs,
    setSpeedMs
  };
}
