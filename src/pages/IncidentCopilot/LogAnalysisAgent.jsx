// /**
//  * LogAnalysisAgent.jsx — Log Analysis Agent
//  * Fix: onStart() called before cache check, not inside runAgent.
//  */
// import React, { useState, useEffect } from 'react';
// import { Card, SectionLabel, Badge, Button, Textarea, Spinner } from '../../components/UI.jsx';
// import { useAgent } from './IncidentContext.jsx';
// import { runAgent, buildContext } from './agentRunner.js';
// import { LOG_ANALYSIS_AGENT_PROMPT } from './agents/prompts.js';
// import { MOCK_LOGS } from '../../lib/mockData.js';

// const CACHE_PREFIX = 'log-analysis-agent-';
// const CACHE_TTL    = 15 * 60 * 1000;

// function CodeBlock({ children }) {
//   return (
//     <pre style={{ background: '#0f172a', color: '#7dd3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
//       {children}
//     </pre>
//   );
// }

// function LogAnalysisReport({ text }) {
//   if (!text) return null;
//   const sectionDefs = [
//     { key: 'LOG_SUMMARY:',               bg: '#f8fafc', border: '#e2e8f0', tc: '#475569', label: 'Log Summary' },
//     { key: 'ERROR_PATTERNS:',            bg: '#fef2f2', border: '#fecaca', tc: '#991b1b', label: 'Error Patterns' },
//     { key: 'ANOMALIES:',                 bg: '#fffbeb', border: '#fde68a', tc: '#92400e', label: 'Anomalies' },
//     { key: 'AFFECTED_COMPONENTS:',       bg: '#fef2f2', border: '#fecaca', tc: '#991b1b', label: 'Affected Components' },
//     { key: 'ROOT_CAUSE_SIGNALS:',        bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8', label: 'Root Cause Signals' },
//     { key: 'CLOUDWATCH_QUERIES:',        bg: '#0f172a', border: '#1e293b', tc: '#93c5fd', label: 'CloudWatch Queries', dark: true },
//     { key: 'RECOMMENDED_INVESTIGATION:', bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534', label: 'Recommended Investigation' },
//   ];
//   const blocks = [];
//   for (let i = 0; i < sectionDefs.length; i++) {
//     const sec = sectionDefs[i];
//     const idx = text.indexOf(sec.key);
//     if (idx === -1) continue;
//     const nextIdx = sectionDefs.slice(i + 1).reduce((acc, s) => {
//       const pos = text.indexOf(s.key, idx + sec.key.length);
//       return pos !== -1 && pos < acc ? pos : acc;
//     }, text.length);
//     blocks.push({ ...sec, content: text.slice(idx + sec.key.length, nextIdx).trim() });
//   }
//   if (!blocks.length) return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>;
//   return (
//     <div style={{ display: 'grid', gap: 10 }}>
//       {blocks.map((b, i) => (
//         <Card key={i} style={{ padding: '13px 16px', background: b.bg, border: `1px solid ${b.border}` }}>
//           <SectionLabel style={{ color: b.tc, marginBottom: 8 }}>{b.label}</SectionLabel>
//           {b.dark
//             ? (() => {
//                 const parts = b.content.split(/(```[\s\S]*?```)/g);
//                 return parts.map((p, j) =>
//                   p.startsWith('```')
//                     ? <CodeBlock key={j}>{p.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>
//                     : <span key={j} style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap', display: 'block' }}>{p}</span>
//                 );
//               })()
//             : <div style={{ fontSize: 12.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{b.content}</div>
//           }
//         </Card>
//       ))}
//     </div>
//   );
// }

// export default function LogAnalysisAgent() {
//   const agent = useAgent('loganalysis');
//   const { evidenceResult } = agent.upstreamContext;

//   const defaultLogs = MOCK_LOGS.map(l =>
//     `[${l.timestamp || l.ts}] [${l.level}] [${l.service}] ${l.message}`
//   ).join('\n');

//   const [logInput,   setLogInput]   = useState(defaultLogs);
//   const [autoFilled, setAutoFilled] = useState(false);

