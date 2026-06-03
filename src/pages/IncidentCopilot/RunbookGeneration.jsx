// // RunbookGeneration.jsx
// import React, { useState } from 'react';
// import { Card, SectionLabel, Badge, PageHeader, Button, Spinner } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are an SRE Runbook Generator. Create detailed, actionable operational runbooks for on-call engineers.

// Format EXACTLY like this:

// RUNBOOK: <title>
// SERVICE: <service name>
// SEVERITY: <P1/P2/P3>
// LAST_UPDATED: <today's date>

// OVERVIEW:
// <2-3 sentences describing the incident type and when to use this runbook>

// DETECTION:
// • <how to detect this issue — specific alert names, metrics, thresholds>
// • <secondary symptoms>

// IMMEDIATE_ACTIONS (first 5 minutes):
// 1. <action with exact command or URL>
// 2. <action>
// 3. <action>

// DIAGNOSIS_STEPS:
// 1. <step with exact CloudWatch query or command>
// 2. <step>
// 3. <step>
// 4. <step>

// REMEDIATION:
// Option A — <quick fix title>:
// 1. <command or action>
// 2. <command or action>

// Option B — <rollback title>:
// 1. <command or action>
// 2. <command or action>

// ESCALATION:
// • <condition to escalate>: notify <team/person>
// • <condition>: page <oncall rotation>

// POST_INCIDENT:
// • <what to document>
// • <what to monitor for 24h after>

// Use realistic AWS CLI commands, kubectl commands, and CloudWatch queries. Be specific.
// IMPORTANT:
// Return ALL sections.
// Do not stop after OVERVIEW.
// Do not omit any section.
// Every section must contain at least 3 detailed steps.`;

// const SERVICES = ['payment-svc', 'auth-svc', 'checkout-api', 'notification-svc', 'inventory-svc', 'order-svc'];
// const INCIDENT_TYPES = [
//   'High latency / SLA breach',
//   'Database connection pool exhausted',
//   'Circuit breaker open',
//   'Memory leak / OOM',
//   'Deployment rollback needed',
//   '5xx error spike',
//   'Service unreachable / 503',
//   'Authentication failures',
// ];
// const SEVERITIES = ['P1 — Critical', 'P2 — High', 'P3 — Medium'];

// function CodeBlock({ children }) {
//   return (
//     <pre style={{
//       background: '#0f172a', color: '#7dd3fc', borderRadius: 8,
//       padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px',
//       lineHeight: 1.6, overflow: 'auto', margin: '6px 0',
//       border: '1px solid #1e293b', whiteSpace: 'pre-wrap',
//     }}>{children}</pre>
//   );
// }

// function RunbookDisplay({ text }) {
//   if (!text) return null;

//   // Split into labeled sections
//   const sectionDefs = [
//     { key: 'OVERVIEW:', bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
//     { key: 'DETECTION:', bg: '#fffbeb', border: '#fde68a', tc: '#92400e' },
//     { key: 'IMMEDIATE_ACTIONS (first 5 minutes):', bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
//     { key: 'DIAGNOSIS_STEPS:', bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
//     { key: 'REMEDIATION:', bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534' },
//     { key: 'ESCALATION:', bg: '#faf5ff', border: '#e9d5ff', tc: '#6b21a8' },
//     { key: 'POST_INCIDENT:', bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
//   ];

//   // Header info
//   const titleMatch = text.match(/RUNBOOK:\s*(.+)/);
//   const sevMatch = text.match(/SEVERITY:\s*(.+)/);
//   const svcMatch = text.match(/SERVICE:\s*(.+)/);

//   const blocks = [];
//   for (let i = 0; i < sectionDefs.length; i++) {
//     const sec = sectionDefs[i];
//     const idx = text.indexOf(sec.key);
//     if (idx === -1) continue;
//     const nextIdx = sectionDefs.slice(i + 1).reduce((acc, s) => {
//       const pos = text.indexOf(s.key, idx + sec.key.length);
//       return pos !== -1 && pos < acc ? pos : acc;
//     }, text.length);
//     const content = text.slice(idx + sec.key.length, nextIdx).trim();
//     blocks.push({ ...sec, content });
//   }

