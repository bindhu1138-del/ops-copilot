// // PostmortermGeneration.jsx
// import React, { useState } from 'react';
// import { Card, SectionLabel, Badge, PageHeader, Button, Input, Textarea, Spinner } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are a Postmortem Generator AI for software engineering teams. Generate a professional, blameless postmortem document.

// Format EXACTLY like this:

// TITLE: <incident title>
// DATE: <date>
// SEVERITY: <P1/P2/P3>
// DURATION: <duration>
// STATUS: Resolved

// EXECUTIVE_SUMMARY:
// <2-3 sentences: what happened, how many users affected, business impact, resolution>

// TIMELINE:
// <time> — <event>
// <time> — <event>
// (use the exact times provided, add realistic intermediate events)

// ROOT_CAUSE:
// <Specific technical root cause — be precise, name config values, versions, error types>

// CONTRIBUTING_FACTORS:
// • <factor 1>
// • <factor 2>
// • <factor 3>

// IMPACT:
// • Users affected: <estimate>
// • Revenue impact: <estimate>
// • Services degraded: <list>
// • Error rate: <peak %>

// WHAT_WENT_WELL:
// • <thing 1>
// • <thing 2>

// WHAT_WENT_WRONG:
// • <thing 1>
// • <thing 2>

// ACTION_ITEMS:
// | Priority | Action | Owner | Due |
// | High | <action> | <team> | <timeframe> |
// | High | <action> | <team> | <timeframe> |
// | Medium | <action> | <team> | <timeframe> |
// | Low | <action> | <team> | <timeframe> |

// LESSONS_LEARNED:
// <2-3 sentences of key learnings and how this changes future practices>

// Be blameless, specific, and professional. Use realistic team names (SRE Team, Platform Team, etc.).`;

// const TEMPLATE = {
//   title: 'Payment Service Latency Spike — Production',
//   date: '2025-05-25',
//   severity: 'P1',
//   duration: '47 minutes',
//   services: 'payment-svc, checkout-api',
//   usersAffected: '~14,000',
//   timeline: `10:01 — Deployment v2.3.1 pushed to payment-svc by Priya Sharma
// 10:09 — First PaymentGatewayTimeout errors detected
// 10:11 — p99 latency breached SLA: 340ms → 1160ms
// 10:13 — Circuit breaker OPEN on payment-gateway
// 10:18 — PagerDuty alert fired, on-call engineer paged
// 10:23 — Incident declared P1, war room opened
// 10:35 — Root cause identified: DB pool size reduced 50→20 in deployment
// 10:48 — Hotfix deployed (pool size restored to 50)
// 10:56 — Latency returning to baseline, circuit breaker HALF-OPEN
// 11:05 — Service fully recovered, incident resolved`,
//   rootCause: 'DB connection pool max_pool_size was accidentally reduced from 50 to 20 in the v2.3.1 config refactor. This caused pool exhaustion under normal load, leading to cascading timeouts and circuit breaker activation.',
//   additionalNotes: 'Config change was not caught in code review. No load testing was done post-deploy. Monitoring alert threshold for pool utilization was set too high (90%) to catch this early.',
// };

// function PostmortemDisplay({ text }) {
//   if (!text) return null;
//   const sections = [
//     { key: 'EXECUTIVE_SUMMARY:', bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
//     { key: 'TIMELINE:', bg: '#0f172a', border: '#1e293b', tc: '#93c5fd', dark: true },
//     { key: 'ROOT_CAUSE:', bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
//     { key: 'CONTRIBUTING_FACTORS:', bg: '#fffbeb', border: '#fde68a', tc: '#92400e' },
//     { key: 'IMPACT:', bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
//     { key: 'WHAT_WENT_WELL:', bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534' },
//     { key: 'WHAT_WENT_WRONG:', bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
//     { key: 'ACTION_ITEMS:', bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
//     { key: 'LESSONS_LEARNED:', bg: '#faf5ff', border: '#e9d5ff', tc: '#6b21a8' },
//   ];

//   const titleM = text.match(/TITLE:\s*(.+)/);
//   const dateM = text.match(/DATE:\s*(.+)/);
//   const sevM = text.match(/SEVERITY:\s*(.+)/);
//   const durM = text.match(/DURATION:\s*(.+)/);

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

