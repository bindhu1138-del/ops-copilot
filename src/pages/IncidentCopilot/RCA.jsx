// // RCA.jsx
// import React, { useState } from 'react';
// import { Card, SectionLabel, Badge, MetricCard, PageHeader, Button, Input, Spinner } from '../../components/UI.jsx';
// import { MOCK_METRICS, MOCK_DEPLOYMENTS, TIMELINE_EVENTS, MOCK_LOGS } from '../../lib/mockData.js';
// import { callClaudeStream } from '../../lib/claude.js';

// const PRESETS = [
//   { label: 'Checkout latency spike', q: 'Why did checkout latency spike today?' },
//   { label: 'Payment failures post-deploy', q: 'Why did payment transactions fail after today\'s deployment?' },
//   { label: 'DB connection exhaustion', q: 'Why is the payment service database pool exhausted?' },
//   { label: 'Auth 503 errors', q: 'Why is the auth service returning 503 errors?' },
// ];

// const SYSTEM = `You are an expert SRE (Site Reliability Engineer) AI. You perform root cause analysis by correlating logs, metrics, deployments, and system events.

// Given an incident question and system context, produce a structured incident report with:

// ROOT CAUSE:
// <1-2 sentences stating the most likely root cause. Be specific — name the deployment, config change, error type, and metric values.>

// EVIDENCE:
// • <piece of evidence 1 with specific numbers>
// • <piece of evidence 2 with specific numbers>
// • <piece of evidence 3>

// FAILURE CHAIN:
// <Step-by-step explanation of how the root cause led to the observed symptoms. Use an arrow chain like: A → B → C → user impact>

// REMEDIATION:
// 1. <Immediate action — what to do right now>
// 2. <Short-term fix>
// 3. <Long-term prevention>

// RISK ASSESSMENT:
// Severity: <P1/P2/P3> | Blast radius: <what services/users are affected> | Recovery ETA: <estimate>

// Be direct, data-driven, and specific. Use the actual numbers from the context provided.`;

// const timelineColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6' };

// function IncidentReport({ text }) {
//   if (!text) return null;
//   const sections = [
//     { key: 'ROOT CAUSE:', bg: '#fef2f2', border: '#fecaca', titleColor: '#991b1b' },
//     { key: 'EVIDENCE:', bg: '#fffbeb', border: '#fde68a', titleColor: '#92400e' },
//     { key: 'FAILURE CHAIN:', bg: '#eff6ff', border: '#bfdbfe', titleColor: '#1d4ed8' },
//     { key: 'REMEDIATION:', bg: '#f0fdf4', border: '#bbf7d0', titleColor: '#166534' },
//     { key: 'RISK ASSESSMENT:', bg: '#f8fafc', border: '#e2e8f0', titleColor: '#475569' },
//   ];

//   let remaining = text;
//   const blocks = [];

//   for (let i = 0; i < sections.length; i++) {
//     const sec = sections[i];
//     const idx = remaining.indexOf(sec.key);
//     if (idx === -1) continue;
//     const nextIdx = sections.slice(i + 1).reduce((acc, s) => {
//       const pos = remaining.indexOf(s.key, idx + sec.key.length);
//       return pos !== -1 && pos < acc ? pos : acc;
//     }, remaining.length);
//     const content = remaining.slice(idx + sec.key.length, nextIdx).trim();
//     blocks.push({ ...sec, content });
//   }

//   if (blocks.length === 0) {
//     return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{text}</div>;
//   }

//   return (
//     <div>
//       {blocks.map((b, i) => (
//         <div key={i} style={{
//           background: b.bg, border: `1px solid ${b.border}`,
//           borderRadius: 10, padding: '12px 16px', marginBottom: 10,
//         }}>
//           <div style={{ fontSize: 10, fontWeight: 700, color: b.titleColor, letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
//             {b.key}
//           </div>
//           <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{b.content}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function IncidentPage() {
//   const [query, setQuery] = useState('Why did checkout latency spike today?');
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [ran, setRan] = useState(false);

//   async function investigate() {
//     if (!query.trim() || loading) return;
//     setResponse('');
//     setLoading(true);
//     setRan(true);