//   const renderContent = (content) => {
//     const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
//     return parts.map((part, i) => {
//       if (part.startsWith('```')) return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
//       if (part.startsWith('`') && part.endsWith('`')) return <code key={i} style={{ fontFamily: 'var(--font-mono)', background: '#1e293b', color: '#7dd3fc', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>{part.slice(1, -1)}</code>;
//       return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
//     });
//   };

//   return (
//     <div>
//       {(titleMatch || sevMatch) && (
//         <Card style={{ marginBottom: 12, padding: '14px 18px', background: '#0f172a', border: '1px solid #1e293b' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
//             <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{titleMatch?.[1]}</span>
//             {svcMatch && <Badge variant="dark">{svcMatch[1]}</Badge>}
//             {sevMatch && <Badge variant={sevMatch[1].includes('P1') ? 'red' : sevMatch[1].includes('P2') ? 'amber' : 'blue'}>{sevMatch[1]}</Badge>}
//           </div>
//         </Card>
//       )}
//       <div style={{ display: 'grid', gap: 10 }}>
//         {blocks.map((b, i) => (
//           <Card key={i} style={{ padding: '13px 16px', background: b.bg, border: `1px solid ${b.border}` }}>
//             <SectionLabel style={{ color: b.tc, marginBottom: 8 }}>{b.key.replace(':', '')}</SectionLabel>
//             <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.75 }}>{renderContent(b.content)}</div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function RunbookPage() {
//   const [service, setService] = useState('payment-svc');
//   const [incidentType, setIncidentType] = useState('Database connection pool exhausted');
//   const [severity, setSeverity] = useState('P1 — Critical');
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   const selectStyle = {
//     padding: '8px 12px', borderRadius: 8, border: '1px solid var(--content-border)',
//     background: 'var(--content-bg)', color: 'var(--text-primary)', fontSize: 13,
//     fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
//   };

//   async function generate() {
//     if (loading) return;
//     setResponse('');
//     setLoading(true);
//     const prompt = `Generate a runbook for:
// Service: ${service}
// Incident type: ${incidentType}
// Severity: ${severity}
// Environment: AWS ap-south-1, production
// Stack: Node.js / TypeScript, PostgreSQL RDS, ElastiCache Redis, ECS Fargate`;
//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: prompt }],
//         maxTokens: 4000,
//         // onChunk: (_, full) => setResponse(full),
//         onChunk: (_, full) => {
//           console.log(full);
//           setResponse(full);
//         },
//         onDone: () => setLoading(false),
//       });
//     } catch (e) {
//       setResponse(`Error: ${e.message}`);
//       setLoading(false);
//     }
//   }

//   function exportMarkdown() {
//     const blob = new Blob([response], { type: 'text/markdown' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `runbook-${service}-${Date.now()}.md`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Runbook Generator"
//         subtitle="Select service + incident type — AI generates a complete operational runbook for on-call engineers."
//       />
//       <Card style={{ marginBottom: 16 }}>
//         <SectionLabel>Configure runbook</SectionLabel>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
//           <div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Service</div>
//             <select value={service} onChange={e => setService(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
//               {SERVICES.map(s => <option key={s}>{s}</option>)}
//             </select>
//           </div>
//           <div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Incident type</div>
//             <select value={incidentType} onChange={e => setIncidentType(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
//               {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
//             </select>
//           </div>
//           <div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Severity</div>
//             <select value={severity} onChange={e => setSeverity(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
//               {SEVERITIES.map(s => <option key={s}>{s}</option>)}
//             </select>
//           </div>
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Button variant="primary" onClick={generate} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Generating…' : '📖 Generate Runbook'}
//           </Button>
//           {response && !loading && (
//             <Button variant="ghost" onClick={exportMarkdown}>⬇ Export Markdown</Button>
//           )}
//         </div>
//       </Card>

//       {(response || loading) && (
//         <div className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Generated runbook</SectionLabel>
//             {loading && <Spinner size={13} />}
//             {!loading && <Badge variant="green">Ready</Badge>}
//           </div>
//           {loading && !response
//             ? <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Building runbook steps…</div></Card>
//             : <pre style={{ whiteSpace: 'pre-wrap' }}>
//               {response}
//               </pre>
//             //  <RunbookDisplay text={response} />
//           }
//         </div>
//       )}
//     </div>
//   );
// }
















// /**
//  * RunbookGeneration.jsx
//  *
//  * Props:
//  *   autoFillService  (string) — pre-select service dropdown from RCA output
//  *   autoFillType     (string) — pre-select incident type dropdown from RCA output
//  *   autoFillSeverity (string) — pre-select severity dropdown from RCA output
//  *   onResult(text)            — called when runbook completes; parent stores it
//  *                               so RecoveryActions + Postmortem can auto-fill
//  *
//  * All dropdowns remain fully editable. Auto-fill only sets the initial selection.
//  */
// import React, { useState, useEffect } from 'react';
// import { Card, SectionLabel, Badge, Button, Spinner } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are an SRE Runbook Generator. Create detailed, actionable operational runbooks for on-call engineers.

// Format EXACTLY like this:

// RUNBOOK: <title>
// SERVICE: <service name>
// SEVERITY: <P1/P2/P3>
// LAST_UPDATED: <today's date>

// OVERVIEW:
// <2-3 sentences describing the incident type and when to use this runbook>

// DETECTION:
// • <how to detect this issue — specific alert names, metrics, thresholds>
// • <secondary symptoms>

// IMMEDIATE_ACTIONS (first 5 minutes):
// 1. <action with exact command or URL>
// 2. <action>
// 3. <action>

// DIAGNOSIS_STEPS:
// 1. <step with exact CloudWatch query or command>
// 2. <step>
// 3. <step>
// 4. <step>

// REMEDIATION:
// Option A — <quick fix title>:
// 1. <command or action>
// 2. <command or action>

// Option B — <rollback title>:
// 1. <command or action>
// 2. <command or action>

// ESCALATION:
// • <condition to escalate>: notify <team/person>
// • <condition>: page <oncall rotation>

// POST_INCIDENT:
// • <what to document>
// • <what to monitor for 24h after>

// Use realistic AWS CLI commands, kubectl commands, and CloudWatch queries. Be specific.
// IMPORTANT:
// Return ALL sections.
// Do not stop after OVERVIEW.
// Do not omit any section.
// Every section must contain at least 3 detailed steps.`;

// const SERVICES = ['payment-svc', 'auth-svc', 'checkout-api', 'notification-svc', 'inventory-svc', 'order-svc'];
// const INCIDENT_TYPES = [
//   'High latency / SLA breach',
//   'Database connection pool exhausted',
//   'Circuit breaker open',
//   'Memory leak / OOM',
//   'Deployment rollback needed',
//   '5xx error spike',
//   'Service unreachable / 503',
//   'Authentication failures',
// ];
// const SEVERITIES = ['P1 — Critical', 'P2 — High', 'P3 — Medium'];

// /** Best-effort match a free-form string to one of the known dropdown options */
// function matchService(text) {
//   if (!text) return null;
//   const t = text.toLowerCase();
//   return SERVICES.find(s => t.includes(s.toLowerCase())) || null;
// }
// function matchType(text) {
//   if (!text) return null;
//   const t = text.toLowerCase();
//   if (t.includes('pool') || t.includes('connection'))   return 'Database connection pool exhausted';
//   if (t.includes('latency') || t.includes('sla'))       return 'High latency / SLA breach';
//   if (t.includes('circuit'))                             return 'Circuit breaker open';
//   if (t.includes('oom') || t.includes('memory'))        return 'Memory leak / OOM';
//   if (t.includes('rollback'))                            return 'Deployment rollback needed';
//   if (t.includes('5xx') || t.includes('500'))           return '5xx error spike';
//   if (t.includes('503') || t.includes('unreachable'))   return 'Service unreachable / 503';
//   if (t.includes('auth') || t.includes('token'))        return 'Authentication failures';
//   return null;
// }
// function matchSeverity(text) {
//   if (!text) return null;
//   const t = text.toLowerCase();
//   if (t.includes('p1'))    return 'P1 — Critical';
//   if (t.includes('p2'))    return 'P2 — High';
//   if (t.includes('p3'))    return 'P3 — Medium';
//   return null;
// }

// function CodeBlock({ children }) {
//   return (
//     <pre style={{ background: '#0f172a', color: '#7dd3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
//       {children}
//     </pre>
//   );
// }

// function RunbookDisplay({ text }) {
//   if (!text) return null;
//   const sectionDefs = [
//     { key: 'OVERVIEW:',                          bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
//     { key: 'DETECTION:',                         bg: '#fffbeb', border: '#fde68a', tc: '#92400e' },
//     { key: 'IMMEDIATE_ACTIONS (first 5 minutes):',bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
//     { key: 'DIAGNOSIS_STEPS:',                   bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
//     { key: 'REMEDIATION:',                       bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534' },
//     { key: 'ESCALATION:',                        bg: '#faf5ff', border: '#e9d5ff', tc: '#6b21a8' },
//     { key: 'POST_INCIDENT:',                     bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
//   ];

//   const titleMatch = text.match(/RUNBOOK:\s*(.+)/);
//   const sevMatch   = text.match(/SEVERITY:\s*(.+)/);
//   const svcMatch   = text.match(/SERVICE:\s*(.+)/);

//   const blocks = [];
//   for (let i = 0; i < sectionDefs.length; i++) {
//     const sec = sectionDefs[i];
//     const idx = text.indexOf(sec.key);
//     if (idx === -1) continue;
//     const nextIdx = sectionDefs.slice(i + 1).reduce((acc, s) => {
//       const pos = text.indexOf(s.key, idx + sec.key.length);
//       return pos !== -1 && pos < acc ? pos : acc;
//     }, text.length);
//     const content = text.slice(idx + sec.key.length, nextIdx).trim();
//     blocks.push({ ...sec, content });
//   }

//   const renderContent = (content) => {
//     const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);
//     return parts.map((part, i) => {
//       if (part.startsWith('```'))
//         return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
//       if (part.startsWith('`') && part.endsWith('`'))
//         return <code key={i} style={{ fontFamily: 'var(--font-mono)', background: '#1e293b', color: '#7dd3fc', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>{part.slice(1, -1)}</code>;
//       return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
//     });
//   };

//   return (
//     <div>
//       {(titleMatch || sevMatch) && (
//         <Card style={{ marginBottom: 12, padding: '14px 18px', background: '#0f172a', border: '1px solid #1e293b' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
//             <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{titleMatch?.[1]}</span>
//             {svcMatch && <Badge variant="dark">{svcMatch[1]}</Badge>}
//             {sevMatch && <Badge variant={sevMatch[1].includes('P1') ? 'red' : sevMatch[1].includes('P2') ? 'amber' : 'blue'}>{sevMatch[1]}</Badge>}
//           </div>
//         </Card>
//       )}
//       <div style={{ display: 'grid', gap: 10 }}>
//         {blocks.map((b, i) => (
//           <Card key={i} style={{ padding: '13px 16px', background: b.bg, border: `1px solid ${b.border}` }}>
//             <SectionLabel style={{ color: b.tc, marginBottom: 8 }}>{b.key.replace(':', '')}</SectionLabel>
//             <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.75 }}>{renderContent(b.content)}</div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function RunbookGeneration({ autoFillService, autoFillType, autoFillSeverity, onResult }) {
//   const [service,      setService]      = useState('payment-svc');
//   const [incidentType, setIncidentType] = useState('Database connection pool exhausted');
//   const [severity,     setSeverity]     = useState('P1 — Critical');
//   const [response,     setResponse]     = useState('');
//   const [loading,      setLoading]      = useState(false);
//   const [autoFilled,   setAutoFilled]   = useState(false);

//   /**
//    * Auto-fill effect:
//    * When RCA completes, the parent parses its output and passes the best-matched
//    * service/type/severity here. We apply them only if they're non-null and we
//    * haven't already applied a fill (to avoid overwriting manual edits on re-renders).
//    */
//   useEffect(() => {
//     let changed = false;
//     const svc  = matchService(autoFillService);
//     const type = matchType(autoFillType);
//     const sev  = matchSeverity(autoFillSeverity);
//     if (svc)  { setService(svc);           changed = true; }
//     if (type) { setIncidentType(type);     changed = true; }
//     if (sev)  { setSeverity(sev);          changed = true; }
//     if (changed) setAutoFilled(true);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [autoFillService, autoFillType, autoFillSeverity]);

//   const selectStyle = {
//     padding: '8px 12px', borderRadius: 8, border: '1px solid var(--content-border)',
//     background: 'var(--content-bg)', color: 'var(--text-primary)', fontSize: 13,
//     fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none', width: '100%',
//   };

//   async function generate() {
//     if (loading) return;
//     setResponse('');
//     setLoading(true);
//     const prompt = `Generate a runbook for:
// Service: ${service}
// Incident type: ${incidentType}
// Severity: ${severity}
// Environment: AWS ap-south-1, production
// Stack: Node.js / TypeScript, PostgreSQL RDS, ElastiCache Redis, ECS Fargate`;
//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: prompt }],
//         maxTokens: 4000,
//         onChunk: (_, full) => setResponse(full),
//         onDone: (full) => {
//           setLoading(false);
//           onResult?.(full);  // feed RecoveryActions + Postmortem
//         },
//       });
//     } catch (e) {
//       setResponse(`Error: ${e.message}`);
//       setLoading(false);
//     }
//   }

//   function exportMarkdown() {
//     const blob = new Blob([response], { type: 'text/markdown' });
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(blob);
//     a.download = `runbook-${service}-${Date.now()}.md`;
//     a.click();
//     URL.revokeObjectURL(a.href);
//   }

//   return (
//     <div className="fade-in">
//       <Card style={{ marginBottom: 16 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//           <SectionLabel style={{ marginBottom: 0 }}>Configure runbook</SectionLabel>
//           {autoFilled && (
//             <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
//               ✓ Pre-filled from RCA — edit freely
//             </span>
//           )}
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
//           <div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Service</div>
//             <select value={service} onChange={e => setService(e.target.value)} style={selectStyle}>
//               {SERVICES.map(s => <option key={s}>{s}</option>)}
//             </select>
//           </div>
//           <div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Incident type</div>
//             <select value={incidentType} onChange={e => setIncidentType(e.target.value)} style={selectStyle}>
//               {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
//             </select>
//           </div>
//           <div>
//             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Severity</div>
//             <select value={severity} onChange={e => setSeverity(e.target.value)} style={selectStyle}>
//               {SEVERITIES.map(s => <option key={s}>{s}</option>)}
//             </select>
//           </div>
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Button variant="primary" onClick={generate} disabled={loading}
//             icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Generating…' : '📖 Generate Runbook'}
//           </Button>
//           {response && !loading && (
//             <Button variant="ghost" onClick={exportMarkdown}>⬇ Export Markdown</Button>
//           )}
//         </div>
//       </Card>

//       {(response || loading) && (
//         <div className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Generated runbook</SectionLabel>
//             {loading  && <Spinner size={13} />}
//             {!loading && <Badge variant="green">Ready</Badge>}
//             {!loading && response && (
//               <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 500 }}>
//                 ✓ Recovery Actions tab pre-filled
//               </span>
//             )}
//           </div>
//           {loading && !response
//             ? <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Building runbook steps…</div></Card>
//             : <RunbookDisplay text={response} />
//           }
//         </div>
//       )}
//     </div>
//   );
// }
















/**
 * RunbookGeneration.jsx — Runbook Agent
 * Fix: onStart() called before cache check.
 */
import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Badge, Button, Spinner } from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';
import { runAgent, buildContext } from './agentRunner.js';
import { RUNBOOK_AGENT_PROMPT } from './agents/prompts.js';