//   // Render action items table nicely
//   function renderContent(b) {
//     if (b.key === 'ACTION_ITEMS:') {
//       const rows = b.content.split('\n').filter(r => r.includes('|'));
//       return (
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//             <tbody>
//               {rows.map((row, i) => {
//                 const cells = row.split('|').filter(c => c.trim());
//                 return (
//                   <tr key={i} style={{ borderBottom: '1px solid #dbeafe' }}>
//                     {cells.map((cell, j) => (
//                       <td key={j} style={{
//                         padding: '6px 10px',
//                         fontWeight: i === 0 ? 600 : 400,
//                         color: i === 0 ? '#1d4ed8' : 'var(--text-primary)',
//                         background: i === 0 ? '#dbeafe' : 'transparent',
//                         fontSize: i === 0 ? 11 : 12,
//                       }}>{cell.trim()}</td>
//                     ))}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       );
//     }
//     if (b.key === 'TIMELINE:') {
//       return (
//         <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#93c5fd', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
//           {b.content}
//         </div>
//       );
//     }
//     return <div style={{ fontSize: 12.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: b.dark ? '#e2e8f0' : 'var(--text-primary)' }}>{b.content}</div>;
//   }

//   return (
//     <div>
//       <Card style={{ marginBottom: 12, padding: '16px 20px', background: '#0f172a', border: '1px solid #1e293b' }}>
//         <div style={{ color: '#f1f5f9', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
//           {titleM?.[1] || 'Postmortem Report'}
//         </div>
//         <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//           {dateM && <Badge variant="dark">📅 {dateM[1]}</Badge>}
//           {sevM && <Badge variant={sevM[1].includes('P1') ? 'red' : 'amber'}>{sevM[1]}</Badge>}
//           {durM && <Badge variant="dark">⏱ {durM[1]}</Badge>}
//           <Badge variant="green">✓ Resolved</Badge>
//         </div>
//       </Card>
//       <div style={{ display: 'grid', gap: 10 }}>
//         {blocks.map((b, i) => (
//           <Card key={i} style={{ padding: '13px 16px', background: b.bg, border: `1px solid ${b.border}` }}>
//             <SectionLabel style={{ color: b.tc, marginBottom: 8 }}>{b.key.replace(/_/g, ' ').replace(':', '')}</SectionLabel>
//             {renderContent(b)}
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function PostmortemPage() {
//   const [form, setForm] = useState(TEMPLATE);
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

//   async function generate() {
//     if (loading) return;
//     setResponse('');
//     setLoading(true);
//     const prompt = `Generate a postmortem for this incident:
// Title: ${form.title}
// Date: ${form.date}
// Severity: ${form.severity}
// Duration: ${form.duration}
// Affected services: ${form.services}
// Users affected: ${form.usersAffected}

// Timeline:
// ${form.timeline}

// Root cause (as reported by engineer):
// ${form.rootCause}

// Additional notes:
// ${form.additionalNotes}`;
//     try {
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: prompt }],
//         maxTokens: 1400,
//         onChunk: (_, full) => setResponse(full),
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
//     a.download = `postmortem-${form.date}-${Date.now()}.md`;
//     a.click();
//   }