//     const context = {
//       metrics: MOCK_METRICS,
//       recentDeployments: MOCK_DEPLOYMENTS,
//       recentLogs: MOCK_LOGS.slice(0, 8).map(l => `[${l.level}] [${l.service}] ${l.message}`),
//       timeline: TIMELINE_EVENTS,
//     };

//     const prompt = `Incident question: "${query}"\n\nSystem context:\n${JSON.stringify(context, null, 2)}`;

//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: prompt }],
//         maxTokens: 4096,
//         onChunk: (_, full) => setResponse(full),
//         onDone: () => setLoading(false),
//       });
//     } catch (e) {
//       setResponse(`Error: ${e.message}`);
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Investigator"
//         subtitle="Correlates logs, metrics, deployments, and traces to generate root-cause analysis."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />

//       {/* Live metrics */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
//         <MetricCard label="p99 Latency" value="1160ms" delta="from 340ms baseline" deltaDir="bad" />
//         <MetricCard label="DB Timeouts/min" value="130" delta="from 2/min" deltaDir="bad" />
//         <MetricCard label="Error Rate" value="18.4%" delta="from 0.3% baseline" deltaDir="bad" />
//         <MetricCard label="Circuit Breaker" value="OPEN" sub="payment-gateway" />
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
//         {/* Timeline */}
//         <Card>
//           <SectionLabel>Incident event timeline</SectionLabel>
//           {TIMELINE_EVENTS.map((evt, i) => (
//             <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
//               <div style={{ width: 8, height: 8, borderRadius: '50%', background: timelineColors[evt.type], marginTop: 4, flexShrink: 0 }} />
//               <div>
//                 <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginRight: 7 }}>{evt.time}</span>
//                 <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{evt.label}</span>
//               </div>
//             </div>
//           ))}
//         </Card>

//         {/* Recent deployments */}
//         <Card>
//           <SectionLabel>Deployment history</SectionLabel>
//           {MOCK_DEPLOYMENTS.map(d => (
//             <div key={d.id} style={{
//               padding: '10px 12px', borderRadius: 8, marginBottom: 8,
//               background: d.status === 'incident' ? '#fef2f2' : d.status === 'warning' ? '#fffbeb' : '#f0fdf4',
//               border: `1px solid ${d.status === 'incident' ? '#fecaca' : d.status === 'warning' ? '#fde68a' : '#bbf7d0'}`,
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
//                 <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
//                   <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.version}</span>
//                   <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.service}</span>
//                 </div>
//                 {d.status === 'incident' && <Badge variant="red">⚠ Incident</Badge>}
//               </div>
//               <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{d.timeLabel} · {d.author}</div>
//               <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.changes}</div>
//             </div>
//           ))}
//         </Card>
//       </div>

//       {/* Query */}
//       <Card style={{ marginBottom: 14 }}>
//         <SectionLabel>Ask the Incident AI</SectionLabel>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
//           {PRESETS.map(p => (
//             <button key={p.q} onClick={() => setQuery(p.q)} style={{
//               background: query === p.q ? '#fef2f2' : 'var(--content-bg)',
//               border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`,
//               color: query === p.q ? '#991b1b' : 'var(--text-secondary)',
//               borderRadius: 6, padding: '4px 12px', fontSize: 12,
//               cursor: 'pointer', fontFamily: 'var(--font-body)',
//               fontWeight: query === p.q ? 500 : 400, transition: 'all 0.15s',
//             }}>{p.label}</button>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Input
//             value={query}
//             onChange={e => setQuery(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && investigate()}
//             placeholder="Describe the incident or ask what caused it…"
//             style={{ flex: 1 }}
//           />
//           <Button variant="primary" onClick={investigate} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Investigating…' : '⚠  Investigate'}
//           </Button>
//         </div>
//       </Card>

//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Root cause analysis</SectionLabel>
//             {loading && <Spinner size={13} />}
//             {!loading && <Badge variant="red">P1 Report</Badge>}
//           </div>
//           {loading && !response
//             ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Correlating logs, metrics, and deployment history…</div>
//             : <IncidentReport text={response} />
//           }
//         </Card>
//       )}
//     </div>
//   );
// }
















