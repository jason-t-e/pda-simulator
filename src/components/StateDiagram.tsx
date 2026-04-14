import React, { useState, useRef, useMemo } from "react";
import type { Transition } from "../types/pda.types";

interface StateDiagramProps {
  states: string[];
  currentState: string;
  acceptStates: string[];
  transitions: Transition[];
  activeTransitionId?: string;
}

interface Point {
  x: number;
  y: number;
}

export const StateDiagram: React.FC<StateDiagramProps> = ({ 
  states, currentState, acceptStates, transitions, activeTransitionId 
}) => {
  const nodeRadius = 30;
  const spacing = 160;

  const svgRef = useRef<SVGSVGElement>(null);

  // Initialized dynamically and preserved
  const [nodePositions, setNodePositions] = useState<Record<string, Point>>(() => {
    const posMap: Record<string, Point> = {};
    states.forEach((stateStr, idx) => {
      posMap[stateStr] = {
        x: (idx * spacing) + (spacing / 2) + 50,
        y: 160 
      };
    });
    return posMap;
  });

  // Track dragging state collectively minimizing segmented re-renders
  const [dragState, setDragState] = useState<{
    target: string | null;
    isDragging: boolean;
    offsetOrigin: Point;
    pointerStart: Point;
  }>({
    target: null,
    isDragging: false,
    offsetOrigin: { x: 0, y: 0 },
    pointerStart: { x: 0, y: 0 }
  });

  // Memoize stable variables bypassing frame-by-frame drag calculations
  const viewBoxWidth = useMemo(() => Math.max(500, states.length * spacing + 100), [states.length]);

  const processedTransitions = useMemo(() => {
    const edgeGroups: Record<string, number> = {};
    return transitions.map((t) => {
      const key = `${t.from}->${t.to}`;
      const orderIndex = edgeGroups[key] || 0;
      edgeGroups[key] = orderIndex + 1;
      return { ...t, orderIndex };
    });
  }, [transitions]);

  // Handle Event logic explicitly mapped against threshold variables preventing click-lag 
  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, stateLabel: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    
    if (!svgRef.current) return;
    
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const nodePos = nodePositions[stateLabel];
    if (nodePos) {
      setDragState({
        target: stateLabel,
        isDragging: false, // Wait for threshold boundary
        offsetOrigin: { x: svgP.x - nodePos.x, y: svgP.y - nodePos.y },
        pointerStart: { x: e.clientX, y: e.clientY }
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement | SVGGElement>) => {
    if (!dragState.target || !svgRef.current) return;
    
    // UX Limit Threshold logic: Avoid interpreting fast clicks as dragging events 
    let draggingNow = dragState.isDragging;
    if (!draggingNow) {
      const dist = Math.hypot(e.clientX - dragState.pointerStart.x, e.clientY - dragState.pointerStart.y);
      if (dist > 5) {
        draggingNow = true;
        setDragState(prev => ({ ...prev, isDragging: true }));
      } else {
        return; 
      }
    }
    
    // Position Coordinate processing mapping constraints intelligently 
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    const rawX = svgP.x - dragState.offsetOrigin.x;
    const rawY = svgP.y - dragState.offsetOrigin.y;

    // Boundary constraints explicitly restrict SVG object leaving canvas visible range
    const clampX = Math.max(nodeRadius, Math.min(viewBoxWidth - nodeRadius, rawX));
    const clampY = Math.max(nodeRadius, Math.min(320 - nodeRadius, rawY));

    setNodePositions(prev => ({
      ...prev,
      [dragState.target!]: { x: clampX, y: clampY }
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    if (dragState.target) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragState({ target: null, isDragging: false, offsetOrigin: { x: 0, y: 0 }, pointerStart: { x: 0, y: 0 } });
    }
  };

  const getBoundaryPoint = (center: Point, target: Point, radius: number): Point => {
    const dx = target.x - center.x;
    const dy = target.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: center.x, y: center.y - radius };
    return {
      x: center.x + (dx / dist) * radius,
      y: center.y + (dy / dist) * radius
    };
  };

  // Re-Order nodes pushing strictly actively hovered elements to Foreground avoiding path intersections 
  const renderedStatesLayer = [...states].sort((a, b) => {
    if (a === dragState.target && dragState.isDragging) return 1;
    if (b === dragState.target && dragState.isDragging) return -1;
    return 0;
  });

  return (
    <div className="card state-diagram-panel" style={{ width: "100%" }}>
      <h2>State Machine Visualization</h2>
      <div className="diagram-container" style={{ textAlign: "center", padding: "1rem 0" }}>
        <svg 
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} 320`} 
          width="100%" 
          style={{ maxHeight: "350px", overflow: "visible", touchAction: "none" }}
          onPointerMove={dragState.target ? handlePointerMove : undefined}
        >
          <defs>
            <marker id="arrowhead-normal" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrowhead-active" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="10" markerHeight="10" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-color)" />
            </marker>
          </defs>

          <g className="view-control-layer">
            {/* BACKGROUND RENDERING LAYER: Edges */}
            {processedTransitions.map((t) => {
              const startPos = nodePositions[t.from] || { x: 0, y: 0 };
              const endPos = nodePositions[t.to] || { x: 0, y: 0 };
              const isSelf = t.from === t.to;
              const isActive = t.id === activeTransitionId;

              const stagger = t.orderIndex * 35; 

              let pathD = "";
              let labelX = 0;
              let labelY = 0;

              if (isSelf) {
                const loopHeight = 70 + stagger;
                const loopWidth = 40 + (t.orderIndex * 15);
                
                const angle = Math.PI / 6;
                const dx = nodeRadius * Math.sin(angle);
                const dy = nodeRadius * Math.cos(angle);
                
                const startBoundary = { x: startPos.x - dx, y: startPos.y - dy };
                const endBoundary = { x: startPos.x + dx, y: startPos.y - dy };
                
                const cp1 = { x: startPos.x - loopWidth, y: startPos.y - loopHeight - 30 };
                const cp2 = { x: startPos.x + loopWidth, y: startPos.y - loopHeight - 30 };

                pathD = `M ${startBoundary.x} ${startBoundary.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endBoundary.x} ${endBoundary.y}`;
                labelX = startPos.x;
                labelY = startPos.y - loopHeight - 15;
              } else {
                const dist = endPos.x - startPos.x;
                const dir = Math.sign(dist) || 1; 
                const curveHeight = 80 + stagger;
                
                const bendY = dir > 0 ? startPos.y - curveHeight : startPos.y + curveHeight;
                const control = { x: startPos.x + dist/2, y: bendY };
                
                const startBoundary = getBoundaryPoint(startPos, control, nodeRadius);
                const endBoundary = getBoundaryPoint(endPos, control, nodeRadius);
                
                pathD = `M ${startBoundary.x} ${startBoundary.y} Q ${control.x} ${control.y} ${endBoundary.x} ${endBoundary.y}`;
                labelX = control.x;
                labelY = dir > 0 ? bendY - 12 : bendY + 20; 
              }

              const color = isActive ? "var(--accent-color)" : "var(--text-secondary)";
              const markerId = isActive ? "url(#arrowhead-active)" : "url(#arrowhead-normal)";

              const labelStr = `${t.input || "ε"}, ${t.stackTop || "ε"} → ${t.push.length ? t.push.join("") : "ε"}`;
              const rectWidth = labelStr.length * 7.5 + 8;
              
              const isMoving = dragState.isDragging && (dragState.target === t.from || dragState.target === t.to);

              return (
                <g key={t.id} opacity={isActive ? 1 : 0.4} style={{ transition: "opacity 0.2s" }}>
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth={isActive ? 3 : 1.5}
                    markerEnd={markerId}
                    style={{ transition: isMoving ? "none" : "stroke 0.3s ease, d 0.3s ease" }}
                  />
                  <rect 
                    x={labelX - (rectWidth / 2)} 
                    y={labelY - 10} 
                    width={rectWidth} 
                    height="16" 
                    fill="var(--bg-primary)" 
                    opacity="0.8" 
                    rx="4"
                  />
                  <text 
                    x={labelX} 
                    y={labelY + 2} 
                    fill={color} 
                    fontSize="12" 
                    textAnchor="middle" 
                    fontWeight={isActive ? "bold" : "normal"}
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents: "none" }}
                  >
                    {labelStr}
                  </text>
                </g>
              );
            })}

            {/* FOREGROUND RENDERING LAYER: Dynamic Nodes */}
            {renderedStatesLayer.map((stateLabel) => {
              const isCurrent = stateLabel === currentState;
              const isAccept = acceptStates.includes(stateLabel);
              const pos = nodePositions[stateLabel] || { x: 0, y: 0 };
              const isDraggingThis = dragState.target === stateLabel && dragState.isDragging;

              return (
                <g 
                  key={stateLabel} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onPointerDown={(e) => handlePointerDown(e, stateLabel)}
                  onPointerUp={handlePointerUp}
                  style={{ cursor: isDraggingThis ? "grabbing" : "grab" }}
                >
                  {/* Subtle hover drop shadow mimicking material elevation mechanics interactively */}
                  <circle 
                    r={nodeRadius} 
                    fill={isCurrent ? "var(--bg-secondary)" : "var(--bg-primary)"}
                    stroke={isCurrent ? "var(--accent-color)" : "var(--card-border)"}
                    strokeWidth={isCurrent ? 4 : 2}
                    style={{ 
                      transition: isDraggingThis ? "none" : "all 0.3s ease",
                      filter: isDraggingThis ? "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" : "none"
                    }}
                  />
                  {isAccept && (
                    <circle 
                      r={nodeRadius - 6} 
                      fill="none"
                      stroke={isCurrent ? "var(--accent-color)" : "var(--success)"}
                      strokeWidth={isCurrent ? 2 : 1.5}
                      style={{ transition: isDraggingThis ? "none" : "all 0.3s ease" }}
                      opacity={isCurrent ? 1 : 0.6}
                    />
                  )}
                  <text 
                    textAnchor="middle" 
                    dy=".3em" 
                    fill={isCurrent ? "var(--text-primary)" : "var(--text-secondary)"}
                    fontSize="15"
                    fontWeight={isCurrent ? "bold" : "normal"}
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {stateLabel}
                  </text>
                </g>
              );
            })}
            
          </g>
        </svg>
      </div>
    </div>
  );
};
