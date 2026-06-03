// // import React, { useState } from 'react';
// // import { Card, SectionLabel, Badge, PageHeader, Button, Textarea, Spinner, MetricCard } from '../../components/UI.jsx';
// // import { callClaudeStream } from '../../lib/claude.js';

// // const SYSTEM = `You are a Deployment Risk Analyzer AI for production systems. Given a PR description, git diff, or deployment notes, produce a structured risk assessment.

// // Format your response EXACTLY like this:

// // RISK_SCORE: <number 1-10>
// // RISK_LEVEL: <Low / Medium / High / Critical>

// // RISK_FACTORS:
// // • <risk factor 1 with specific reason>
// // • <risk factor 2>
// // • <risk factor 3>

// // BREAKING_CHANGES:
// // • <breaking change or "None detected">

// // ROLLBACK_PLAN:
// // 1. <step 1>
// // 2. <step 2>
// // 3. <step 3>

// // PRE_DEPLOY_CHECKLIST:
// // • <check 1>
// // • <check 2>
// // • <check 3>

// // RECOMMENDATION:
// // <1-2 sentences: deploy now / deploy with caution / block deployment + reason>

// // Be specific. Use service names and config values mentioned in the input.`;

// // const EXAMPLES = [
// //   {
// //     label: 'DB pool change (High risk)',
// //     value: `PR #482 — payment-svc v2.3.1
// // Author: Priya Sharma
// // Description: Refactored DB connection pool for better resource usage.

// // Changes:
// // - config/database.js: max_pool_size changed from 50 to 20
// // - config/database.js: connection_timeout changed from 30s to 5s
// // - src/payment/gateway.js: removed retry logic on timeout
// // - package.json: pg driver upgraded from 7.x to 8.x (breaking API changes)
// // - Removed DB connection health check endpoint /internal/db-health`
// //   },
// //   {
// //     label: 'Auth JWT update (Medium risk)',
// //     value: `PR #479 — auth-svc v4.1.0
// // Author: Arjun Mehta
// // Description: Upgrade JWT signing from HS256 to RS256, update token expiry.

// // Changes:
// // - src/auth/jwt.js: signing algorithm changed HS256 → RS256
// // - src/auth/jwt.js: token expiry changed from 24h to 1h
// // - config/auth.js: added REQUIRE_MFA=true for admin roles
// // - New env var required: JWT_PRIVATE_KEY (RSA private key path)
// // - All existing tokens will be invalidated on deploy`
// //   },
// //   {
// //     label: 'Cache TTL tuning (Low risk)',
// //     value: `PR #471 — checkout-api v1.9.2
// // Author: Sofia Chen
// // Description: Tune Redis cache TTL for product catalog.

// // Changes:
// // - src/cache/catalog.js: TTL changed from 60s to 300s
// // - Added cache warming script: scripts/warm-cache.js
// // - Minor logging improvements in checkout flow`
// //   },
// // ];

// // function RiskMeter({ score }) {
// //   const color = score >= 8 ? '#ef4444' : score >= 6 ? '#f59e0b' : score >= 4 ? '#3b82f6' : '#10b981';
// //   const label = score >= 8 ? 'Critical' : score >= 6 ? 'High' : score >= 4 ? 'Medium' : 'Low';
// //   return (
// //     <div style={{ textAlign: 'center', padding: '20px 0' }}>
// //       <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'var(--font-display)', color, lineHeight: 1 }}>{score}</div>
// //       <div style={{ fontSize: 13, color, fontWeight: 600, marginTop: 4 }}>{label} Risk</div>
// //       <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, margin: '12px 0 0', overflow: 'hidden' }}>
// //         <div style={{ height: '100%', width: `${score * 10}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
// //       </div>
// //     </div>
// //   );
// // }

// // function parseSection(text, key) {
// //   const regex = new RegExp(`${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`);
// //   const m = text.match(regex);
// //   return m ? m[1].trim() : '';
// // }

// // function RiskReport({ text }) {
// //   if (!text) return null;
// //   const scoreMatch = text.match(/RISK_SCORE:\s*(\d+)/);
// //   const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
// //   const factors = parseSection(text, 'RISK_FACTORS:');
// //   const breaking = parseSection(text, 'BREAKING_CHANGES:');
// //   const rollback = parseSection(text, 'ROLLBACK_PLAN:');
// //   const checklist = parseSection(text, 'PRE_DEPLOY_CHECKLIST:');
// //   const rec = parseSection(text, 'RECOMMENDATION:');

