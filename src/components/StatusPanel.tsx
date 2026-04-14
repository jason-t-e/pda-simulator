import React from "react";
import type { SimulationState, PDADefinition } from "../types/pda.types";

interface StatusPanelProps {
  state: SimulationState;
  pdaDef: PDADefinition;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ state, pdaDef }) => {
  const lastTransition = state.lastTransitionId 
    ? pdaDef.transitions.find(t => t.id === state.lastTransitionId)
    : null;

  return (
    <div className="card status-panel anim-entry-up">
      <header>
        <h2>Simulation Status</h2>
      </header>
      <div className="status-grid">
        <div className="status-item">
          <span className="label">Simulation Status</span>
          <span className={`badge ${state.status}`}>
            {state.status.toUpperCase()}
          </span>
        </div>
        
        <div className="status-item">
          <span className="label">Current State</span>
          <div className="center-content" style={{ justifyContent: 'flex-start', gap: '0.8rem' }}>
            <span className="state-id">{state.currentState}</span>
            {pdaDef.acceptStates.includes(state.currentState) && (
               <span className="badge tag-accept">Accept State</span>
            )}
          </div>
        </div>

        <div className="status-item last-transition">
          <span className="label">Last Transition Executed</span>
          {lastTransition ? (
            <div className="transition-detail">
              <code>
                δ({lastTransition.from}, {lastTransition.input || "ε"}, {(lastTransition.stackTop || "ε").replace("Z0", "Z₀")}) 
                → ({lastTransition.to}, {lastTransition.push.length > 0 ? lastTransition.push.join("").replace(/Z0/g, "Z₀") : "ε"})
              </code>
              <div className="transition-id">Reference: {lastTransition.id}</div>
            </div>
          ) : (
            <span className="value dim">None (Initial Configuration)</span>
          )}
        </div>
        
        <div className="status-item">
          <span className="label">Input Tape Position</span>
          <span className="value">Character Index {state.index}</span>
        </div>
      </div>
    </div>
  );
};
