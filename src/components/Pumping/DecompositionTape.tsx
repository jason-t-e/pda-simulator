import React, { useRef, useState } from 'react';

export interface SplitRegular { xEnd: number; yEnd: number; }
export interface SplitCFL { uEnd: number; vEnd: number; wEnd: number; xEnd: number; }
export type PartitionMode = 'regular' | 'cfl';

interface DecompositionTapeProps {
  baseString: string;
  p: number;
  mode: PartitionMode;
  splitRegular?: SplitRegular;
  splitCFL?: SplitCFL;
  onChangeRegular?: (split: SplitRegular) => void;
  onChangeCFL?: (split: SplitCFL) => void;
}

export const DecompositionTape: React.FC<DecompositionTapeProps> = ({
  baseString, p, mode, splitRegular, splitCFL, onChangeRegular, onChangeCFL
}) => {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [draggingTarget, setDraggingTarget] = useState<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, target: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    setDraggingTarget(target);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingTarget) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingTarget(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingTarget || !tapeRef.current) return;
    
    // Matrix tracking localizing DOM node offsets directly into character boundaries
    const rect = tapeRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const cellWidth = rect.width / baseString.length;
    let newIndex = Math.round(rawX / cellWidth);
    
    newIndex = Math.max(0, Math.min(newIndex, baseString.length));
    
    if (mode === 'regular' && splitRegular && onChangeRegular) {
      const nextSplit = { ...splitRegular };
      
      if (draggingTarget === 'xEnd') {
        nextSplit.xEnd = Math.max(0, Math.min(newIndex, nextSplit.yEnd - 1)); 
      } else if (draggingTarget === 'yEnd') {
        nextSplit.yEnd = Math.max(nextSplit.xEnd + 1, Math.min(newIndex, p)); 
      }
      
      if (nextSplit.xEnd !== splitRegular.xEnd || nextSplit.yEnd !== splitRegular.yEnd) {
        onChangeRegular(nextSplit);
      }
      
    } else if (mode === 'cfl' && splitCFL && onChangeCFL) {
      const nextSplit = { ...splitCFL };
      
      if (draggingTarget === 'uEnd') {
        const minU = Math.max(0, nextSplit.xEnd - p);
        nextSplit.uEnd = Math.max(minU, Math.min(newIndex, nextSplit.vEnd));
      } else if (draggingTarget === 'vEnd') {
        const minV = (nextSplit.xEnd === nextSplit.wEnd) ? nextSplit.uEnd + 1 : nextSplit.uEnd;
        nextSplit.vEnd = Math.max(minV, Math.min(newIndex, nextSplit.wEnd));
      } else if (draggingTarget === 'wEnd') {
        const maxW = (nextSplit.vEnd === nextSplit.uEnd) ? nextSplit.xEnd - 1 : nextSplit.xEnd;
        nextSplit.wEnd = Math.max(nextSplit.vEnd, Math.min(newIndex, maxW));
      } else if (draggingTarget === 'xEnd') {
        const minX = (nextSplit.vEnd === nextSplit.uEnd) ? nextSplit.wEnd + 1 : nextSplit.wEnd;
        const maxX = Math.min(baseString.length, nextSplit.uEnd + p);
        nextSplit.xEnd = Math.max(minX, Math.min(newIndex, maxX));
      }
      
      if (nextSplit.uEnd !== splitCFL.uEnd || nextSplit.vEnd !== splitCFL.vEnd || nextSplit.wEnd !== splitCFL.wEnd || nextSplit.xEnd !== splitCFL.xEnd) {
        onChangeCFL(nextSplit);
      }
    }
  };

  const renderRegularBackgrounds = () => {
    if (!splitRegular) return null;
    const { xEnd, yEnd } = splitRegular;
    return (
      <>
        <div style={{ position: 'absolute', left: 0, width: `${(xEnd / baseString.length) * 100}%`, height: '100%', background: 'rgba(59, 130, 246, 0.15)', borderBottom: "3px solid #3b82f6" }}></div>
        <div style={{ position: 'absolute', left: `${(xEnd / baseString.length) * 100}%`, width: `${((yEnd - xEnd) / baseString.length) * 100}%`, height: '100%', background: 'rgba(16, 185, 129, 0.25)', borderBottom: "3px solid #10b981" }}></div>
        <div style={{ position: 'absolute', left: `${(yEnd / baseString.length) * 100}%`, right: 0, height: '100%', background: 'rgba(148, 163, 184, 0.1)', borderBottom: "3px solid #94a3b8" }}></div>
      </>
    );
  };

  const renderCFLBackgrounds = () => {
    if (!splitCFL) return null;
    const { uEnd, vEnd, wEnd, xEnd } = splitCFL;
    return (
      <>
        <div style={{ position: 'absolute', left: 0, width: `${(uEnd / baseString.length) * 100}%`, height: '100%', background: 'rgba(148, 163, 184, 0.1)' }}></div>
        <div style={{ position: 'absolute', left: `${(uEnd / baseString.length) * 100}%`, width: `${((vEnd - uEnd) / baseString.length) * 100}%`, height: '100%', background: 'rgba(16, 185, 129, 0.25)', borderBottom: "3px solid #10b981" }}></div>
        <div style={{ position: 'absolute', left: `${(vEnd / baseString.length) * 100}%`, width: `${((wEnd - vEnd) / baseString.length) * 100}%`, height: '100%', background: 'rgba(59, 130, 246, 0.15)', borderBottom: "3px solid #3b82f6" }}></div>
        <div style={{ position: 'absolute', left: `${(wEnd / baseString.length) * 100}%`, width: `${((xEnd - wEnd) / baseString.length) * 100}%`, height: '100%', background: 'rgba(16, 185, 129, 0.25)', borderBottom: "3px solid #10b981" }}></div>
        <div style={{ position: 'absolute', left: `${(xEnd / baseString.length) * 100}%`, right: 0, height: '100%', background: 'rgba(148, 163, 184, 0.1)' }}></div>
      </>
    );
  };

  const renderDragHandle = (index: number, id: string, label: string) => {
    const leftPercent = (index / baseString.length) * 100;
    const isDragging = draggingTarget === id;
    return (
      <div
        className="drag-handle"
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: -15,
          bottom: -15,
          width: 24, // generous hit area
          transform: isDragging ? 'translateX(-50%) scale(1.15)' : 'translateX(-50%)',
          cursor: isDragging ? 'grabbing' : 'ew-resize',
          zIndex: isDragging ? 20 : 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 0.15s ease-out'
        }}
        onPointerDown={(e) => handlePointerDown(e, id)}
        onPointerUp={handlePointerUp}
      >
        <div style={{ 
          background: isDragging ? "var(--accent-color)" : "var(--card-bg)", 
          color: isDragging ? "#fff" : "var(--text-secondary)", 
          fontSize: "0.7rem", 
          fontWeight: "bold", 
          padding: "2px 8px", 
          borderRadius: "4px", 
          marginBottom: "2px",
          border: "1px solid var(--card-border)",
          boxShadow: isDragging ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "none"
        }}>{label}</div>
        <div style={{ 
          width: 4, 
          height: '100%', 
          background: isDragging ? "var(--accent-color)" : "var(--card-border)", 
          borderRadius: 2, 
          boxShadow: isDragging ? "0 0 10px var(--accent-color)" : "none" 
        }}></div>
      </div>
    );
  };

  return (
    <div className="decomposition-tape" style={{ margin: "2rem 0", position: "relative" }}>
       
       <div style={{ marginBottom: "1.5rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
         Physical Boundary Constraints: {mode === 'regular' ? "|xy| ≤ p, |y| ≥ 1" : "|vwx| ≤ p, |vx| ≥ 1"}
       </div>

       {/* Track Context Boundary P constraint specifically visually */}
       <div style={{ position: "absolute", left: 0, width: `${(p / baseString.length) * 100}%`, top: -35, borderTop: "2px dashed var(--danger)", borderRight: "2px dashed var(--danger)", height: "30px" }}>
          <div style={{ position: "absolute", top: -20, right: -5, color: "var(--danger)", fontSize: "0.8rem", fontWeight: "bold" }}>p limit</div>
       </div>

       <div 
         ref={tapeRef}
         onPointerMove={handlePointerMove}
         style={{ display: "flex", width: "100%", height: "60px", background: "var(--card-bg)", position: "relative", borderRadius: "6px", overflow: "visible" }}
       >
          {mode === 'regular' ? renderRegularBackgrounds() : renderCFLBackgrounds()}

          {baseString.split('').map((char, i) => (
             <div key={i} style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.5rem", fontFamily: "monospace", zIndex: 5, pointerEvents: "none" }}>
               {char}
             </div>
          ))}

          {/* Interactive Drag Handles rendering strictly bound layers securely parsing DOM variables */}
          {mode === 'regular' && splitRegular && (
            <>
              {renderDragHandle(splitRegular.xEnd, 'xEnd', 'x / y')}
              {renderDragHandle(splitRegular.yEnd, 'yEnd', 'y / z')}
            </>
          )}

          {mode === 'cfl' && splitCFL && (
            <>
              {renderDragHandle(splitCFL.uEnd, 'uEnd', 'u / v')}
              {renderDragHandle(splitCFL.vEnd, 'vEnd', 'v / w')}
              {renderDragHandle(splitCFL.wEnd, 'wEnd', 'w / x')}
              {renderDragHandle(splitCFL.xEnd, 'xEnd', 'x / y')}
            </>
          )}

       </div>

       <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "center" }}>
          {mode === 'regular' && splitRegular && (
             <>
               <span className="badge" style={{ background: "transparent", borderBottom: "3px solid #3b82f6" }}>|x| = {splitRegular.xEnd}</span>
               <span className="badge" style={{ background: "transparent", borderBottom: "3px solid #10b981" }}>|y| = {splitRegular.yEnd - splitRegular.xEnd}</span>
               <span className="badge" style={{ background: "transparent", borderBottom: "3px solid #94a3b8" }}>|z| = {baseString.length - splitRegular.yEnd}</span>
             </>
          )}
          {mode === 'cfl' && splitCFL && (
             <>
               <span className="badge" style={{ background: "transparent" }}>|u| = {splitCFL.uEnd}</span>
               <span className="badge" style={{ background: "transparent", borderBottom: "3px solid #10b981" }}>|v| = {splitCFL.vEnd - splitCFL.uEnd}</span>
               <span className="badge" style={{ background: "transparent", borderBottom: "3px solid #3b82f6" }}>|w| = {splitCFL.wEnd - splitCFL.vEnd}</span>
               <span className="badge" style={{ background: "transparent", borderBottom: "3px solid #10b981" }}>|x| = {splitCFL.xEnd - splitCFL.wEnd}</span>
               <span className="badge" style={{ background: "transparent" }}>|y| = {baseString.length - splitCFL.xEnd}</span>
             </>
          )}
       </div>
    </div>
  );
};