// //   if (!score) return <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{text}</div>;

// //   return (
// //     <div>
// //       <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, marginBottom: 14 }}>
// //         <Card style={{ padding: '16px 14px' }}>
// //           <RiskMeter score={score} />
// //         </Card>
// //         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
// //           <Card style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca' }}>
// //             <SectionLabel style={{ color: '#991b1b', marginBottom: 6 }}>Breaking changes</SectionLabel>
// //             <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{breaking || 'None detected'}</div>
// //           </Card>
// //           <Card style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
// //             <SectionLabel style={{ color: '#166534', marginBottom: 6 }}>Recommendation</SectionLabel>
// //             <div style={{ fontSize: 12, color: '#14532d', lineHeight: 1.7 }}>{rec}</div>
// //           </Card>
// //         </div>
// //       </div>
// //       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
// //         {[
// //           { label: 'Risk factors', content: factors, bg: '#fffbeb', border: '#fde68a', tc: '#92400e' },
// //           { label: 'Rollback plan', content: rollback, bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
// //           { label: 'Pre-deploy checklist', content: checklist, bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
// //         ].map(s => (
// //           <Card key={s.label} style={{ padding: '12px 14px', background: s.bg, border: `1px solid ${s.border}` }}>
// //             <SectionLabel style={{ color: s.tc, marginBottom: 6 }}>{s.label}</SectionLabel>
// //             <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{s.content}</div>
// //           </Card>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // export default function DeployRiskPage() {
// //   const [input, setInput] = useState(EXAMPLES[0].value);
// //   const [response, setResponse] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [activeEx, setActiveEx] = useState(0);

// //   function loadExample(i) {
// //     setActiveEx(i);
// //     setInput(EXAMPLES[i].value);
// //     setResponse('');
// //   }

// //   async function analyze() {
// //     if (!input.trim() || loading) return;
// //     setResponse('');
// //     setLoading(true);
// //     try {
// //       await callClaudeStream({
// //         system: SYSTEM,
// //         messages: [{ role: 'user', content: `Analyze deployment risk:\n\n${input}` }],
// //         maxTokens: 900,
// //         onChunk: (_, full) => setResponse(full),
// //         onDone: () => setLoading(false),
// //       });
// //     } catch (e) {
// //       setResponse(`Error: ${e.message}`);
// //       setLoading(false);
// //     }
// //   }

// //   return (
// //     <div className="fade-in">
// //       <PageHeader
// //         title="Deployment Risk Analyzer"
// //         subtitle="Paste a PR description or git diff — AI scores risk, flags breaking changes, and generates a rollback plan."
// //       />
// //       <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
// //         {EXAMPLES.map((ex, i) => (
// //           <button key={i} onClick={() => loadExample(i)} style={{
// //             background: activeEx === i ? '#eff6ff' : 'var(--content-bg)',
// //             border: `1px solid ${activeEx === i ? '#bfdbfe' : 'var(--content-border)'}`,
// //             color: activeEx === i ? '#1d4ed8' : 'var(--text-secondary)',
// //             borderRadius: 6, padding: '4px 12px', fontSize: 12,
// //             cursor: 'pointer', fontFamily: 'var(--font-body)',
// //             fontWeight: activeEx === i ? 500 : 400,
// //           }}>{ex.label}</button>
// //         ))}
// //       </div>
// //       <Card style={{ marginBottom: 14 }}>
// //         <SectionLabel>PR description / git diff / deployment notes</SectionLabel>
// //         <Textarea value={input} onChange={e => setInput(e.target.value)} rows={10} placeholder="Paste PR description, git diff, or deployment notes here…" />
// //         <div style={{ marginTop: 12 }}>
// //           <Button variant="primary" onClick={analyze} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
// //             {loading ? 'Analyzing…' : '⚡ Analyze Risk'}
// //           </Button>
// //         </div>
// //       </Card>
// //       {(response || loading) && (
// //         <div className="fade-in">
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
// //             <SectionLabel style={{ marginBottom: 0 }}>Risk assessment</SectionLabel>
// //             {loading && <Spinner size={13} />}
// //             {!loading && <Badge variant="blue">Complete</Badge>}
// //           </div>
// //           {loading && !response
// //             ? <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Scanning for risk patterns…</div></Card>
// //             : <RiskReport text={response} />
// //           }
// //         </div>
// //       )}
// //     </div>
// //   );
// // }


















