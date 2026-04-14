import React from 'react';

export const ComparisonTab: React.FC = () => {
  return (
    <div className="layout-grid comparison-tab" style={{ width: "100%" }}>
      <div className="layout-left card">
        <h2 style={{ background: "linear-gradient(135deg, #34d399, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Empirical Automaton (PDA)
        </h2>
        <div className="status-grid">
           <p style={{ color: "var(--text-secondary)" }}>
             The empirical Pushdown Automaton evaluates discrete string configurations deterministically checking mathematical membership by manipulating symbols structurally against memory limits.
           </p>
           
           <div className="last-transition" style={{ borderLeftColor: "var(--success)"}}>
             <span className="label">Evaluation Scope</span>
             <p>1. Simulates finite state limits explicitly step-by-step.</p>
             <p>2. Confirms exact string configurations mapped natively.</p>
             <p>3. Fundamentally limited bounding memory stacks linearly preventing infinite context parsing (e.g. <code>a^n b^n c^n</code>).</p>
           </div>
        </div>
      </div>

      <div className="layout-right card">
        <h2 style={{ background: "linear-gradient(135deg, #f87171, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Theoretical Pumping Lemma
        </h2>
        <div className="status-grid">
           <p style={{ color: "var(--text-secondary)" }}>
             The Pumping Lemma theoretically proves absolute mechanical limitations guaranteeing that ANY abstract generalized automaton constrained natively breaks pattern recognition eventually regardless of physical memory implementation.
           </p>
           
           <div className="last-transition" style={{ borderLeftColor: "var(--danger)"}}>
             <span className="label">Proof Mechanics</span>
             <p>1. Enforces structural repetition mathematically (pigeonhole principle).</p>
             <p>2. Demonstrates inevitable sequence boundary/integrity violation.</p>
             <p>3. Explicitly guarantees NO automaton can exist parsing contradictions natively independent of structural simulation implementations.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
