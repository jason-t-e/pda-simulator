import React, { useState } from "react";
import { useSimulation } from "./hooks/useSimulation";
import { samplePDA } from "./data/samplePDA";
import { Controls } from "./components/Controls";
import { StackView } from "./components/StackView";
import { InputTape } from "./components/InputTape";
import { StatusPanel } from "./components/StatusPanel";
import { StateDiagram } from "./components/StateDiagram";
import { PumpingLemmaTab } from "./components/Pumping/PumpingLemmaTab";
import { Container, LayoutStack } from "./components/ui/Layout";
import { AnimatedEntry } from "./components/ui/AnimatedEntry";
import { ThemeToggle } from "./components/ui/ThemeToggle";

function App() {
  const [activeTab, setActiveTab] = useState<"Simulation" | "Pumping">("Simulation");
  const [inputString, setInputString] = useState("0011");
  const {
    state,
    step,
    reset,
    changeInput,
    isAutoRunning,
    setIsAutoRunning,
    speedMs,
    setSpeedMs
  } = useSimulation(samplePDA, "0011");

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changeInput(inputString);
  };

  return (
    <Container as="main" variant="lg" className="app-container">
      <header className="app-header">
        <LayoutStack direction="h" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h1>Pushdown Automata Simulator</h1>
            <p>Advanced Logic Exploration and Computation Constraints</p>
          </div>
          <ThemeToggle />
        </LayoutStack>
      </header>

      <LayoutStack as="nav" center direction="h" gap="md" style={{ marginBottom: "3rem" }}>
        <button 
          className={`btn ${activeTab === "Simulation" ? "primary" : "outline"}`} 
          onClick={() => setActiveTab("Simulation")}
        >
          Automaton Simulation
        </button>
        <button 
          className={`btn ${activeTab === "Pumping" ? "primary" : "outline"}`} 
          onClick={() => setActiveTab("Pumping")}
        >
          Integrated Pumping Lemma
        </button>
      </LayoutStack>

      {activeTab === "Simulation" && (
        <AnimatedEntry variant="scale-in">
          <div className="input-config">
            <form onSubmit={handleInputSubmit}>
              <label>Test Input String: </label>
              <input 
                type="text" 
                value={inputString} 
                onChange={(e) => setInputString(e.target.value)} 
                disabled={isAutoRunning}
                placeholder="e.g. 000111"
              />
              <button type="submit" disabled={isAutoRunning} className="btn primary small">
                Load String
              </button>
            </form>
          </div>

          <main className="layout-grid">
            <div className="layout-left">
              <InputTape input={state.input} index={state.index} />
              <StateDiagram 
                states={samplePDA.states} 
                currentState={state.currentState} 
                acceptStates={samplePDA.acceptStates} 
                transitions={samplePDA.transitions}
                activeTransitionId={state.lastTransitionId}
              />
              <StatusPanel state={state} pdaDef={samplePDA} />
            </div>
            <div className="layout-right">
              <Controls 
                status={state.status}
                isAutoRunning={isAutoRunning}
                setIsAutoRunning={setIsAutoRunning}
                step={step}
                reset={() => reset()}
                speedMs={speedMs}
                setSpeedMs={setSpeedMs}
              />
              <StackView stack={state.stack} />
            </div>
          </main>
        </AnimatedEntry>
      )}

      {activeTab === "Pumping" && (
        <AnimatedEntry variant="fade-up">
          <PumpingLemmaTab />
        </AnimatedEntry>
      )}
    </Container>
  );
}

export default App;