// /**
//  * RCA.jsx — Root Cause Analysis
//  *
//  * Props:
//  *   autoFillInput (string)  — pre-populated from EvidenceCorrelation output.
//  *                             User can edit before running. Applied once on mount
//  *                             or when the value changes from empty → populated.
//  *   onResult(text: string)  — called when RCA completes; parent stores it so
//  *                             Runbook + Postmortem can auto-fill.
//  */
// import React, { useState, useEffect } from 'react';
// import {
//   Card, SectionLabel, Badge, MetricCard,
//   Button, Input, Spinner,
// } from '../../components/UI.jsx';
// import { MOCK_METRICS, MOCK_DEPLOYMENTS, TIMELINE_EVENTS, MOCK_LOGS } from '../../lib/mockData.js';
// import { callClaudeStream } from '../../lib/claude.js';

// const PRESETS = [
//   { label: 'Checkout latency spike',       q: "Why did checkout latency spike today?" },
//   { label: 'Payment failures post-deploy', q: "Why did payment transactions fail after today's deployment?" },
//   { label: 'DB connection exhaustion',     q: "Why is the payment service database pool exhausted?" },
//   { label: 'Auth 503 errors',              q: "Why is the auth service returning 503 errors?" },
// ];

// const SYSTEM = `You are an expert SRE (Site Reliability Engineer) AI. You perform root cause analysis by correlating logs, metrics, deployments, and system events.

// Given an incident question and system context, produce a structured incident report with:

// ROOT CAUSE:
// <1-2 sentences stating the most likely root cause. Be specific — name the deployment, config change, error type, and metric values.>

// EVIDENCE:
// • <piece of evidence 1 with specific numbers>
// • <piece of evidence 2 with specific numbers>
// • <piece of evidence 3>

// FAILURE CHAIN:
// <Step-by-step explanation of how the root cause led to the observed symptoms. Use an arrow chain like: A → B → C → user impact>

// REMEDIATION:
// 1. <Immediate action — what to do right now>
// 2. <Short-term fix>
// 3. <Long-term prevention>

// RISK ASSESSMENT:
// Severity: <P1/P2/P3> | Blast radius: <what services/users are affected> | Recovery ETA: <estimate>

// Be direct, data-driven, and specific. Use the actual numbers from the context provided.`;

// const timelineColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6' };

// function IncidentReport({ text }) {
//   if (!text) return null;
//   const sections = [
//     { key: 'ROOT CAUSE:',     bg: '#fef2f2', border: '#fecaca', titleColor: '#991b1b' },
//     { key: 'EVIDENCE:',       bg: '#fffbeb', border: '#fde68a', titleColor: '#92400e' },
//     { key: 'FAILURE CHAIN:',  bg: '#eff6ff', border: '#bfdbfe', titleColor: '#1d4ed8' },
//     { key: 'REMEDIATION:',    bg: '#f0fdf4', border: '#bbf7d0', titleColor: '#166534' },
//     { key: 'RISK ASSESSMENT:',bg: '#f8fafc', border: '#e2e8f0', titleColor: '#475569' },
//   ];

//   const blocks = [];
//   for (let i = 0; i < sections.length; i++) {
//     const sec = sections[i];
//     const idx = text.indexOf(sec.key);
//     if (idx === -1) continue;
//     const nextIdx = sections.slice(i + 1).reduce((acc, s) => {
//       const pos = text.indexOf(s.key, idx + sec.key.length);
//       return pos !== -1 && pos < acc ? pos : acc;
//     }, text.length);
//     const content = text.slice(idx + sec.key.length, nextIdx).trim();
//     blocks.push({ ...sec, content });
//   }

//   if (blocks.length === 0) {
//     return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{text}</div>;
//   }