//   const inputStyle = { padding: '8px 12px', border: '1px solid var(--content-border)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--content-bg)', color: 'var(--text-primary)', width: '100%', outline: 'none' };

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Postmortem Generator"
//         subtitle="Fill in incident details — AI drafts a complete blameless postmortem with action items."
//       />
//       <Card style={{ marginBottom: 16 }}>
//         <SectionLabel>Incident details</SectionLabel>
//         <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
//           {[
//             { label: 'Title', field: 'title', colSpan: true },
//             { label: 'Date', field: 'date' },
//             { label: 'Severity', field: 'severity' },
//             { label: 'Duration', field: 'duration' },
//           ].map(f => (
//             <div key={f.field}>
//               <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{f.label}</div>
//               <input value={form[f.field]} onChange={e => set(f.field, e.target.value)} style={inputStyle} />
//             </div>
//           ))}
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
//           {[
//             { label: 'Affected services', field: 'services' },
//             { label: 'Users affected', field: 'usersAffected' },
//           ].map(f => (
//             <div key={f.field}>
//               <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{f.label}</div>
//               <input value={form[f.field]} onChange={e => set(f.field, e.target.value)} style={inputStyle} />
//             </div>
//           ))}
//         </div>
//         <div style={{ marginBottom: 10 }}>
//           <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Timeline (one event per line: TIME — EVENT)</div>
//           <Textarea value={form.timeline} onChange={e => set('timeline', e.target.value)} rows={8} />
//         </div>
//         <div style={{ marginBottom: 10 }}>
//           <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Root cause (your notes)</div>
//           <Textarea value={form.rootCause} onChange={e => set('rootCause', e.target.value)} rows={3} />
//         </div>
//         <div style={{ marginBottom: 14 }}>
//           <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Additional notes / what went wrong</div>
//           <Textarea value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} rows={3} />
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Button variant="primary" onClick={generate} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Generating…' : '📝 Generate Postmortem'}
//           </Button>
//           {response && !loading && (
//             <Button variant="ghost" onClick={exportMarkdown}>⬇ Export Markdown</Button>
//           )}
//         </div>
//       </Card>

//       {(response || loading) && (
//         <div className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Postmortem report</SectionLabel>
//             {loading && <Spinner size={13} />}
//             {!loading && <Badge variant="green">Draft ready</Badge>}
//           </div>
//           {loading && !response
//             ? <Card><div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Writing postmortem…</div></Card>
//             : <PostmortemDisplay text={response} />
//           }
//         </div>
//       )}
//     </div>
//   );
// }












/**
 * PostmortemGeneration.jsx — Postmortem Agent
 *
 * Fix: migrated from local callClaudeStream + useState(response)
 * to useAgent hook + runAgent so it participates in IncidentContext
 * and cache uses the same onStart-before-check pattern.
 *
 * autoFillData prop is still accepted for backward compat with index.jsx
 * but the primary data source is now the IncidentContext (useAgent).
 *
 * Data flow:
 *   RunbookGeneration  → context.runbookResult
 *   RecoveryActions    → context.recoveryResult   ← NEW (was prop-only before)
 *   PostmortemGeneration reads both from upstreamContext automatically.
 */
import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Badge, Button, Textarea, Spinner } from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';
import { runAgent, buildContext } from './agentRunner.js';
import { POSTMORTEM_AGENT_PROMPT } from './agents/prompts.js';

const CACHE_PREFIX = 'postmortem-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

const DEFAULT_FORM = {
  title:           'Payment Service Latency Spike — Production',
  date:            '2025-05-25',
  severity:        'P1',
  duration:        '47 minutes',
  services:        'payment-svc, checkout-api',
  usersAffected:   '~14,000',
  timeline: `10:01 — Deployment v2.3.1 pushed to payment-svc by Priya Sharma
10:09 — First PaymentGatewayTimeout errors detected
10:11 — p99 latency breached SLA: 340ms → 1160ms
10:13 — Circuit breaker OPEN on payment-gateway
10:18 — PagerDuty alert fired, on-call engineer paged
10:23 — Incident declared P1, war room opened
10:35 — Root cause identified: DB pool size reduced 50→20 in deployment
10:48 — Hotfix deployed (pool size restored to 50)
10:56 — Latency returning to baseline, circuit breaker HALF-OPEN
11:05 — Service fully recovered, incident resolved`,
  rootCause:       'DB connection pool max_pool_size was accidentally reduced from 50 to 20 in the v2.3.1 config refactor. This caused pool exhaustion under normal load, leading to cascading timeouts and circuit breaker activation.',
  additionalNotes: 'Config change was not caught in code review. No load testing was done post-deploy. Monitoring alert threshold for pool utilization was set too high (90%) to catch this early.',
};