const CACHE_PREFIX = 'runbook-generation-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

const SERVICES       = ['payment-svc','auth-svc','checkout-api','notification-svc','inventory-svc','order-svc'];
const INCIDENT_TYPES = ['High latency / SLA breach','Database connection pool exhausted','Circuit breaker open','Memory leak / OOM','Deployment rollback needed','5xx error spike','Service unreachable / 503','Authentication failures'];
const SEVERITIES     = ['P1 — Critical','P2 — High','P3 — Medium'];

function matchService(t) { if (!t) return null; const l=t.toLowerCase(); return SERVICES.find(s=>l.includes(s.toLowerCase()))||null; }
function matchType(t) {
  if (!t) return null; const l=t.toLowerCase();
  if (l.includes('pool')||l.includes('connection')) return 'Database connection pool exhausted';
  if (l.includes('latency')||l.includes('sla'))     return 'High latency / SLA breach';
  if (l.includes('circuit'))                         return 'Circuit breaker open';
  if (l.includes('oom')||l.includes('memory'))       return 'Memory leak / OOM';
  if (l.includes('rollback'))                        return 'Deployment rollback needed';
  if (l.includes('5xx')||l.includes('500'))          return '5xx error spike';
  if (l.includes('503')||l.includes('unreachable'))  return 'Service unreachable / 503';
  if (l.includes('auth')||l.includes('token'))       return 'Authentication failures';
  return null;
}
function matchSeverity(t) { if (!t) return null; const l=t.toLowerCase(); if(l.includes('p1'))return 'P1 — Critical'; if(l.includes('p2'))return 'P2 — High'; if(l.includes('p3'))return 'P3 — Medium'; return null; }