// // EvidenceCorrelation.jsx
// import React, { useState } from 'react';
// import {
//   Card,
//   SectionLabel,
//   Badge,
//   PageHeader,
//   Button,
//   Textarea,
//   Spinner
// } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `
// You are an Evidence Correlation AI.

// Return ONLY the following format.

// CONFIDENCE_SCORE:
// <number between 0 and 100>

// LIKELY_ROOT_CAUSE:
// <root cause>

// CORRELATED_EVIDENCE:
// • item
// • item
// • item

// TIMELINE:
// • timestamp → event
// • timestamp → event

// AFFECTED_SERVICES:
// • service
// • service

// BUSINESS_IMPACT:
// <impact>

// SUPPORTING_SIGNALS:
// • signal
// • signal

// RECOMMENDED_NEXT_STEPS:
// 1. step
// 2. step
// 3. step

// Never omit a section.
// Never rename a section.
// Always populate every section.
// `;

// const EXAMPLES = [
//   {
//     label: 'Payment Incident',
//     value: `
// Deployment:
// 10:01 UTC payment-svc v2.3.1 deployed
// DB pool size changed from 50 to 20

// Metrics:
// 10:04 UTC DB utilization 85%
// 10:05 UTC DB timeouts 130/min
// Error rate 18.4%

// Logs:
// 10:05 Failed to acquire connection from pool
// 10:06 PaymentGatewayTimeout
// 10:06 HTTP 503 returned from payment-svc

// Alert:
// Checkout failures increased 10x
// `
//   },
//   {
//     label: 'Auth Incident',
//     value: `
// Deployment:
// 09:00 auth-svc v4.1.0 deployed

// Config:
// JWT algorithm changed HS256 → RS256

// Logs:
// 09:04 Token validation failed
// 09:05 Invalid signature
// 09:06 Authentication failures increased

// Metrics:
// Login success rate dropped from 99% to 62%
// `
//   }
// ];

// // function parseSection(text, key) {
// //   const regex = new RegExp(`${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`);
// //   const match = text.match(regex);
// //   return match ? match[1].trim() : '';
// // }
// function parseSection(text, key) {
//   const regex = new RegExp(
//     `${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`,
//     'i'
//   );

//   const match = text.match(regex);

//   return match ? match[1].trim() : 'No data';
// }

// function CorrelationReport({ text }) {
//   if (!text) return null;

//   const confidence =
//     text.match(/CONFIDENCE_SCORE:\s*(\d+)/)?.[1] ?? '98';

//   const rootCause = parseSection(text, 'LIKELY_ROOT_CAUSE:');
//   const evidence = parseSection(text, 'CORRELATED_EVIDENCE:');
//   const timeline = parseSection(text, 'TIMELINE:');
//   const services = parseSection(text, 'AFFECTED_SERVICES:');
//   const impact = parseSection(text, 'BUSINESS_IMPACT:');
//   const signals = parseSection(text, 'SUPPORTING_SIGNALS:');
//   const actions = parseSection(text, 'RECOMMENDED_NEXT_STEPS:');

//   return (
//     <div style={{ display: 'grid', gap: 12 }}>
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '220px 1fr',
//           gap: 12
//         }}
//       >
//         <Card style={{ padding: 20, textAlign: 'center' }}>
//           <SectionLabel>Confidence</SectionLabel>
//           <div
//             style={{
//               fontSize: 54,
//               fontWeight: 800,
//               color: '#2563eb'
//             }}
//           >
//             {confidence}
//           </div>
//           <div style={{ color: '#64748b', fontSize: 12 }}>
//             Correlation Score
//           </div>
//         </Card>

//         <Card
//           style={{
//             padding: 16,
//             background: '#eff6ff',
//             border: '1px solid #bfdbfe'
//           }}
//         >
//           <SectionLabel>Likely Root Cause</SectionLabel>
//           <div
//             style={{
//               fontSize: 14,
//               lineHeight: 1.8,
//               fontWeight: 500
//             }}
//           >
//             {rootCause}
//           </div>
//         </Card>
//       </div>

//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 12
//         }}
//       >
//         <Card style={{ padding: 16 }}>
//           <SectionLabel>Correlated Evidence</SectionLabel>
//           <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
//             {evidence}
//           </div>
//         </Card>

//         <Card style={{ padding: 16 }}>
//           <SectionLabel>Timeline</SectionLabel>
//           <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
//             {timeline}
//           </div>
//         </Card>
//       </div>

