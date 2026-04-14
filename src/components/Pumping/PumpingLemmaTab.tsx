import React, { useState } from 'react';
import { generateString, evaluateRegular, evaluateCFL } from '../../logic/pumpingEngine';
import type { LanguagePattern } from '../../logic/pumpingEngine';
import { DecompositionTape } from './DecompositionTape';
import type { SplitRegular, SplitCFL } from './DecompositionTape';
import { useIntegratedPipeline } from '../../hooks/useIntegratedPipeline';
import { Controls } from '../Controls';
import { StackView } from '../StackView';
import { InputTape } from '../InputTape';

import { useEffect } from 'react';
import { ResultCard } from '../ui/ResultCard';
import { Container, LayoutStack, StepCard } from '../ui/Layout';
import { AnimatedEntry } from '../ui/AnimatedEntry';

export const PumpingLemmaTab: React.FC = () => {
  const [pattern, setPattern] = useState<LanguagePattern>('0^n1^n');
  const [p, setP] = useState<number>(3);
  const [i, setI] = useState<number>(2);

  const [splitRegular, setSplitRegular] = useState<SplitRegular>({ xEnd: 1, yEnd: 2 });
  const [splitCFL, setSplitCFL] = useState<SplitCFL>({ uEnd: 1, vEnd: 2, wEnd: 3, xEnd: 4 });

  const baseString = generateString(pattern, p);
  const isRegular = pattern === '0*1*' || pattern === '0^n1^n';

  const getActiveResult = () => {
    if (isRegular) {
      const xStr = baseString.slice(0, splitRegular.xEnd);
      const yStr = baseString.slice(splitRegular.xEnd, splitRegular.yEnd);
      const zStr = baseString.slice(splitRegular.yEnd);
      return evaluateRegular(xStr, yStr, zStr, i, pattern);
    } else {
      const uStr = baseString.slice(0, splitCFL.uEnd);
      const vStr = baseString.slice(splitCFL.uEnd, splitCFL.vEnd);
      const wStr = baseString.slice(splitCFL.vEnd, splitCFL.wEnd);
      const xStr = baseString.slice(splitCFL.wEnd, splitCFL.xEnd);
      const yStr = baseString.slice(splitCFL.xEnd);
      return evaluateCFL(uStr, vStr, wStr, xStr, yStr, i, pattern);
    }
  };

  const result = getActiveResult();

  // Integrated Pipeline tracking animation sequence mapping to PDA
  const pipelineState = useIntegratedPipeline(i, result.pumpedString, pattern);
  const phase = pipelineState.pipeline.phase;
  const currentCopy = pipelineState.pipeline.currentCopy;

  const isLocked = phase !== 'idle';
  const isHighlighted = phase !== 'idle';

  const renderVisualPump = () => {
    const segments: React.ReactNode[] = [];
    
    const buildSegment = (str: string, typeLabel: string, color: string, isPumped: boolean, copyIdx?: number) => {
        if (!str) return null;
        
        let shouldRender = true;
        let showEllipsis = false;
        
        // Logical bounds capping mapping 5+ exponents neatly
        if (isPumped && copyIdx !== undefined) {
           if (copyIdx > currentCopy) shouldRender = false; // Withhold future copies
           if (copyIdx > 3 && copyIdx < i) {
               shouldRender = false; // Hide inner bounds explicitly
               if (copyIdx === currentCopy && currentCopy < i) showEllipsis = true;
           }
        }

        if (!shouldRender && !showEllipsis) return null;

        if (showEllipsis) {
           return (
              <div key={`ellipsis-${typeLabel}`} className="slide-insert-anim" style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '1.5rem', color: `rgba(${color}, 0.7)` }}>
                 ...
              </div>
           );
        }

        const isNewInstance = isPumped && copyIdx === currentCopy && phase === 'duplicating';
        const renderClass = isNewInstance ? "slide-insert-anim" : "";
        const pulseClass = (isPumped && isHighlighted && phase === 'highlighting') ? "pumped-pulse" : "";

        return (
            <div key={`${typeLabel}-${copyIdx || 0}`} className={`${renderClass} ${pulseClass}`} style={{
                display: 'flex', 
                background: isPumped ? `rgba(${color}, 0.25)` : `rgba(${color}, 0.1)`, 
                border: isPumped ? `2px solid rgb(${color})` : `1px solid rgba(${color}, 0.5)`, 
                borderRadius: '6px', 
                overflow: 'visible',
                position: 'relative',
                boxShadow: isPumped && phase !== 'highlighting' ? `0 4px 12px rgba(${color}, 0.3)` : 'none',
                transform: isPumped && phase !== 'highlighting' ? 'translateY(-2px)' : 'none',
                transition: 'all 0.3s ease'
            }}>
                {isPumped && i > 1 && (
                  <div style={{position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', color: `rgb(${color})`, fontWeight: 'bold', whiteSpace: 'nowrap'}}>
                    {typeLabel} {copyIdx !== undefined ? `(${copyIdx})` : ''}
                  </div>
                )}
                
                {str.split('').map((c, idx) => (
                    <div key={idx} style={{
                        padding: '0.4rem 0.8rem', 
                        borderRight: `1px solid rgba(${color}, 0.2)`, 
                        fontWeight: isPumped ? 'bold' : 'normal',
                        fontSize: '1.2rem',
                        fontFamily: "'JetBrains Mono', monospace"
                    }}>{c}</div>
                ))}
            </div>
        );
    };

    if (isRegular && splitRegular) {
        const { xEnd, yEnd } = splitRegular;
        segments.push(buildSegment(baseString.slice(0, xEnd), 'x', '59, 130, 246', false));
        for (let k = 1; k <= i; k++) {
            segments.push(buildSegment(baseString.slice(xEnd, yEnd), 'y', '16, 185, 129', true, k));
        }
        segments.push(buildSegment(baseString.slice(yEnd), 'z', '148, 163, 184', false));
    } else if (!isRegular && splitCFL) {
        const { uEnd, vEnd, wEnd, xEnd } = splitCFL;
        segments.push(buildSegment(baseString.slice(0, uEnd), 'u', '148, 163, 184', false));
        for (let k = 1; k <= i; k++) {
            segments.push(buildSegment(baseString.slice(uEnd, vEnd), 'v', '16, 185, 129', true, k));
        }
        segments.push(buildSegment(baseString.slice(vEnd, wEnd), 'w', '59, 130, 246', false));
        for (let k = 1; k <= i; k++) {
            segments.push(buildSegment(baseString.slice(wEnd, xEnd), 'x', '16, 185, 129', true, k));
        }
        segments.push(buildSegment(baseString.slice(xEnd), 'y', '148, 163, 184', false));
    }

    return (
        <LayoutStack center gap="lg" style={{ marginTop: '1.5rem', marginBottom: '2rem', minHeight: '60px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {segments}
            </div>
        </LayoutStack>
    );
  };

  const isPdaRunning = phase === 'pda_run' || phase === 'evaluated';
  const pdaState = pipelineState.pipeline.pdaState;
  const isRejected = phase === 'evaluated' && pdaState?.status === 'rejected';

  const [showFailureDetails, setShowFailureDetails] = useState(false);

  useEffect(() => {
    if (isRejected) {
       const timer = setTimeout(() => setShowFailureDetails(true), 350);
       return () => clearTimeout(timer);
    } else {
       setShowFailureDetails(false);
    }
  }, [isRejected]);

  return (
    <Container as="main" variant="md" className="layout-v-stack" style={{ paddingBottom: "20vh" }}>
      <StepCard as="section" title="Step 1: Decomposition">
        <LayoutStack direction="h" gap="lg" style={{ flexWrap: 'wrap', opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}>
          <div className="status-item">
            <span className="label">Language Pattern</span>
            <select 
              value={pattern} 
              onChange={(e) => setPattern(e.target.value as LanguagePattern)}
              className="outline"
              style={{ background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "1px" }}
            >
              <option value="0*1*">Regular Lemma (0*1* - Example working)</option>
              <option value="0^n1^n">Regular Lemma (0^n1^n - Proof test)</option>
              <option value="0^n1^n2^n">CFL Lemma (0^n1^n2^n - Proof test)</option>
            </select>
          </div>

          <div className="status-item">
            <span className="label">Pumping Length (p)</span>
            <input type="number" min={1} max={10} value={p} onChange={e => setP(parseInt(e.target.value))} />
          </div>

          <div className="status-item">
            <span className="label">Iteration Exponent (i)</span>
            <input type="number" min={0} max={5} value={i} onChange={e => setI(parseInt(e.target.value))} />
          </div>
        </LayoutStack>

        <div className="last-transition" style={{ marginTop: "2rem" }}>
           <LayoutStack direction="h" style={{ justifyContent: 'space-between', marginBottom: "1.5rem" }}>
               <h3 style={{ margin: 0, padding: 0 }}>Define Limits</h3>
               <span className="badge running">Phase: {phase}</span>
           </LayoutStack>
           
           <div style={{ pointerEvents: isLocked ? 'none' : 'auto' }}>
             <DecompositionTape 
               baseString={baseString} 
               p={p} 
               mode={isRegular ? 'regular' : 'cfl'} 
               splitRegular={splitRegular} 
               splitCFL={splitCFL} 
               onChangeRegular={setSplitRegular} 
               onChangeCFL={setSplitCFL} 
             />
           </div>
        </div>
      </StepCard>

      <StepCard as="section" title="Step 2: Pumping Sequence">
        <div className="status-item">
           {renderVisualPump()}
        </div>
      </StepCard>

      <StepCard as="section" title="Step 3: PDA Execution Control" noBorder>
         <Controls
                status={phase === 'evaluated' ? (pdaState?.status === 'accepted' ? 'accepted' : 'rejected') : 'running'}
                isAutoRunning={pipelineState.isAutoRunning}
                setIsAutoRunning={pipelineState.setIsAutoRunning}
                speedMs={pipelineState.speedMs}
                setSpeedMs={pipelineState.setSpeedMs}
                step={pipelineState.step}
                reset={pipelineState.reset}
            />
      </StepCard>
        
      {/* DYNAMIC PDA OVERLAY */}
      {isPdaRunning && pdaState && (
        <AnimatedEntry as="section" variant="scale-in" style={{ marginTop: "2rem" }}>
           <div className="card" style={{ border: `1px solid var(${pdaState.status === 'running' ? '--accent-color' : (pdaState.status === 'accepted' ? '--success' : '--danger')})` }}>
              <LayoutStack direction="h" center style={{ marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
                 <div style={{ width: 12, height: 12, borderRadius: '50%', background: pdaState.status === 'running' ? 'var(--accent-color)' : (pdaState.status === 'accepted' ? 'var(--success)' : 'var(--danger)'), boxShadow: '0 0 10px currentColor' }} />
                 <h2 style={{ margin: 0, border: 'none' }}>Empirical Evaluation: PDA Execution</h2>
              </LayoutStack>
             
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '2 1 400px' }}>
                      <InputTape input={pdaState.input} index={pdaState.index} />
                      
                      <div className="status-item" style={{ marginTop: "2rem" }}>
                         <span className="label">Current Computation State</span>
                         <LayoutStack direction="h" style={{ gap: "10px", alignItems: "baseline", marginTop: "0.5rem", justifyContent: 'flex-start' }}>
                             <span className="badge running" style={{ fontSize: "1.2rem", padding: "0.6rem 1.2rem" }}>{pdaState.currentState}</span>
                             {pdaState.lastTransitionId && <span className="dim">using rule: <code>{pdaState.lastTransitionId}</code></span>}
                         </LayoutStack>
                      </div>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                     <AnimatedEntry className={showFailureDetails ? "rejected-shake" : ""} style={{ transition: "var(--transition)" }}>
                         <StackView stack={pdaState.stack} />
                     </AnimatedEntry>
                  </div>
              </div>

              {phase === 'evaluated' && (
                  <div className="result-banner">
                    <AnimatedEntry variant="fade-up">
                        <ResultCard 
                            variant={isRejected ? "danger" : "success"}
                            slots={{
                                title: "Simulation Conclusion",
                                status: isRejected ? "REJECTED" : "ACCEPTED",
                                divider: true,
                                reason: pdaState.reason || "The input string was successfully processed and accepted by the automaton."
                            }}
                        />
                    </AnimatedEntry>
                  </div>
              )}
           </div>
        </AnimatedEntry>
      )}
    </Container>
  );
};