function CodeBlock({ children }) {
  return <pre style={{ background: '#0f172a', color: '#7dd3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>{children}</pre>;
}

function RunbookDisplay({ text }) {
  if (!text) return null;
  const defs = [
    { key: 'OVERVIEW:',                            bg:'#f8fafc',border:'#e2e8f0',tc:'#475569' },
    { key: 'DETECTION:',                           bg:'#fffbeb',border:'#fde68a',tc:'#92400e' },
    { key: 'IMMEDIATE_ACTIONS (first 5 minutes):', bg:'#fef2f2',border:'#fecaca',tc:'#991b1b' },
    { key: 'DIAGNOSIS_STEPS:',                     bg:'#eff6ff',border:'#bfdbfe',tc:'#1d4ed8' },
    { key: 'REMEDIATION:',                         bg:'#f0fdf4',border:'#bbf7d0',tc:'#166534' },
    { key: 'ESCALATION:',                          bg:'#faf5ff',border:'#e9d5ff',tc:'#6b21a8' },
    { key: 'POST_INCIDENT:',                       bg:'#f8fafc',border:'#e2e8f0',tc:'#475569' },
  ];
  const titleM=text.match(/RUNBOOK:\s*(.+)/); const sevM=text.match(/SEVERITY:\s*(.+)/); const svcM=text.match(/SERVICE:\s*(.+)/);
  const blocks=[];
  for (let i=0;i<defs.length;i++){const sec=defs[i];const idx=text.indexOf(sec.key);if(idx===-1)continue;const nextIdx=defs.slice(i+1).reduce((acc,s)=>{const p=text.indexOf(s.key,idx+sec.key.length);return p!==-1&&p<acc?p:acc;},text.length);blocks.push({...sec,content:text.slice(idx+sec.key.length,nextIdx).trim()});}
  const renderContent=(content)=>content.split(/(```[\s\S]*?```|`[^`]+`)/g).map((p,i)=>{if(p.startsWith('```'))return<CodeBlock key={i}>{p.replace(/^```[^\n]*\n?/,'').replace(/```$/,'')}</CodeBlock>;if(p.startsWith('`')&&p.endsWith('`'))return<code key={i} style={{fontFamily:'var(--font-mono)',background:'#1e293b',color:'#7dd3fc',padding:'1px 5px',borderRadius:3,fontSize:11}}>{p.slice(1,-1)}</code>;return<span key={i} style={{whiteSpace:'pre-wrap'}}>{p}</span>;});
  return (
    <div>
      {(titleM||sevM)&&<Card style={{marginBottom:12,padding:'14px 18px',background:'#0f172a',border:'1px solid #1e293b'}}><div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}><span style={{fontFamily:'var(--font-display)',fontSize:15,fontWeight:700,color:'#f1f5f9'}}>{titleM?.[1]}</span>{svcM&&<Badge variant="dark">{svcM[1]}</Badge>}{sevM&&<Badge variant={sevM[1].includes('P1')?'red':sevM[1].includes('P2')?'amber':'blue'}>{sevM[1]}</Badge>}</div></Card>}
      <div style={{display:'grid',gap:10}}>{blocks.map((b,i)=><Card key={i} style={{padding:'13px 16px',background:b.bg,border:`1px solid ${b.border}`}}><SectionLabel style={{color:b.tc,marginBottom:8}}>{b.key.replace(':','')}</SectionLabel><div style={{fontSize:12.5,color:'var(--text-primary)',lineHeight:1.75}}>{renderContent(b.content)}</div></Card>)}</div>
    </div>
  );
}

export default function RunbookGeneration() {
  const agent = useAgent('runbook');
  const { rcaResult, evidenceResult } = agent.upstreamContext;

  const [service,      setService]      = useState('payment-svc');
  const [incidentType, setIncidentType] = useState('Database connection pool exhausted');
  const [severity,     setSeverity]     = useState('P1 — Critical');
  const [autoFilled,   setAutoFilled]   = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const combined = (rcaResult||'') + ' ' + (evidenceResult||'');
    if (!combined.trim()) return;
    let changed=false;
    const svc=matchService(combined); const type=matchType(combined); const sev=matchSeverity(combined);
    if (svc)  { setService(svc);       changed=true; }
    if (type) { setIncidentType(type); changed=true; }
    if (sev)  { setSeverity(sev);      changed=true; }
    if (changed) setAutoFilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rcaResult, evidenceResult]);

  const selectStyle = { padding:'8px 12px',borderRadius:8,border:'1px solid var(--content-border)',background:'var(--content-bg)',color:'var(--text-primary)',fontSize:13,fontFamily:'var(--font-body)',cursor:'pointer',outline:'none',width:'100%' };

  async function generate() {
    if (agent.isRunning) return;

    const ctx      = buildContext(agent.upstreamContext, ['rcaResult', 'evidenceResult']);
    const prompt   = `Generate a runbook for:\nService: ${service}\nIncident type: ${incidentType}\nSeverity: ${severity}\nEnvironment: AWS ap-south-1, production\nStack: Node.js/TypeScript, PostgreSQL RDS, ElastiCache Redis, ECS Fargate${ctx}`;
    const cacheKey = CACHE_PREFIX + encodeURIComponent(service + incidentType + severity + ctx);

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
      system:      RUNBOOK_AGENT_PROMPT,
      userMessage: prompt,
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
      maxTokens:   6000,
    });
  }

  function exportMarkdown() {
    const blob=new Blob([agent.result],{type:'text/markdown'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`runbook-${service}-${Date.now()}.md`; a.click(); URL.revokeObjectURL(a.href);
  }
  function copyReport() {
  navigator.clipboard.writeText(response);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
}

  const response = agent.result; const loading = agent.isRunning;

  return (
    <div className="fade-in">
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Configure Runbook Agent</SectionLabel>
          {autoFilled && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ Pre-filled from RCA Agent — edit freely</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><div style={{fontSize:11,color:'var(--text-muted)',marginBottom:5,fontWeight:500}}>Service</div><select value={service} onChange={e=>setService(e.target.value)} style={selectStyle}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div><div style={{fontSize:11,color:'var(--text-muted)',marginBottom:5,fontWeight:500}}>Incident type</div><select value={incidentType} onChange={e=>setIncidentType(e.target.value)} style={selectStyle}>{INCIDENT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><div style={{fontSize:11,color:'var(--text-muted)',marginBottom:5,fontWeight:500}}>Severity</div><select value={severity} onChange={e=>setSeverity(e.target.value)} style={selectStyle}>{SEVERITIES.map(s=><option key={s}>{s}</option>)}</select></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" onClick={generate} disabled={loading} icon={loading?<Spinner size={14} color="#fff"/>:null}>{loading?'Generating…':'📖 Generate Runbook'}</Button>
          {response&&!loading&&<Button variant="ghost" onClick={exportMarkdown}>⬇ Export Markdown</Button>}
        </div>
      </Card>
      {(response||loading)&&(
        <div className="fade-in">
          {/* <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <SectionLabel style={{marginBottom:0}}>Generated Runbook</SectionLabel>
            {loading&&<Spinner size={13}/>}
            {!loading&&<Badge variant="green">Ready</Badge>}
            {!loading&&response&&<span style={{marginLeft:'auto',fontSize:11,color:'#10b981',fontWeight:500}}>✓ Recovery Agent pre-filled</span>}
          </div> */}
          <div
  style={{
    display:'flex',
    alignItems:'center',
    gap:8,
    marginBottom:12
  }}
>
  <SectionLabel style={{marginBottom:0}}>
    Generated Runbook
  </SectionLabel>

  {loading && <Spinner size={13}/>}

  {!loading && (
    <Badge variant="green">
      Ready
    </Badge>
  )}

  {!loading && response && (
    <div
      style={{
        marginLeft:'auto',
        display:'flex',
        gap:8,
        alignItems:'center'
      }}
    >
      <button
        onClick={copyReport}
        style={{
          fontSize:11,
          border:'1px solid #cbd5e1',
          borderRadius:6,
          padding:'4px 8px',
          cursor:'pointer'
        }}
      >
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>

      <button
        onClick={exportMarkdown}
        style={{
          fontSize:11,
          border:'1px solid #cbd5e1',
          borderRadius:6,
          padding:'4px 8px',
          cursor:'pointer'
        }}
      >
        ⬇ Markdown
      </button>

      <span
        style={{
          fontSize:11,
          color:'#10b981',
          fontWeight:500
        }}
      >
        ✓ Recovery Agent pre-filled
      </span>
    </div>
  )}
</div>
          {loading&&!response?<Card><div style={{display:'flex',gap:8,alignItems:'center',color:'var(--text-muted)',fontSize:13}}><Spinner/>Building runbook steps…</div></Card>:<div
  style={{
    display:'grid',
    gap:12
  }}
>
  <div
    style={{
      display:'grid',
      gridTemplateColumns:'repeat(4,1fr)',
      gap:10
    }}
  >
    <Card style={{padding:12}}>
      <div style={{fontSize:11,color:'#64748b'}}>
        Service
      </div>
      <div style={{fontSize:18,fontWeight:700}}>
        {service}
      </div>
    </Card>

    <Card style={{padding:12}}>
      <div style={{fontSize:11,color:'#64748b'}}>
        Severity
      </div>
      <div
        style={{
          fontSize:18,
          fontWeight:700,
          color:'#dc2626'
        }}
      >
        {severity.split('—')[0]}
      </div>
    </Card>

    <Card style={{padding:12}}>
      <div style={{fontSize:11,color:'#64748b'}}>
        Incident Type
      </div>
      <div
        style={{
          fontSize:14,
          fontWeight:700
        }}
      >
        {incidentType}
      </div>
    </Card>

    <Card style={{padding:12}}>
      <div style={{fontSize:11,color:'#64748b'}}>
        Status
      </div>
      <div
        style={{
          fontSize:18,
          fontWeight:700,
          color:'#16a34a'
        }}
      >
        Ready
      </div>
    </Card>
  </div>

  <RunbookDisplay text={response}/>
</div>}
        </div>
      )}
    </div>
  );
}