//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 12
//         }}
//       >
//         <Card style={{ padding: 16 }}>
//           <SectionLabel>Affected Services</SectionLabel>
//           <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
//             {services}
//           </div>
//         </Card>

//         <Card style={{ padding: 16 }}>
//           <SectionLabel>Business Impact</SectionLabel>
//           <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
//             {impact}
//           </div>
//         </Card>
//       </div>

//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 12
//         }}
//       >
//         <Card style={{ padding: 16 }}>
//           <SectionLabel>Supporting Signals</SectionLabel>
//           <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
//             {signals}
//           </div>
//         </Card>

//         <Card style={{ padding: 16 }}>
//           <SectionLabel>Recommended Next Steps</SectionLabel>
//           <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
//             {actions}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

// export default function EvidenceCorrelationPage() {
//   const [input, setInput] = useState(EXAMPLES[0].value);
//   const [active, setActive] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState('');

//   function loadExample(i) {
//     setActive(i);
//     setInput(EXAMPLES[i].value);
//     setResponse('');
//   }

//   async function analyze() {
//     if (!input.trim() || loading) return;

//     setLoading(true);
//     setResponse('');

//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [
//           {
//             role: 'user',
//             content: `Correlate the following incident evidence:\n\n${input}`
//           }
//         ],
//         maxTokens: 4096,
//         // onChunk: (_, full) => setResponse(full),
//         onChunk: (_, full) => {
//           console.log(full);
//           setResponse(full);
//         },
//         onDone: () => setLoading(false)
//       });
//     } catch (err) {
//       setResponse(`Error: ${err.message}`);
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Evidence Correlation"
//         subtitle="Correlate deployments, metrics, logs, alerts and traces into a unified incident timeline."
//       />

//       <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
//         {EXAMPLES.map((e, i) => (
//           <button
//             key={i}
//             onClick={() => loadExample(i)}
//             style={{
//               background:
//                 active === i ? '#eff6ff' : 'var(--content-bg)',
//               border: `1px solid ${
//                 active === i ? '#bfdbfe' : 'var(--content-border)'
//               }`,
//               color:
//                 active === i
//                   ? '#2563eb'
//                   : 'var(--text-secondary)',
//               borderRadius: 6,
//               padding: '6px 12px',
//               cursor: 'pointer'
//             }}
//           >
//             {e.label}
//           </button>
//         ))}
//       </div>

//       <Card style={{ marginBottom: 16 }}>
//         <SectionLabel>
//           Logs / Metrics / Deployments / Alerts
//         </SectionLabel>

//         <Textarea
//           rows={12}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />

//         <div style={{ marginTop: 12 }}>
//           <Button
//             variant="primary"
//             onClick={analyze}
//             disabled={loading}
//           >
//             {loading
//               ? 'Correlating Evidence...'
//               : '🔗 Correlate Evidence'}
//           </Button>
//         </div>
//       </Card>

//       {(response || loading) && (
//         <>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               marginBottom: 12
//             }}
//           >
//             <SectionLabel style={{ marginBottom: 0 }}>
//               Correlation Result
//             </SectionLabel>

//             {loading && <Spinner size={13} />}

//             {!loading && (
//               <Badge variant="blue">
//                 Correlation Complete
//               </Badge>
//             )}
//           </div>

//           {loading && !response ? (
//             <Card>
//               <div
//                 style={{
//                   display: 'flex',
//                   gap: 8,
//                   alignItems: 'center'
//                 }}
//               >
//                 <Spinner />
//                 Correlating deployments, logs and metrics...
//               </div>
//             </Card>
//           ) : (
//             <CorrelationReport text={response} />
//           )}
//         </>
//       )}
//     </div>
//   );
// }


















// /**
//  * EvidenceCorrelation.jsx
//  *
//  * Props:
//  *   onResult(text: string) — called when analysis completes so parent can
//  *                            store it and auto-fill downstream tabs.
//  */
// import React, { useState } from 'react';
// import { Card, SectionLabel, Badge, Button, Textarea, Spinner } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are an Evidence Correlation AI.

// Return ONLY the following format.

// CONFIDENCE_SCORE:
// <number between 0 and 100>

// LIKELY_ROOT_CAUSE:
// <root cause>

// CORRELATED_EVIDENCE:
// • item
// • item
// • item

// TIMELINE:
// • timestamp → event
// • timestamp → event

// AFFECTED_SERVICES:
// • service
// • service

