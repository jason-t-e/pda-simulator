# PDA Simulator

An interactive web-based simulator for Pushdown Automata (PDA) that visualizes state transitions, stack operations, and acceptance behavior in real time.

## Live Demo

[https://pda-simulator-35nsvvza7-jasonte24-6092s-projects.vercel.app](https://pda-simulator-35nsvvza7-jasonte24-6092s-projects.vercel.app)

## NPM Package (UI Framework)

[https://www.npmjs.com/package/pda-sim-ui-framework](https://www.npmjs.com/package/pda-sim-ui-framework)

## GitHub Repository

[https://github.com/jason-t-e/pda-simulator](https://github.com/jason-t-e/pda-simulator)

---

## Description

This simulator demonstrates how a Pushdown Automaton processes an input string step by step, showing transitions, stack updates, and final acceptance or rejection. It is designed to improve conceptual understanding through visualization.

---

## Features

- Step-by-step PDA execution
- Stack visualization
- Acceptance and rejection detection
- Pumping Lemma simulation
- Modular UI framework published as an npm package
- Reusable and structured design system

---

## Tech Stack

- React with TypeScript
- Vite
- Custom UI framework (`pda-sim-ui-framework`)
- Vercel for deployment

---

## Run Locally

```bash
npm install
npm run dev
```

---

## Using the UI Framework

```bash
npm install pda-sim-ui-framework
```

**Example usage:**

```tsx
import { ResultCard } from "pda-sim-ui-framework";
import "pda-sim-ui-framework/theme.css";

export default function App() {
  return (
    <ResultCard
      variant="success"
      slots={{
        title: "Simulation Conclusion",
        status: "ACCEPTED",
        reason: "Valid PDA computation"
      }}
    />
  );
}
```

---

## Purpose

This project was built to:

- Strengthen understanding of Theory of Computation concepts
- Provide a visual tool for learning PDA behavior
- Demonstrate system design from UI framework to deployment

---


## License

MIT