//   return (
//     <div>
//       {blocks.map((b, i) => (
//         <div key={i} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
//           <div style={{ fontSize: 10, fontWeight: 700, color: b.titleColor, letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{b.key}</div>
//           <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{b.content}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function RCA({ autoFillInput, onResult }) {
//   const [query,    setQuery]    = useState('Why did checkout latency spike today?');
//   const [response, setResponse] = useState('');
//   const [loading,  setLoading]  = useState(false);
//   const [ran,      setRan]      = useState(false);
//   // Track whether we already applied the auto-fill to avoid overwriting user edits
//   const [autoFilled, setAutoFilled] = useState(false);

//   /**
//    * Auto-fill effect:
//    * When autoFillInput arrives (Evidence Correlation completed), pre-populate the
//    * query input ONLY IF the user hasn't already typed something custom (tracked by
//    * autoFilled flag). This way a second Evidence run updates the field, but a user
//    * who manually typed something won't be overwritten.
//    */
//   useEffect(() => {
//     if (autoFillInput && autoFillInput.trim()) {
//       // Build a concise prompt from the evidence result for the RCA input box
//       const rootCauseMatch = autoFillInput.match(/LIKELY_ROOT_CAUSE:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
//       const servicesMatch  = autoFillInput.match(/AFFECTED_SERVICES:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
//       const rootCause = rootCauseMatch ? rootCauseMatch[1].trim() : '';
//       const services  = servicesMatch  ? servicesMatch[1].trim().split('\n')[0].replace(/^•\s*/, '') : '';

//       const filled = rootCause
//         ? `Based on evidence correlation: ${rootCause}${services ? ` (service: ${services})` : ''}. What is the full root cause and remediation plan?`
//         : autoFillInput.slice(0, 300);

//       setQuery(filled);
//       setAutoFilled(true);
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [autoFillInput]);

//   async function investigate() {
//     if (!query.trim() || loading) return;
//     setResponse('');
//     setLoading(true);
//     setRan(true);

//     const context = {
//       metrics:           MOCK_METRICS,
//       recentDeployments: MOCK_DEPLOYMENTS,
//       recentLogs:        MOCK_LOGS.slice(0, 8).map(l => `[${l.level}] [${l.service}] ${l.message}`),
//       timeline:          TIMELINE_EVENTS,
//     };

//     const prompt = `Incident question: "${query}"\n\nSystem context:\n${JSON.stringify(context, null, 2)}`;

//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: prompt }],
//         maxTokens: 1500,
//         onChunk: (_, full) => setResponse(full),
//         onDone: (full) => {
//           setLoading(false);
//           onResult?.(full);   // feed Runbook + Postmortem
//         },
//       });
//     } catch (e) {
//       setResponse(`Error: ${e.message}`);
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="fade-in">
//       {/* Live metrics */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
//         <MetricCard label="p99 Latency"     value="1160ms" delta="from 340ms baseline" deltaDir="bad" />
//         <MetricCard label="DB Timeouts/min" value="130"    delta="from 2/min"          deltaDir="bad" />
//         <MetricCard label="Error Rate"      value="18.4%"  delta="from 0.3% baseline"  deltaDir="bad" />
//         <MetricCard label="Circuit Breaker" value="OPEN"   sub="payment-gateway" />
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
//         {/* Timeline */}
//         <Card>
//           <SectionLabel>Incident event timeline</SectionLabel>
//           {TIMELINE_EVENTS.map((evt, i) => (
//             <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
//               <div style={{ width: 8, height: 8, borderRadius: '50%', background: timelineColors[evt.type], marginTop: 4, flexShrink: 0 }} />
//               <div>
//                 <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginRight: 7 }}>{evt.time}</span>
//                 <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{evt.label}</span>
//               </div>
//             </div>
//           ))}
//         </Card>

//         {/* Deployment history */}
//         <Card>
//           <SectionLabel>Deployment history</SectionLabel>
//           {MOCK_DEPLOYMENTS.map(d => (
//             <div key={d.id} style={{
//               padding: '10px 12px', borderRadius: 8, marginBottom: 8,
//               background: d.status === 'incident' ? '#fef2f2' : d.status === 'warning' ? '#fffbeb' : '#f0fdf4',
//               border: `1px solid ${d.status === 'incident' ? '#fecaca' : d.status === 'warning' ? '#fde68a' : '#bbf7d0'}`,
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
//                 <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
//                   <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.version}</span>
//                   <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.service}</span>
//                 </div>
//                 {d.status === 'incident' && <Badge variant="red">⚠ Incident</Badge>}
//               </div>
//               <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{d.timeLabel} · {d.author}</div>
//               <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.changes}</div>
//             </div>
//           ))}
//         </Card>
//       </div>

