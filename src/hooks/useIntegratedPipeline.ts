import { useState, useCallback, useEffect, useRef } from 'react';
import type { SimulationState } from '../types/pda.types';
import { samplePDA } from '../data/samplePDA'; // Central PDA mapping
import { stepPDA } from '../logic/pdaEngine';

export type PumpingPhase = 
  | 'idle' 
  | 'highlighting' 
  | 'duplicating' 
  | 'expanded' 
  | 'pda_run' 
  | 'evaluated';

interface PipelineState {
  phase: PumpingPhase;
  currentCopy: number; // Tracks sequential additions mapping to 'i'
  pdaState: SimulationState | null;
  pdaStepCount: number; // Prevent infinite epsilon loops dynamically
}

export function useIntegratedPipeline(
  i: number, 
  pumpedString: string,
  pattern: string
) {
  const [pipeline, setPipeline] = useState<PipelineState>({
    phase: 'idle',
    currentCopy: 0,
    pdaState: null,
    pdaStepCount: 0
  });

  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  
  const pipelineRef = useRef(pipeline);
  pipelineRef.current = pipeline;

  const reset = useCallback(() => {
    setIsAutoRunning(false);
    setPipeline({
      phase: 'idle',
      currentCopy: 0,
      pdaState: null,
      pdaStepCount: 0
    });
  }, []);

  const step = useCallback(() => {
    setPipeline(prev => {
      // 1. Idle -> Highlighting
      if (prev.phase === 'idle') {
        return { ...prev, phase: 'highlighting' };
      } 
      // 2. Highlighting -> Duplicating
      else if (prev.phase === 'highlighting') {
         if (i === 1) { return { ...prev, currentCopy: 1, phase: 'expanded' }; }
         if (i === 0) { return { ...prev, currentCopy: 0, phase: 'expanded' }; }
         return { ...prev, phase: 'duplicating', currentCopy: 1 };
      }
      // 3. Duplicating sequentially
      else if (prev.phase === 'duplicating') {
        if (prev.currentCopy < i - 1) {
          return { ...prev, currentCopy: prev.currentCopy + 1 };
        } else {
          return { ...prev, currentCopy: i, phase: 'expanded' };
        }
      }
      // 4. Expanded -> PDA
      else if (prev.phase === 'expanded') {
        if (pattern !== "0^n1^n") {
           return { 
               ...prev, 
               phase: 'evaluated', 
               pdaState: {
                   currentState: "",
                   stack: [],
                   input: "",
                   index: 0,
                   status: "rejected",
                   reason: "PDA Engine not configured for this specific context. PDA Execution Skipped."
               }
           };
        }
        
        const initPdaResult: SimulationState = {
            currentState: samplePDA.startState,
            stack: [samplePDA.startStackSymbol],
            input: pumpedString,
            index: 0,
            status: "running"
        };
        return { ...prev, phase: 'pda_run', pdaState: initPdaResult };
      }
      // 5. PDA Running iteratively
      else if (prev.phase === 'pda_run' && prev.pdaState) {
        if (prev.pdaState.status !== 'running') {
            return { ...prev, phase: 'evaluated' };
        }
        
        const MAX_STEPS = 1000;
        if (prev.pdaStepCount >= MAX_STEPS) {
            return { 
                ...prev, 
                pdaState: {
                   ...prev.pdaState,
                   status: 'rejected',
                   reason: `Simulation aborted: Exceeded maximum logical limit (${MAX_STEPS} steps). Possible infinite epsilon-loop.`
                },
                phase: 'evaluated' 
            };
        }

        const nextPdaState = stepPDA(prev.pdaState, samplePDA);
        
        // Eagerly transition to 'evaluated' if termination resolves natively on this absolute step securely 
        const nextPhase = nextPdaState.status !== 'running' ? 'evaluated' : 'pda_run';
        
        return { ...prev, phase: nextPhase, pdaState: nextPdaState, pdaStepCount: prev.pdaStepCount + 1 };
      }
      
      return prev;
    });
  }, [i, pumpedString, pattern]);

  useEffect(() => {
    if (!isAutoRunning) return;
    
    // Stop conditions mathematically avoiding infinite mapping
    if (pipelineRef.current.phase === 'evaluated' || (pipelineRef.current.phase === 'pda_run' && pipelineRef.current.pdaState?.status !== 'running')) {
        setIsAutoRunning(false);
        if (pipelineRef.current.phase === 'pda_run') {
           setPipeline(prev => ({ ...prev, phase: 'evaluated' }));
        }
        return;
    }

    const intervalId = setInterval(() => {
      if (pipelineRef.current.phase === 'evaluated') {
         setIsAutoRunning(false);
         clearInterval(intervalId);
         return;
      }
      step();
    }, speedMs);

    return () => clearInterval(intervalId);
  }, [isAutoRunning, speedMs, step]);

  return {
    pipeline,
    step,
    reset,
    isAutoRunning,
    setIsAutoRunning,
    speedMs,
    setSpeedMs
  };
}