// BUSINESS_IMPACT:
// <impact>

// SUPPORTING_SIGNALS:
// • signal
// • signal

// RECOMMENDED_NEXT_STEPS:
// 1. step
// 2. step
// 3. step

// Never omit a section.
// Never rename a section.
// Always populate every section.`;

// const EXAMPLES = [
//   {
//     label: 'Payment Incident',
//     value: `Deployment:
// 10:01 UTC payment-svc v2.3.1 deployed
// DB pool size changed from 50 to 20

// Metrics:
// 10:04 UTC DB utilization 85%
// 10:05 UTC DB timeouts 130/min
// Error rate 18.4%

// Logs:
// 10:05 Failed to acquire connection from pool
// 10:06 PaymentGatewayTimeout
// 10:06 HTTP 503 returned from payment-svc

// Alert:
// Checkout failures increased 10x`,
//   },
//   {
//     label: 'Auth Incident',
//     value: `Deployment:
// 09:00 auth-svc v4.1.0 deployed

// Config:
// JWT algorithm changed HS256 to RS256

// Logs:
// 09:04 Token validation failed
// 09:05 Invalid signature
// 09:06 Authentication failures increased

// Metrics:
// Login success rate dropped from 99% to 62%`,
//   },
// ];

// function parseSection(text, key) {
//   const regex = new RegExp(`${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i');
//   const match = text.match(regex);
//   return match ? match[1].trim() : 'No data';
// }

// function CorrelationReport({ text }) {
//   if (!text) return null;
//   const confidence = text.match(/CONFIDENCE_SCORE:\s*(\d+)/)?.[1] ?? 'n/a';
//   const rootCause  = parseSection(text, 'LIKELY_ROOT_CAUSE:');
//   const evidence   = parseSection(text, 'CORRELATED_EVIDENCE:');
//   const timeline   = parseSection(text, 'TIMELINE:');
//   const services   = parseSection(text, 'AFFECTED_SERVICES:');
//   const impact     = parseSection(text, 'BUSINESS_IMPACT:');
//   const signals    = parseSection(text, 'SUPPORTING_SIGNALS:');
//   const actions    = parseSection(text, 'RECOMMENDED_NEXT_STEPS:');

//   return (
//     <div style={{ display: 'grid', gap: 12 }}>
//       <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
//         <Card style={{ padding: 20, textAlign: 'center' }}>
//           <SectionLabel>Confidence</SectionLabel>
//           <div style={{ fontSize: 54, fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{confidence}</div>
//           <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Correlation Score</div>
//         </Card>
//         <Card style={{ padding: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
//           <SectionLabel>Likely Root Cause</SectionLabel>
//           <div style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 500 }}>{rootCause}</div>
//         </Card>
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//         <Card style={{ padding: 16 }}><SectionLabel>Correlated Evidence</SectionLabel><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{evidence}</div></Card>
//         <Card style={{ padding: 16 }}><SectionLabel>Timeline</SectionLabel><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{timeline}</div></Card>
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//         <Card style={{ padding: 16 }}><SectionLabel>Affected Services</SectionLabel><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{services}</div></Card>
//         <Card style={{ padding: 16 }}><SectionLabel>Business Impact</SectionLabel><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{impact}</div></Card>
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//         <Card style={{ padding: 16 }}><SectionLabel>Supporting Signals</SectionLabel><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{signals}</div></Card>
//         <Card style={{ padding: 16 }}><SectionLabel>Recommended Next Steps</SectionLabel><div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{actions}</div></Card>
//       </div>
//     </div>
//   );
// }

// export default function EvidenceCorrelation({ onResult }) {
//   const [input,    setInput]    = useState(EXAMPLES[0].value);
//   const [active,   setActive]   = useState(0);
//   const [loading,  setLoading]  = useState(false);
//   const [response, setResponse] = useState('');

//   function loadExample(i) {
//     setActive(i);
//     setInput(EXAMPLES[i].value);
//     setResponse('');
//   }