//   useEffect(() => {
//     if (!evidenceResult || autoFilled) return;
//     const serviceMatch = evidenceResult.match(/AFFECTED_SERVICES:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
//     if (!serviceMatch) return;
//     const firstService = serviceMatch[1].trim().split('\n')[0].replace(/^•\s*/, '').trim();
//     if (!firstService || firstService === 'No data') return;
//     const filtered = MOCK_LOGS
//       .filter(l => l.service === firstService || l.message.toLowerCase().includes(firstService.toLowerCase()))
//       .map(l => `[${l.timestamp || l.ts}] [${l.level}] [${l.service}] ${l.message}`)
//       .join('\n');
//     if (filtered) { setLogInput(filtered); setAutoFilled(true); }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [evidenceResult]);

//   async function analyze() {
//     if (!logInput.trim() || agent.isRunning) return;

//     const ctx      = buildContext(agent.upstreamContext, ['evidenceResult']);
//     const cacheKey = CACHE_PREFIX + encodeURIComponent(logInput + ctx);

//     // ── MUST call onStart first ──────────────────────────────────────────────
//     agent.onStart();

//     try {
//       const cached = localStorage.getItem(cacheKey);
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         if (Date.now() - parsed.timestamp < CACHE_TTL) {
//           await new Promise(r => setTimeout(r, 120));
//           agent.onDone(parsed.result);
//           return;
//         }
//       }
//     } catch (err) {
//       console.error('Cache read failed:', err);
//     }

//     await runAgent({
//       system:      LOG_ANALYSIS_AGENT_PROMPT,
//       userMessage: `Perform deep log analysis on the following log data:${ctx}\n\nLOGS:\n${logInput}`,
//       onStart:     () => {},   // already called above
//       onChunk:     agent.onChunk,
//       onDone: (result) => {
//         try {
//           localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }));
//         } catch (err) {
//           console.error('Cache write failed:', err);
//         }
//         agent.onDone(result);
//       },
//       onError:     agent.onError,
//       maxTokens:   4096,
//     });
//   }

//   const response = agent.result;
//   const loading  = agent.isRunning;

//   return (
//     <div className="fade-in">
//       <Card style={{ marginBottom: 14 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
//           <SectionLabel style={{ marginBottom: 0 }}>Log data for investigation</SectionLabel>
//           {autoFilled && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ Filtered from Evidence Agent</span>}
//           {evidenceResult && <Badge variant="blue">Evidence context loaded</Badge>}
//         </div>
//         <Textarea rows={10} value={logInput} onChange={e => setLogInput(e.target.value)}
//           placeholder="Paste raw log lines for deep investigation…" />
//         <div style={{ marginTop: 12 }}>
//           <Button variant="primary" onClick={analyze} disabled={loading}
//             icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Analyzing Logs…' : '🔍 Analyze Logs'}
//           </Button>
//         </div>
//       </Card>

//       {(response || loading) && (
//         <>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Log Analysis Report</SectionLabel>
//             {loading  && <Spinner size={13} />}
//             {!loading && <Badge variant="blue">Analysis Complete</Badge>}
//             {!loading && response && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ RCA tab enriched</span>}
//           </div>
//           {loading && !response
//             ? <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Performing deep log investigation…</div></Card>
//             : <LogAnalysisReport text={response} />
//           }
//         </>
//       )}
//     </div>
//   );
// }

















/**
 * LogAnalysisAgent.jsx — Log Analysis Agent
 * Fix: onStart() called before cache check, not inside runAgent.
 * UI: Professional dashboard cards, KPI tiles, copy/download buttons.
 */
import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Badge, Button, Textarea, Spinner } from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';
import { runAgent, buildContext } from './agentRunner.js';
import { LOG_ANALYSIS_AGENT_PROMPT } from './agents/prompts.js';
import { MOCK_LOGS } from '../../lib/mockData.js';

const CACHE_PREFIX = 'log-analysis-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

// ── shared style tokens ───────────────────────────────────────────────────────
const T = {
  mono:   'var(--font-mono)',
  body:   'var(--font-body)',
  radius: 8,
};

// ── tiny helpers ──────────────────────────────────────────────────────────────
function copyText(text) { navigator.clipboard.writeText(text).catch(() => {}); }

function downloadMd(text, filename = 'log-analysis-report.md') {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── sub-components ────────────────────────────────────────────────────────────

function CodeBlock({ children }) {
  return (
    <pre style={{
      background: '#0f172a', color: '#7dd3fc', borderRadius: T.radius,
      padding: '10px 14px', fontFamily: T.mono, fontSize: '11.5px',
      lineHeight: 1.6, overflow: 'auto', margin: '6px 0',
      border: '1px solid #1e293b', whiteSpace: 'pre-wrap',
    }}>
      {children}
    </pre>
  );
}

/** Pill badge for log level */
function LevelBadge({ level }) {
  const map = {
    ERROR: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    WARN:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    INFO:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  };
  const s = map[level?.toUpperCase()] || { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      fontFamily: T.mono, letterSpacing: '0.05em',
    }}>
      {level?.toUpperCase() ?? 'LOG'}
    </span>
  );
}

