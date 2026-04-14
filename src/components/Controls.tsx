import React from "react";

interface ControlsProps {
  status: "running" | "accepted" | "rejected";
  isAutoRunning: boolean;
  setIsAutoRunning: (val: boolean) => void;
  step: () => void;
  reset: () => void;
  speedMs: number;
  setSpeedMs: (val: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  status,
  isAutoRunning,
  setIsAutoRunning,
  step,
  reset,
  speedMs,
  setSpeedMs,
}) => {
  const isFinished = status !== "running";

  return (
    <div className="card controls-panel anim-entry-up">
      <header>
        <h2>Simulation Controls</h2>
      </header>
      <div className="layout-v-stack">
        <div className="btn-group">
          <button 
            onClick={step} 
            disabled={isFinished || isAutoRunning}
            className="btn primary"
            title="Execute individual transition"
          >
            Step Machine
          </button>
          <button 
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            disabled={isFinished}
            className={`btn ${isAutoRunning ? "danger" : "secondary"}`}
          >
            {isAutoRunning ? "Stop Execution" : "Auto Run Loop"}
          </button>
          <button onClick={reset} className="btn outline">
            Reset Machine
          </button>
        </div>

        <div className="slider-group">
          <label>
            Execution Speed ({speedMs}ms interval)
          </label>
          <input 
            type="range" 
            min="200" 
            max="1500" 
            step="100" 
            value={speedMs} 
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            disabled={isAutoRunning}
          />
        </div>
      </div>
    </div>
  );
};