//       {/* Query input */}
//       <Card style={{ marginBottom: 14 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
//           <SectionLabel style={{ marginBottom: 0 }}>Ask the Incident AI</SectionLabel>
//           {autoFilled && (
//             <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
//               ✓ Pre-filled from Evidence Correlation — edit freely
//             </span>
//           )}
//         </div>

//         {/* Preset buttons */}
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
//           {PRESETS.map(p => (
//             <button key={p.q} onClick={() => setQuery(p.q)} style={{
//               background: query === p.q ? '#fef2f2' : 'var(--content-bg)',
//               border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`,
//               color: query === p.q ? '#991b1b' : 'var(--text-secondary)',
//               borderRadius: 6, padding: '4px 12px', fontSize: 12,
//               cursor: 'pointer', fontFamily: 'var(--font-body)',
//               fontWeight: query === p.q ? 500 : 400, transition: 'all 0.15s',
//             }}>{p.label}</button>
//           ))}
//         </div>

//         <div style={{ display: 'flex', gap: 10 }}>
//           <Input
//             value={query}
//             onChange={e => setQuery(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && investigate()}
//             placeholder="Describe the incident or ask what caused it…"
//             style={{ flex: 1 }}
//           />
//           <Button variant="primary" onClick={investigate} disabled={loading}
//             icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Investigating…' : '⚠ Investigate'}
//           </Button>
//         </div>
//       </Card>

//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Root cause analysis</SectionLabel>
//             {loading  && <Spinner size={13} />}
//             {!loading && <Badge variant="red">P1 Report</Badge>}
//             {!loading && response && (
//               <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 500 }}>
//                 ✓ Runbook tab pre-filled
//               </span>
//             )}
//           </div>
//           {loading && !response
//             ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Correlating logs, metrics, and deployment history…</div>
//             : <IncidentReport text={response} />
//           }
//         </Card>
//       )}
//     </div>
//   );
// }










/**
 * RCA.jsx — RCA Agent
 * Fix: onStart() called before cache check.
 */
import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Badge, MetricCard, Button, Input, Spinner } from '../../components/UI.jsx';
import { MOCK_METRICS, MOCK_DEPLOYMENTS, TIMELINE_EVENTS, MOCK_LOGS } from '../../lib/mockData.js';
import { useAgent } from './IncidentContext.jsx';
import { runAgent, buildContext } from './agentRunner.js';
import { RCA_AGENT_PROMPT } from './agents/prompts.js';

const CACHE_PREFIX = 'rca-analysis-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

const PRESETS = [
  { label: 'Checkout latency spike',       q: "Why did checkout latency spike today?" },
  { label: 'Payment failures post-deploy', q: "Why did payment transactions fail after today's deployment?" },
  { label: 'DB connection exhaustion',     q: "Why is the payment service database pool exhausted?" },
  { label: 'Auth 503 errors',              q: "Why is the auth service returning 503 errors?" },
];

const timelineColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6' };

function IncidentReport({ text }) {
  if (!text) return null;
  const sections = [
    { key: 'ROOT CAUSE:',      bg: '#fee2e2', border: '#fecaca', titleColor: '#991b1b' },
    { key: 'EVIDENCE:',        bg: '#fffbeb', border: '#fde68a', titleColor: '#92400e' },
    { key: 'FAILURE CHAIN:',   bg: '#eff6ff', border: '#bfdbfe', titleColor: '#1d4ed8' },
    { key: 'REMEDIATION:',     bg: '#f0fdf4', border: '#bbf7d0', titleColor: '#166534' },
    { key: 'RISK ASSESSMENT:', bg: '#f8fafc', border: '#e2e8f0', titleColor: '#475569' },
  ];
  const blocks = [];
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const idx = text.indexOf(sec.key);
    if (idx === -1) continue;
    const nextIdx = sections.slice(i + 1).reduce((acc, s) => {
      const pos = text.indexOf(s.key, idx + sec.key.length);
      return pos !== -1 && pos < acc ? pos : acc;
    }, text.length);
    blocks.push({ ...sec, content: text.slice(idx + sec.key.length, nextIdx).trim() });
  }
  if (!blocks.length) return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>;
  return (
    <div>
      {blocks.map((b, i) => (
        <div key={i} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: b.titleColor, letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{b.key}</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{b.content}</div>
        </div>
      ))}
    </div>
  );
}

