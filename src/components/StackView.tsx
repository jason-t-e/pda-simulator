import React from "react";

interface StackViewProps {
  stack: string[];
}

export const StackView: React.FC<StackViewProps> = ({ stack }) => {
  return (
    <div className="card stack-panel">
      <h2>Stack</h2>
      <div className="stack-container">
        {stack.length === 0 ? (
          <div className="stack-empty">Empty</div>
        ) : (
          stack.map((symbol, i) => (
            <div 
              key={`${i}-${symbol}`} 
              className={`stack-symbol ${i === 0 ? "stack-top" : ""}`}
            >
              {symbol.replace("Z0", "Z₀")}
              {i === 0 && <span className="top-indicator">← Top</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