/** Single KPI tile */
function KpiTile({ label, value, sub, accent = '#1d4ed8' }) {
  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: T.radius, padding: '12px 14px',
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/** Parse a section from raw text */
function parseSection(text, key) {
  const idx = text.indexOf(key);
  if (idx === -1) return '';
  const after = text.slice(idx + key.length);
  const nextHeader = after.search(/\n[A-Z_]+:/);
  return (nextHeader === -1 ? after : after.slice(0, nextHeader)).trim();
}

/** Derive KPIs from raw text */
function deriveKpis(text) {
  const errorLines  = (text.match(/\[ERROR\]/gi) || []).length;
  const warnLines   = (text.match(/\[WARN\]/gi)  || []).length;
  const anomalies   = parseSection(text, 'ANOMALIES:').split('\n').filter(Boolean).length;
  const components  = parseSection(text, 'AFFECTED_COMPONENTS:').split('\n').filter(Boolean).length;
  return { errorLines, warnLines, anomalies, components };
}

/** Main analysis report layout */
function LogAnalysisReport({ text }) {
  if (!text) return null;

  const kpis = deriveKpis(text);

  const sectionDefs = [
    { key: 'LOG_SUMMARY:',               bg: '#f8fafc', border: '#e2e8f0', tc: '#475569', label: 'Log Summary',              icon: '📋' },
    { key: 'ERROR_PATTERNS:',            bg: '#fef2f2', border: '#fecaca', tc: '#991b1b', label: 'Error Patterns',            icon: '🔴' },
    { key: 'ANOMALIES:',                 bg: '#fffbeb', border: '#fde68a', tc: '#92400e', label: 'Anomalies Detected',        icon: '⚠️' },
    { key: 'AFFECTED_COMPONENTS:',       bg: '#fef2f2', border: '#fecaca', tc: '#991b1b', label: 'Affected Components',       icon: '🔧' },
    { key: 'ROOT_CAUSE_SIGNALS:',        bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8', label: 'Root Cause Signals',        icon: '🔍' },
    { key: 'CLOUDWATCH_QUERIES:',        bg: '#0f172a', border: '#1e293b', tc: '#93c5fd', label: 'CloudWatch Queries',        icon: '☁️', dark: true },
    { key: 'RECOMMENDED_INVESTIGATION:', bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534', label: 'Recommended Investigation', icon: '✅' },
  ];

  const blocks = [];
  for (let i = 0; i < sectionDefs.length; i++) {
    const sec  = sectionDefs[i];
    const idx  = text.indexOf(sec.key);
    if (idx === -1) continue;
    const nextIdx = sectionDefs.slice(i + 1).reduce((acc, s) => {
      const pos = text.indexOf(s.key, idx + sec.key.length);
      return pos !== -1 && pos < acc ? pos : acc;
    }, text.length);
    blocks.push({ ...sec, content: text.slice(idx + sec.key.length, nextIdx).trim() });
  }

  if (!blocks.length) {
    return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  // ── Affected components: render as badge pills ────────────────────────────
  const affectedBlock = blocks.find(b => b.key === 'AFFECTED_COMPONENTS:');
  const componentList = affectedBlock
    ? affectedBlock.content.split('\n').filter(Boolean).map(l => l.replace(/^[•\-]\s*/, '').trim())
    : [];

  // ── Root cause signals: render as numbered signal cards ──────────────────
  const signalsBlock = blocks.find(b => b.key === 'ROOT_CAUSE_SIGNALS:');
  const signalList   = signalsBlock
    ? signalsBlock.content.split('\n').filter(Boolean).map(l => l.replace(/^\d+\.\s*|^[•\-]\s*/, '').trim())
    : [];

  return (
    <div style={{ display: 'grid', gap: 12 }}>

      {/* ── KPI row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <KpiTile label="Error Events"       value={kpis.errorLines}  sub="[ERROR] lines"      accent="#dc2626" />
        <KpiTile label="Warnings"           value={kpis.warnLines}   sub="[WARN] lines"       accent="#f59e0b" />
        <KpiTile label="Anomalies"          value={kpis.anomalies}   sub="distinct anomalies" accent="#7c3aed" />
        <KpiTile label="Affected Services"  value={kpis.components}  sub="components"         accent="#0369a1" />
      </div>

      {/* ── Summary + Error Patterns ── */}
      {(() => {
        const sumBlock = blocks.find(b => b.key === 'LOG_SUMMARY:');
        const errBlock = blocks.find(b => b.key === 'ERROR_PATTERNS:');
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {sumBlock && (
              <Card style={{ padding: '14px 16px', background: sumBlock.bg, border: `1px solid ${sumBlock.border}` }}>
                <SectionLabel style={{ color: sumBlock.tc, marginBottom: 8 }}>
                  {sumBlock.icon} {sumBlock.label}
                </SectionLabel>
                <div style={{ fontSize: 12.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {sumBlock.content}
                </div>
              </Card>
            )}
            {errBlock && (
              <Card style={{ padding: '14px 16px', background: errBlock.bg, border: `1px solid ${errBlock.border}` }}>
                <SectionLabel style={{ color: errBlock.tc, marginBottom: 8 }}>
                  {errBlock.icon} {errBlock.label}
                </SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {errBlock.content.split('\n').filter(Boolean).map((line, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '6px 10px', background: '#fff5f5',
                      border: '1px solid #fecaca', borderRadius: 6,
                    }}>
                      <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>✕</span>
                      <span style={{ fontSize: 12, lineHeight: 1.6, color: '#7f1d1d' }}>
                        {line.replace(/^[•\-\d.]\s*/, '')}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );
      })()}

      {/* ── Anomalies timeline-style ── */}
      {(() => {
        const block = blocks.find(b => b.key === 'ANOMALIES:');
        if (!block) return null;
        const lines = block.content.split('\n').filter(Boolean);
        return (
          <Card style={{ padding: '14px 16px', background: block.bg, border: `1px solid ${block.border}` }}>
            <SectionLabel style={{ color: block.tc, marginBottom: 12 }}>
              {block.icon} {block.label}
            </SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {lines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, position: 'relative' }}>
                  {/* timeline spine */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', border: '2px solid #fde68a', marginTop: 3 }} />
                    {i < lines.length - 1 && <div style={{ width: 2, flex: 1, background: '#fde68a', minHeight: 16 }} />}
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.6, color: '#78350f', paddingBottom: 2 }}>
                    {line.replace(/^[•\-\d.]\s*/, '')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* ── Affected Components badges + Root Cause Signals ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {componentList.length > 0 && (
          <Card style={{ padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca' }}>
            <SectionLabel style={{ color: '#991b1b', marginBottom: 10 }}>🔧 Affected Components</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {componentList.map((c, i) => (
                <span key={i} style={{
                  background: '#fee2e2', color: '#b91c1c',
                  border: '1px solid #fecaca', padding: '5px 10px',
                  borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                  fontFamily: T.mono,
                }}>
                  {c}
                </span>
              ))}
            </div>
          </Card>
        )}
        {signalList.length > 0 && (
          <Card style={{ padding: '14px 16px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <SectionLabel style={{ color: '#1d4ed8', marginBottom: 10 }}>🔍 Root Cause Signals</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signalList.map((sig, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '6px 10px', background: '#dbeafe',
                  borderRadius: 6, border: '1px solid #bfdbfe',
                }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, color: '#1e3a8a', lineHeight: 1.5 }}>{sig}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── CloudWatch Queries dark card ── */}
      {(() => {
        const block = blocks.find(b => b.key === 'CLOUDWATCH_QUERIES:');
        if (!block) return null;
        const parts = block.content.split(/(```[\s\S]*?```)/g);
        return (
          <Card style={{ padding: '14px 16px', background: '#0f172a', border: '1px solid #1e293b' }}>
            <SectionLabel style={{ color: '#93c5fd', marginBottom: 8 }}>☁️ CloudWatch Queries</SectionLabel>
            {parts.map((p, j) =>
              p.startsWith('```')
                ? <CodeBlock key={j}>{p.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>
                : <span key={j} style={{ color: '#e2e8f0', fontFamily: T.mono, fontSize: 12, whiteSpace: 'pre-wrap', display: 'block' }}>{p}</span>
            )}
          </Card>
        );
      })()}

      {/* ── Recommended Investigation ── */}
      {(() => {
        const block = blocks.find(b => b.key === 'RECOMMENDED_INVESTIGATION:');
        if (!block) return null;
        const steps = block.content.split('\n').filter(Boolean);
        return (
          <Card style={{ padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <SectionLabel style={{ color: '#166534', marginBottom: 10 }}>✅ Recommended Investigation</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {steps.map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '7px 10px', background: '#dcfce7',
                  borderRadius: 6, border: '1px solid #bbf7d0',
                }}>
                  <span style={{
                    background: '#166534', color: '#fff', borderRadius: '50%',
                    width: 18, height: 18, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 12.5, color: '#14532d', lineHeight: 1.5 }}>
                    {step.replace(/^\d+\.\s*|^[•\-]\s*/, '')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function LogAnalysisAgent() {
  const agent = useAgent('loganalysis');
  const { evidenceResult } = agent.upstreamContext;

  const defaultLogs = MOCK_LOGS.map(l =>
    `[${l.timestamp || l.ts}] [${l.level}] [${l.service}] ${l.message}`
  ).join('\n');

  const [logInput,   setLogInput]   = useState(defaultLogs);
  const [autoFilled, setAutoFilled] = useState(false);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    if (!evidenceResult || autoFilled) return;
    const serviceMatch = evidenceResult.match(/AFFECTED_SERVICES:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
    if (!serviceMatch) return;
    const firstService = serviceMatch[1].trim().split('\n')[0].replace(/^•\s*/, '').trim();
    if (!firstService || firstService === 'No data') return;
    const filtered = MOCK_LOGS
      .filter(l => l.service === firstService || l.message.toLowerCase().includes(firstService.toLowerCase()))
      .map(l => `[${l.timestamp || l.ts}] [${l.level}] [${l.service}] ${l.message}`)
      .join('\n');
    if (filtered) { setLogInput(filtered); setAutoFilled(true); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidenceResult]);

  async function analyze() {
    if (!logInput.trim() || agent.isRunning) return;

    const ctx      = buildContext(agent.upstreamContext, ['evidenceResult']);
    const cacheKey = CACHE_PREFIX + encodeURIComponent(logInput + ctx);

    agent.onStart();

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          await new Promise(r => setTimeout(r, 120));
          agent.onDone(parsed.result);
          return;
        }
      }
    } catch (err) {
      console.error('Cache read failed:', err);
    }

    await runAgent({
      system:      LOG_ANALYSIS_AGENT_PROMPT,
      userMessage: `Perform deep log analysis on the following log data:${ctx}\n\nLOGS:\n${logInput}`,
      onStart:     () => {},
      onChunk:     agent.onChunk,
      onDone: (result) => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }));
        } catch (err) {
          console.error('Cache write failed:', err);
        }
        agent.onDone(result);
      },
      onError:     agent.onError,
      maxTokens:   4096,
    });
  }

  function handleCopy() {
    copyText(agent.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const response = agent.result;
  const loading  = agent.isRunning;

  return (
    <div className="fade-in">
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Log data for investigation</SectionLabel>
          {autoFilled && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ Filtered from Evidence Agent</span>}
          {evidenceResult && <Badge variant="blue">Evidence context loaded</Badge>}
        </div>
        <Textarea rows={10} value={logInput} onChange={e => setLogInput(e.target.value)}
          placeholder="Paste raw log lines for deep investigation…" />
        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={analyze} disabled={loading}
            icon={loading ? <Spinner size={14} color="#fff" /> : null}>
            {loading ? 'Analyzing Logs…' : '🔍 Analyze Logs'}
          </Button>
        </div>
      </Card>

      {(response || loading) && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Log Analysis Report</SectionLabel>
            {loading  && <Spinner size={13} />}
            {!loading && <Badge variant="blue">Analysis Complete</Badge>}
            {!loading && response && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={handleCopy} style={{
                  fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6,
                  padding: '4px 10px', cursor: 'pointer', background: 'var(--content-bg)',
                  color: 'var(--text-secondary)',
                }}>
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
                <button onClick={() => downloadMd(response)} style={{
                  fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6,
                  padding: '4px 10px', cursor: 'pointer', background: 'var(--content-bg)',
                  color: 'var(--text-secondary)',
                }}>
                  ⬇ Markdown
                </button>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ RCA tab enriched</span>
              </div>
            )}
          </div>

          {loading && !response
            ? (
              <Card>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <Spinner />Performing deep log investigation…
                </div>
              </Card>
            )
            : <LogAnalysisReport text={response} />
          }
        </>
      )}
    </div>
  );
}