export default function RCA({
  selectedIncident,
  setActive,
  setPlatformTab,
  setArchitectureInput
}) {
  const agent = useAgent('rca');
  const { evidenceResult, logAnalysisResult } = agent.upstreamContext;

  const [query, setQuery] = useState(
  selectedIncident
    ? `Why did ${selectedIncident.title} occur?`
    : 'Why did checkout latency spike today?'
);
  const [autoFilled, setAutoFilled] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
  if (!selectedIncident) return;

  setQuery(
    `Why did ${selectedIncident.title} occur?`
  );
}, [selectedIncident]);

  useEffect(() => {
    if (!evidenceResult && !logAnalysisResult) return;
    const rcMatch  = evidenceResult?.match(/LIKELY_ROOT_CAUSE:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
    const svcMatch = evidenceResult?.match(/AFFECTED_SERVICES:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
    const sigMatch = logAnalysisResult?.match(/ROOT_CAUSE_SIGNALS:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i);
    const rc  = rcMatch  ? rcMatch[1].trim()  : '';
    const svc = svcMatch ? svcMatch[1].trim().split('\n')[0].replace(/^•\s*/, '').trim() : '';
    const sig = sigMatch ? sigMatch[1].trim().split('\n')[0].replace(/^•\s*/, '').trim() : '';
    if (rc) {
      setQuery((`${rc}${svc ? ` (service: ${svc})` : ''}${sig ? `. Key signal: ${sig}` : ''}. Perform full RCA.`).slice(0, 300));
      setAutoFilled(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidenceResult, logAnalysisResult]);

  function copyReport() {
  navigator.clipboard.writeText(response);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
}

function downloadMarkdown() {
  const blob = new Blob(
    [response],
    { type: 'text/markdown' }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = 'rca-report.md';

  a.click();

  URL.revokeObjectURL(url);
}
  async function investigate() {
    if (!query.trim() || agent.isRunning) return;

    const ctx       = buildContext(agent.upstreamContext, ['evidenceResult', 'logAnalysisResult']);
    const sysCtx    = JSON.stringify({ metrics: MOCK_METRICS, recentDeployments: MOCK_DEPLOYMENTS, recentLogs: MOCK_LOGS.slice(0, 8).map(l => `[${l.level}] [${l.service}] ${l.message}`), timeline: TIMELINE_EVENTS }, null, 2);
    const cacheKey  = CACHE_PREFIX + encodeURIComponent(query + ctx + sysCtx);

    // ── MUST call onStart first ──────────────────────────────────────────────
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
      system:      RCA_AGENT_PROMPT,
      userMessage: `Incident question: "${query}"\n\nSystem context:\n${sysCtx}${ctx}`,
      onStart:     () => {},   // already called above
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
      maxTokens:   3500,
    });
  }

  const response = agent.result;
  const loading  = agent.isRunning;

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <MetricCard label="p99 Latency"     value="1160ms" delta="from 340ms baseline" deltaDir="bad" />
        <MetricCard label="DB Timeouts/min" value="130"    delta="from 2/min"          deltaDir="bad" />
        <MetricCard label="Error Rate"      value="18.4%"  delta="from 0.3% baseline"  deltaDir="bad" />
        <MetricCard label="Circuit Breaker" value="OPEN"   sub="payment-gateway" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card>
          <SectionLabel>Incident event timeline</SectionLabel>
          {TIMELINE_EVENTS.map((evt, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: timelineColors[evt.type], marginTop: 4, flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginRight: 7 }}>{evt.time}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{evt.label}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <SectionLabel>Deployment history</SectionLabel>
          {MOCK_DEPLOYMENTS.map(d => (
            <div key={d.id} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 8, background: d.status === 'incident' ? '#fef2f2' : d.status === 'warning' ? '#fffbeb' : '#f0fdf4', border: `1px solid ${d.status === 'incident' ? '#fecaca' : d.status === 'warning' ? '#fde68a' : '#bbf7d0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{d.version}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.service}</span>
                </div>
                {d.status === 'incident' && <Badge variant="red">⚠ Incident</Badge>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{d.timeLabel} · {d.author}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.changes}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Ask the RCA Agent</SectionLabel>
          {autoFilled && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ Pre-filled from Evidence + Log Analysis — edit freely</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
          {PRESETS.map(p => (
            <button key={p.q} onClick={() => setQuery(p.q)} style={{ background: query === p.q ? '#fef2f2' : 'var(--content-bg)', border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`, color: query === p.q ? '#991b1b' : 'var(--text-secondary)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: query === p.q ? 500 : 400, transition: 'all 0.15s' }}>{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && investigate()} placeholder="Describe the incident or ask what caused it…" style={{ flex: 1 }} />
          <Button variant="primary" onClick={investigate} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
            {loading ? 'Investigating…' : '⚠ Investigate'}
          </Button>
        </div>
      </Card>

      {(response || loading) && (
        <Card className="fade-in">
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Root cause analysis</SectionLabel>
            {loading  && <Spinner size={13} />}
            {!loading && <Badge variant="red">P1 Report</Badge>}
            {!loading && response && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ Runbook Agent pre-filled</span>}
          </div> */}
          <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  }}
>
  <SectionLabel style={{ marginBottom: 0 }}>
    Root Cause Analysis
  </SectionLabel>

  {loading && <Spinner size={13} />}

  {!loading && <Badge variant="red">
    P1 Critical
  </Badge>}

  {!loading && response && (
    <div
      style={{
        marginLeft: 'auto',
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}
    >
      <button
        onClick={copyReport}
        style={{
          fontSize: 11,
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>

      <button
        onClick={downloadMarkdown}
        style={{
          fontSize: 11,
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >
        ⬇ Markdown
      </button>

      <span
        style={{
          fontSize: 11,
          color: '#10b981',
          fontWeight: 500
        }}
      >
        ✓ Runbook Agent pre-filled
      </span>
    </div>
  )}
</div>
          {loading && !response
            ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Correlating logs, metrics, and deployment history…</div>
            : <div style={{ display: 'grid', gap: 12 }}>
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 10
    }}
  >
    <Card style={{ padding: 12 }}>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        Severity
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>
        P1
      </div>
    </Card>

    <Card style={{ padding: 12 }}>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        Confidence
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        92%
      </div>
    </Card>

    <Card style={{ padding: 12 }}>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        Impact
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        High
      </div>
    </Card>

    <Card style={{ padding: 12 }}>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        Status
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        Active
      </div>
    </Card>
  </div>

  <>
  <IncidentReport text={response} />

  <div
    style={{
      marginTop: 16,
      paddingTop: 16,
      borderTop: '1px solid #e2e8f0'
    }}
  >
    <Button
  variant="primary"
  onClick={() => {

    setArchitectureInput(`
You are reviewing the SYSTEM ARCHITECTURE, not performing RCA.

Application:
Payment Platform

Services:
- payment-svc
- checkout-api
- auth-svc

Infrastructure:
- AWS ECS Fargate
- CloudWatch
- PostgreSQL
- OpenSearch
- S3

Recent Incident:
${selectedIncident?.title || 'Detected from Log Explorer'}

Incident Summary:
${response}

Task:
1. Infer the likely architecture.
2. Generate architecture diagram.
3. Identify SPOFs.
4. Review scalability.
5. Review security.
6. Review observability.
7. Recommend improvements.

Do NOT repeat the RCA.
Focus on architecture review only.
`);

    setPlatformTab('arch');
    setActive('platform');
  }}
>
  🏗 Review Architecture
</Button>
  </div>
</>
</div>
          }
        </Card>
      )}
    </div>
  );
}