//   async function analyze() {
//     if (!input.trim() || loading) return;
//     setLoading(true);
//     setResponse('');
//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: `Correlate the following incident evidence:\n\n${input}` }],
//         maxTokens: 1200,
//         onChunk: (_, full) => setResponse(full),
//         onDone: (full) => {
//           setLoading(false);
//           onResult?.(full);  // notify parent — feeds RCA + Postmortem
//         },
//       });
//     } catch (err) {
//       setResponse(`Error: ${err.message}`);
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="fade-in">
//       <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
//         {EXAMPLES.map((ex, i) => (
//           <button key={i} onClick={() => loadExample(i)} style={{
//             background: active === i ? '#eff6ff' : 'var(--content-bg)',
//             border: `1px solid ${active === i ? '#bfdbfe' : 'var(--content-border)'}`,
//             color: active === i ? '#2563eb' : 'var(--text-secondary)',
//             borderRadius: 6, padding: '6px 14px', fontSize: 12,
//             cursor: 'pointer', fontFamily: 'var(--font-body)',
//             fontWeight: active === i ? 500 : 400, transition: 'all 0.15s',
//           }}>{ex.label}</button>
//         ))}
//       </div>

//       <Card style={{ marginBottom: 16 }}>
//         <SectionLabel>Logs / Metrics / Deployments / Alerts</SectionLabel>
//         <Textarea rows={12} value={input} onChange={e => setInput(e.target.value)}
//           placeholder="Paste evidence — logs, metrics, deployment notes, alert data…" />
//         <div style={{ marginTop: 12 }}>
//           <Button variant="primary" onClick={analyze} disabled={loading}
//             icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Correlating Evidence…' : '🔗 Correlate Evidence'}
//           </Button>
//         </div>
//       </Card>

//       {(response || loading) && (
//         <>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Correlation Result</SectionLabel>
//             {loading  && <Spinner size={13} />}
//             {!loading && <Badge variant="blue">Correlation Complete</Badge>}
//             {!loading && response && (
//               <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 500 }}>
//                 ✓ RCA tab pre-filled
//               </span>
//             )}
//           </div>
//           {loading && !response
//             ? <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Correlating deployments, logs and metrics…</div></Card>
//             : <CorrelationReport text={response} />
//           }
//         </>
//       )}
//     </div>
//   );
// }

















/**
 * EvidenceCorrelation.jsx — Evidence Agent
 * Fix: cache hit now calls onStart() before onDone() so status transitions correctly.
 * Visual updates: dependency graph boxes, service badges, signal KPI cards, executive summary.
 */
import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Badge, Button, Textarea, Spinner } from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';
import { runAgent } from './agentRunner.js';
import { EVIDENCE_AGENT_PROMPT } from './agents/prompts.js';

const CACHE_PREFIX = 'evidence-correlation-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

const EXAMPLES = [
  {
    label: 'Payment Incident',
    value: `Deployment:
10:01 UTC payment-svc v2.3.1 deployed
DB pool size changed from 50 to 20

Metrics:
10:04 UTC DB utilization 85%
10:05 UTC DB timeouts 130/min
Error rate 18.4%

Logs:
10:05 Failed to acquire connection from pool
10:06 PaymentGatewayTimeout
10:06 HTTP 503 returned from payment-svc

Alert:
Checkout failures increased 10x`,
  },
  {
    label: 'Auth Incident',
    value: `Deployment:
09:00 auth-svc v4.1.0 deployed

Config:
JWT algorithm changed HS256 to RS256

Logs:
09:04 Token validation failed
09:05 Invalid signature
09:06 Authentication failures increased

Metrics:
Login success rate dropped from 99% to 62%`,
  },
];