function extractField(text, key) {
  if (!text) return '';
  const m = text.match(new RegExp(`${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i'));
  return m ? m[1].trim() : '';
}

function PostmortemDisplay({ text }) {
  if (!text) return null;
  const sections = [
    { key: 'EXECUTIVE_SUMMARY:',    bg: '#f8fafc', border: '#e2e8f0', tc: '#475569' },
    { key: 'TIMELINE:',             bg: '#0f172a', border: '#1e293b', tc: '#93c5fd', dark: true },
    { key: 'ROOT_CAUSE:',           bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
    { key: 'CONTRIBUTING_FACTORS:', bg: '#fffbeb', border: '#fde68a', tc: '#92400e' },
    { key: 'IMPACT:',               bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
    { key: 'WHAT_WENT_WELL:',       bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534' },
    { key: 'WHAT_WENT_WRONG:',      bg: '#fef2f2', border: '#fecaca', tc: '#991b1b' },
    { key: 'ACTION_ITEMS:',         bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
    { key: 'LESSONS_LEARNED:',      bg: '#faf5ff', border: '#e9d5ff', tc: '#6b21a8' },
  ];
  const titleM=text.match(/TITLE:\s*(.+)/); const dateM=text.match(/DATE:\s*(.+)/);
  const sevM=text.match(/SEVERITY:\s*(.+)/); const durM=text.match(/DURATION:\s*(.+)/);
  const blocks=[];
  for (let i=0;i<sections.length;i++){
    const sec=sections[i]; const idx=text.indexOf(sec.key); if(idx===-1)continue;
    const nextIdx=sections.slice(i+1).reduce((acc,s)=>{const p=text.indexOf(s.key,idx+sec.key.length);return p!==-1&&p<acc?p:acc;},text.length);
    blocks.push({...sec,content:text.slice(idx+sec.key.length,nextIdx).trim()});
  }
  function renderContent(b) {
    if (b.key==='ACTION_ITEMS:') {
      const rows=b.content.split('\n').filter(r=>r.includes('|') && !r.replace(/\|/g,'').trim().match(/^[-\s]+$/));
      return <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><tbody>{rows.map((row,i)=>{const cells=row.split('|').filter(c=>c.trim());return(<tr key={i} style={{borderBottom:'1px solid #dbeafe'}}>{cells.map((cell,j)=><td key={j} style={{padding:'6px 10px',fontWeight:i===0?600:400,color:i===0?'#0f172a':'var(--text-primary)',background:i===0?'#dbeafe':'transparent',borderRadius:'6px',fontSize:i===0?11:12}}>{cell.trim()}</td>)}</tr>);})}</tbody></table></div>;
    }
    if (b.key==='TIMELINE:') return <div style={{fontFamily:'var(--font-mono)',fontSize:11.5,color:'#93c5fd',lineHeight:1.9,whiteSpace:'pre-wrap'}}>{b.content}</div>;
   return (
  <div
    style={{
      fontSize: 12.5,
      lineHeight: 1.75,
      whiteSpace: 'pre-wrap',
      color: b.dark ? '#e2e8f0' : '#1e293b'
    }}
  >
    {b.content}
  </div>
);
  }
  return (
  <div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 10,
        marginBottom: 16
      }}
    >
      <Card style={{ padding: 12 }}>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Severity
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#dc2626'
          }}
        >
          {sevM?.[1] || 'P1'}
        </div>
      </Card>

      <Card style={{ padding: 12 }}>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Duration
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700
          }}
        >
          {durM?.[1] || 'N/A'}
        </div>
      </Card>

      <Card style={{ padding: 12 }}>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Status
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#16a34a'
          }}
        >
          Resolved
        </div>
      </Card>

      <Card style={{ padding: 12 }}>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Report
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700
          }}
        >
          Complete
        </div>
      </Card>
    </div>
      <div style={{display:'grid',gap:10}}>
        {blocks.map((b,i)=>(
          <Card key={i} style={{padding:'13px 16px',background:b.bg,border:`1px solid ${b.border}`}}>
            <SectionLabel style={{color:b.tc,marginBottom:8}}>{b.key.replace(/_/g,' ').replace(':','')}</SectionLabel>
            {renderContent(b)}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PostmortemGeneration({ autoFillData }) {
  const agent = useAgent('postmortem');
  const upstream = agent.upstreamContext;

  const [form,       setForm]       = useState(DEFAULT_FORM);
  const [autoFilled, setAutoFilled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const evidenceResult = upstream.evidenceResult  || autoFillData?.evidenceResult  || '';
    const rcaResult      = upstream.rcaResult       || autoFillData?.rcaResult       || '';
    const runbookResult  = upstream.runbookResult   || autoFillData?.runbookResult   || '';
    const recoveryResult = upstream.recoveryResult  || autoFillData?.recoveryResult  || '';
    const executorResult =
  upstream.executorResult ||
  autoFillData?.executorResult ||
  '';

    if (!evidenceResult &&
    !rcaResult &&
    !runbookResult &&
    !recoveryResult &&
    !executorResult)
  return;

    setForm(prev => {
      const next = { ...prev };

      if (evidenceResult) {
        const services = extractField(evidenceResult, 'AFFECTED_SERVICES:');
        const impact   = extractField(evidenceResult, 'BUSINESS_IMPACT:');
        const timeline = extractField(evidenceResult, 'TIMELINE:');
        if (services && services !== 'No data') next.services = services.split('\n').map(l=>l.replace(/^•\s*/,'')).filter(Boolean).join(', ');
        if (impact   && impact   !== 'No data') next.additionalNotes = impact;
        if (timeline && timeline !== 'No data') next.timeline = timeline.split('\n').map(l=>l.replace(/^•\s*/,'')).filter(Boolean).join('\n');
      }

      if (rcaResult) {
        const rc  = extractField(rcaResult, 'ROOT CAUSE:') || extractField(rcaResult, 'ROOT_CAUSE:');
        const sev = rcaResult.match(/Severity:\s*(P\d)/i)?.[1];
        if (rc && rc !== 'No data') { next.rootCause = rc; next.title = `Incident: ${rc.split('\n')[0].slice(0,80)}`; }
        if (sev) next.severity = sev;
      }

      if (runbookResult) {
        const svcM = runbookResult.match(/SERVICE:\s*(.+)/i);
        const sevM = runbookResult.match(/SEVERITY:\s*(.+)/i);
        if (svcM) next.services = svcM[1].trim();
        if (sevM) { const s=sevM[1].trim(); if(s.includes('P1'))next.severity='P1'; else if(s.includes('P2'))next.severity='P2'; else if(s.includes('P3'))next.severity='P3'; }
      }

      if (recoveryResult) {
        // FIX: tighter ETA match — stops at end-of-line, not next section header.
        // The RecoveryActions output uses "ETA_TO_RECOVERY: <value>" on a single line.
        const eta = recoveryResult.match(/ETA_TO_RECOVERY:\s*([^\n]+)/i)?.[1]?.trim();
        if (eta) next.duration = eta;

        // Grab first 3 lines of IMMEDIATE_ACTIONS to summarise what was done.
        // The section header includes parenthetical text: "IMMEDIATE_ACTIONS (do now…):"
        // so we use [^:]* to skip past it before the colon that ends the header.
        const imm = recoveryResult.match(
          /IMMEDIATE_ACTIONS[^:]*:\s*([\s\S]*?)(?=\n(?:STABILIZATION|VERIFICATION|AWS_CLI|ROLLBACK|ETA_TO_RECOVERY)[^:]*:|$)/i,
        );
        if (imm) {
          const actions = imm[1].trim().split('\n').slice(0, 3).join('\n');
          next.additionalNotes = (next.additionalNotes
            ? next.additionalNotes + '\n\nRecovery actions taken:\n'
            : 'Recovery actions taken:\n') + actions;
        }
      }

      if (executorResult) {
  next.additionalNotes =
    (next.additionalNotes || '') +
    '\n\nExecution Summary:\n' +
    executorResult;
}

      return next;
    });
    setAutoFilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   upstream.evidenceResult, upstream.rcaResult, upstream.runbookResult, upstream.recoveryResult,
  //   autoFillData?.evidenceResult, autoFillData?.rcaResult, autoFillData?.runbookResult, autoFillData?.recoveryResult,
  // ]);
  }, [
  upstream.evidenceResult,
  upstream.rcaResult,
  upstream.runbookResult,
  upstream.recoveryResult,
  upstream.executorResult,

  autoFillData?.evidenceResult,
  autoFillData?.rcaResult,
  autoFillData?.runbookResult,
  autoFillData?.recoveryResult,
  autoFillData?.executorResult,
]);
  function setField(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function generate() {
    if (agent.isRunning) return;

    const ctx = buildContext(
  upstream,
  [
    'evidenceResult',
    'rcaResult',
    'runbookResult',
    'recoveryResult',
    'executorResult',
    'validationResult'
  ]
);
    const prompt = `Generate a postmortem for this incident:
Title: ${form.title}
Date: ${form.date}
Severity: ${form.severity}
Duration: ${form.duration}
Affected services: ${form.services}
Users affected: ${form.usersAffected}

Timeline:
${form.timeline}

Root cause:
${form.rootCause}

Additional notes:
${form.additionalNotes}${ctx}`;

    const cacheKey = CACHE_PREFIX + encodeURIComponent(JSON.stringify(form));

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
      system:      POSTMORTEM_AGENT_PROMPT,
      userMessage: prompt,
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

  function exportMarkdown() {
    const blob=new Blob([agent.result],{type:'text/markdown'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`postmortem-${form.date}-${Date.now()}.md`; a.click();
  }
  function copyReport() {
  navigator.clipboard.writeText(response);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
}

  const response = agent.result;
  const loading  = agent.isRunning;

  const inputStyle = { padding:'8px 12px',border:'1px solid var(--content-border)',borderRadius:8,fontSize:13,fontFamily:'var(--font-body)',background:'var(--content-bg)',color:'var(--text-primary)',width:'100%',outline:'none' };

  return (
    <div className="fade-in">
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Incident details</SectionLabel>
          {autoFilled && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>✓ Pre-filled from all upstream agents — edit freely</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[{label:'Title',field:'title'},{label:'Date',field:'date'},{label:'Severity',field:'severity'},{label:'Duration',field:'duration'}].map(f=>(
            <div key={f.field}>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,fontWeight:500}}>{f.label}</div>
              <input value={form[f.field]} onChange={e=>setField(f.field,e.target.value)} style={inputStyle}/>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[{label:'Affected services',field:'services'},{label:'Users affected',field:'usersAffected'}].map(f=>(
            <div key={f.field}>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,fontWeight:500}}>{f.label}</div>
              <input value={form[f.field]} onChange={e=>setField(f.field,e.target.value)} style={inputStyle}/>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,fontWeight:500}}>Timeline (TIME — EVENT)</div>
          <Textarea value={form.timeline} onChange={e=>setField('timeline',e.target.value)} rows={8}/>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,fontWeight:500}}>Root cause</div>
          <Textarea value={form.rootCause} onChange={e=>setField('rootCause',e.target.value)} rows={3}/>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4,fontWeight:500}}>Additional notes / recovery actions</div>
          <Textarea value={form.additionalNotes} onChange={e=>setField('additionalNotes',e.target.value)} rows={4}/>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" onClick={generate} disabled={loading} icon={loading?<Spinner size={14} color="#fff"/>:null}>
            {loading?'Generating…':'📝 Generate Postmortem'}
          </Button>
          {response&&!loading&&<Button variant="ghost" onClick={exportMarkdown}>⬇ Export Markdown</Button>}
        </div>
      </Card>

      {(response||loading)&&(
        <div className="fade-in">
          {/* <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <SectionLabel style={{marginBottom:0}}>Postmortem report</SectionLabel>
            {loading&&<Spinner size={13}/>}
            {!loading&&<Badge variant="green">Draft ready</Badge>}
          </div> */}
          <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  }}
>
  <SectionLabel style={{ marginBottom: 0 }}>
    Postmortem Report
  </SectionLabel>

  {loading && <Spinner size={13} />}

  {!loading && (
    <Badge variant="green">
      Draft Ready
    </Badge>
  )}

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
        onClick={exportMarkdown}
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
    </div>
  )}
</div>
          {loading&&!response
            ?<Card><div style={{display:'flex',gap:8,alignItems:'center',color:'var(--text-muted)',fontSize:13}}><Spinner/>Writing postmortem…</div></Card>
            :<PostmortemDisplay text={response}/>
          }
        </div>
      )}
    </div>
  );
}