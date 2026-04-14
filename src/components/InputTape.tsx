import React from "react";

interface InputTapeProps {
  input: string;
  index: number;
}

export const InputTape: React.FC<InputTapeProps> = ({ input, index }) => {
  const characters = input.split("");

  return (
    <div className="card tape-panel">
      <h2>Input Tape</h2>
      {input.length === 0 ? (
        <div className="tape-empty">Empty Input (epsilon)</div>
      ) : (
        <div className="tape-container">
          {characters.map((char, i) => {
            let stateClass = "";
            if (i < index) stateClass = "consumed";
            else if (i === index) stateClass = "active";
            
            return (
              <div key={i} className={`tape-cell ${stateClass}`}>
                {char}
                {i === index && <div className="pointer">▲</div>}
              </div>
            );
          })}
          {index === input.length && (
           <div className="tape-cell active epsilon-end">
             ε
             <div className="pointer">▲</div>
           </div>
          )}
        </div>
      )}
    </div>
  );
};