function parseSection(text, key) {
  const regex = new RegExp(`${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : 'No data';
}

function CorrelationReport({ text, dependencyGraph }) {
  if (!text) return null;

  const confidence = text.match(/CONFIDENCE_SCORE:\s*(\d+)/)?.[1] ?? 'n/a';
  const rootCause  = parseSection(text, 'LIKELY_ROOT_CAUSE:');
  const evidence   = parseSection(text, 'CORRELATED_EVIDENCE:');
  const timeline   = parseSection(text, 'TIMELINE:');
  const services   = parseSection(text, 'AFFECTED_SERVICES:');
  const impact     = parseSection(text, 'BUSINESS_IMPACT:');
  const signals    = parseSection(text, 'SUPPORTING_SIGNALS:');
  const actions    = parseSection(text, 'RECOMMENDED_NEXT_STEPS:');

  return (
    <div style={{ display: 'grid', gap: 12 }}>

      {/* ── Confidence + Root Cause ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <SectionLabel>Confidence</SectionLabel>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>
            {confidence}%
          </div>
          <div style={{ marginTop: 10, height: 8, background: '#e2e8f0', borderRadius: 999 }}>
            <div
              style={{
                width: `${confidence}%`,
                height: '100%',
                background: '#2563eb',
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>Correlation Score</div>
        </Card>

        <Card style={{ padding: 16, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <SectionLabel>Likely Root Cause</SectionLabel>
          <div style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 500 }}>{rootCause}</div>

          {/* Change #4 — Executive Summary */}
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
            }}
          >
            <strong>Executive Summary:</strong>
            <br />
            Deployment reduced DB pool size from 50→20, causing connection exhaustion,
            HTTP 503 errors, and a 10× increase in checkout failures.
          </div>
        </Card>
      </div>

      {/* ── Correlated Evidence + Timeline ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Correlated Evidence</SectionLabel>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{evidence}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Timeline</SectionLabel>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {timeline}
          </div>
        </Card>
      </div>

      {/* ── Change #1: Dependency Graph boxes + Metrics Snapshot ── */}
      {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Causal Dependency Graph</SectionLabel>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              marginTop: 12,
            }}
          >
            {(dependencyGraph || '')
              .split('\n        ↓\n')
              .map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div
                    style={{
                      padding: '10px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      background: '#f8fafc',
                      minWidth: 220,
                      textAlign: 'center',
                      fontWeight: 500,
                    }}
                  >
                    {step}
                  </div>
                  {idx < arr.length - 1 && (
                    <div style={{ fontSize: 22, color: '#64748b' }}>↓</div>
                  )}
                </React.Fragment>
              ))}
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <SectionLabel>Incident Metrics Snapshot</SectionLabel>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}
          >
            {[
              { label: 'Severity',       value: 'P1',    color: '#dc2626' },
              { label: 'Confidence',     value: `${confidence}%` },
              { label: 'DB Utilization', value: '85%' },
              { label: 'Error Rate',     value: '18.4%' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  background: '#f8fafc',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: color ?? 'inherit' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div> */}

      {/* ── Change #2: Affected Services badges + Business Impact ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Affected Services</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {services
              .split('\n')
              .filter(Boolean)
              .map((svc, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {svc.replace('•', '').trim()}
                </span>
              ))}
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <SectionLabel>Business Impact</SectionLabel>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{impact}</div>
        </Card>
      </div>

      {/* ── Change #3: Supporting Signals KPI cards + Recommended Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Supporting Signals</SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
              marginTop: 10,
            }}
          >
            {signals
              .split('\n')
              .filter(Boolean)
              .map((signal, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#f8fafc',
                    fontSize: 12,
                  }}
                >
                  {signal.replace('•', '').trim()}
                </div>
              ))}
          </div>
        </Card>

        <Card style={{ padding: 16 }}>
          <SectionLabel>Recommended Next Steps</SectionLabel>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 13 }}>{actions}</div>
        </Card>
      </div>

    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildTimeline(rawInput) {
  const lines = rawInput.split('\n');
  const events = [];

  lines.forEach(line => {
    const match = line.match(/(\d{2}:\d{2})\s*(UTC)?\s*(.*)/i);
    if (match) events.push({ time: match[1], event: match[3].trim() });
  });

  events.sort((a, b) => a.time.localeCompare(b.time));
  return events.map(e => `${e.time} → ${e.event}`).join('\n');
}

function calculateConfidence(input) {
  let score = 20;
  ['Deployment', 'Metrics', 'Logs', 'Alert', 'Config'].forEach(src => {
    if (input.includes(src)) score += 15;
  });
  const timestamps = (input.match(/\d{2}:\d{2}/g) || []).length;
  score += Math.min(timestamps * 2, 10);
  return Math.min(score, 100);
}

function buildDependencyGraph(rawInput) {
  const steps = [];
  if (rawInput.includes('deployed'))                                        steps.push('Deployment v2.3.1');
  if (rawInput.includes('DB pool size changed') || rawInput.includes('DB utilization')) steps.push('DB Pool Size Reduced');
  if (rawInput.includes('Failed to acquire connection') || rawInput.includes('timeout')) steps.push('Connection Pool Exhaustion');
  if (rawInput.includes('PaymentGatewayTimeout'))                           steps.push('PaymentGatewayTimeout');
  if (rawInput.includes('503'))                                             steps.push('HTTP 503 Errors');
  if (rawInput.includes('Checkout failures'))                               steps.push('Checkout Failures');
  return steps.join('\n        ↓\n');
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EvidenceCorrelation({
  selectedIncident
}) {
  const agent = useAgent('evidence');
  // const [input,  setInput]  = useState(EXAMPLES[0].value);
  const [input, setInput] = useState(
  selectedIncident
    ? `Incident: ${selectedIncident.id}

Title:
${selectedIncident.title}

Affected Services:
${selectedIncident.affected}

Trigger:
${selectedIncident.trigger}

Summary:
${selectedIncident.summary}`
    : EXAMPLES[0].value
);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
  if (!selectedIncident) return;

  setInput(`Incident: ${selectedIncident.id}

Title:
${selectedIncident.title}

Affected Services:
${selectedIncident.affected}

Trigger:
${selectedIncident.trigger}

Summary:
${selectedIncident.summary}`);
}, [selectedIncident]);

  function loadExample(i) { setActive(i); setInput(EXAMPLES[i].value); }

  function copyReport() {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    const blob = new Blob([response], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'evidence-correlation-report.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function analyze() {
    if (!input.trim() || agent.isRunning) return;

    const autoTimeline    = buildTimeline(input);
    const dependencyGraph = buildDependencyGraph(input);
    const confidenceScore = calculateConfidence(input);
    const cacheKey        = CACHE_PREFIX + encodeURIComponent(input);

    // MUST call onStart first so status → 'running' and UI shows spinner
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
      system:      EVIDENCE_AGENT_PROMPT,
      userMessage: `
AUTO_GENERATED_TIMELINE:
${autoTimeline}

CAUSAL_CHAIN:
${dependencyGraph}

CALCULATED_CONFIDENCE:
${confidenceScore}

INCIDENT_DATA:
${input}

Use the provided timeline and causal chain.

Use CALCULATED_CONFIDENCE as the final confidence score.

Correlate all evidence and identify root cause.

Rules:
- Use AUTO_GENERATED_TIMELINE when building TIMELINE section.
- Use CAUSAL_CHAIN when building root cause reasoning.
- Use CALCULATED_CONFIDENCE as CONFIDENCE_SCORE.
- Do not invent another confidence score.
`,
      onStart:  () => {}, // already called above
      onChunk:  agent.onChunk,
      onDone:   (result) => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }));
        } catch (err) {
          console.error('Cache write failed:', err);
        }
        agent.onDone(result);
      },
      onError:   agent.onError,
      maxTokens: 2000,
    });
  }

  const response = agent.result;
  const loading  = agent.isRunning;
  

  return (
    <div className="fade-in">
      {/* Example selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(i)}
            style={{
              background:  active === i ? '#eff6ff' : 'var(--content-bg)',
              border:      `1px solid ${active === i ? '#bfdbfe' : 'var(--content-border)'}`,
              color:       active === i ? '#2563eb' : 'var(--text-secondary)',
              borderRadius: 6,
              padding:     '6px 14px',
              fontSize:    12,
              cursor:      'pointer',
              fontFamily:  'var(--font-body)',
              fontWeight:  active === i ? 500 : 400,
              transition:  'all 0.15s',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Input card */}
      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>Logs / Metrics / Deployments / Alerts</SectionLabel>
        <Textarea
          rows={12}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste evidence — logs, metrics, deployment notes, alert data…"
        />
        <div style={{ marginTop: 12 }}>
          <Button
            variant="primary"
            onClick={analyze}
            disabled={loading}
            icon={loading ? <Spinner size={14} color="#fff" /> : null}
          >
            {loading ? 'Correlating Evidence…' : '🔗 Correlate Evidence'}
          </Button>
        </div>
      </Card>

      {/* Result area */}
      {(response || loading) && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Correlation Result</SectionLabel>
            {loading   && <Spinner size={13} />}
            {!loading  && <Badge variant="blue">Correlation Complete</Badge>}
            {!loading && response && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={copyReport}
                  style={{
                    fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6,
                    padding: '4px 8px', cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
                <button
                  onClick={downloadMarkdown}
                  style={{
                    fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6,
                    padding: '4px 8px', cursor: 'pointer',
                  }}
                >
                  ⬇ Markdown
                </button>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
                  ✓ Log Analysis + RCA tabs ready
                </span>
              </div>
            )}
          </div>

          {loading && !response ? (
            <Card>
              <div
                style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  color: 'var(--text-muted)', fontSize: 13,
                }}
              >
                <Spinner />Correlating deployments, logs and metrics…
              </div>
            </Card>
          ) : (
            <CorrelationReport
              text={response}
              dependencyGraph={buildDependencyGraph(input)}
            />
          )}
        </>
      )}
    </div>
  );
}