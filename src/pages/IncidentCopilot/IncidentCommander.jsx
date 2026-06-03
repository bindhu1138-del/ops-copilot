// /**
//  * IncidentCommander.jsx
//  *
//  * Reads rcaResult + recoveryResult from upstream context,
//  * determines priority / owner team / execution plan,
//  * and writes commanderResult to IncidentContext.
//  */
// import React, { useState, useEffect } from 'react';
// import {
//   Card, SectionLabel, Button, Spinner, Badge,
// } from '../../components/UI.jsx';
// import { useAgent } from './IncidentContext.jsx';
// import { runAgent, buildContext } from './agentRunner.js';

// const CACHE_PREFIX = 'incident-commander-agent-';
// const CACHE_TTL    = 15 * 60 * 1000;

// // ── Prompt ────────────────────────────────────────────────────────────────────
// const COMMANDER_SYSTEM = `You are an experienced Incident Commander making rapid triage decisions.

// Given a Root Cause Analysis and a Recovery Plan, produce a structured command summary.

// Return EXACTLY this format — no extra text:

// INCIDENT_COMMAND_DECISION

// PRIORITY: <P1|P2|P3>

// OWNER_TEAM: <team name>

// ESCALATION_LEVEL: <Critical|High|Medium|Low>

// REQUIRES_TICKET: <Yes|No>

// NOTIFY_ONCALL: <Yes|No>

// EXECUTION_PLAN:
// 1. <first action — specific and immediate>
// 2. <second action>
// 3. <third action>
// 4. <fourth action>

// CONFIDENCE: <High|Medium|Low>

// RATIONALE:
// <2-3 sentence explanation of the priority/team decision>

// Be decisive. Use exact service names from the evidence.`;

// // ── Section colours ───────────────────────────────────────────────────────────
// const SECTION_STYLES = {
//   PRIORITY:        { bg: '#fef2f2', border: '#fecaca', title: '#991b1b' },
//   OWNER_TEAM:      { bg: '#eff6ff', border: '#bfdbfe', title: '#1d4ed8' },
//   ESCALATION:      { bg: '#fff7ed', border: '#fdba74', title: '#92400e' },
//   EXECUTION_PLAN:  { bg: '#f0fdf4', border: '#bbf7d0', title: '#166534' },
//   CONFIDENCE:      { bg: '#f8fafc', border: '#e2e8f0', title: '#475569' },
//   RATIONALE:       { bg: '#fdf4ff', border: '#e9d5ff', title: '#6b21a8' },
// };

// // ── CommandReport ─────────────────────────────────────────────────────────────
// function StatusPill({ label, value, ok }) {
//   const color = ok ? '#16a34a' : '#dc2626';
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', gap: 6,
//       background: ok ? '#f0fdf4' : '#fef2f2',
//       border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
//       borderRadius: 8, padding: '6px 12px',
//     }}>
//       <span style={{ fontSize: 14 }}>{ok ? '✓' : '✗'}</span>
//       <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
//       <span style={{ fontSize: 12, color: '#64748b', marginLeft: 2 }}>— {value}</span>
//     </div>
//   );
// }

// function CommandReport({ text }) {
//   if (!text) return null;

//   const get = (key, nextKeys) => {
//     const idx = text.indexOf(`${key}:`);
//     if (idx === -1) return '';
//     const after = text.slice(idx + key.length + 1);
//     let end = after.length;
//     (nextKeys || []).forEach(nk => {
//       const pos = after.indexOf(`${nk}:`);
//       if (pos !== -1 && pos < end) end = pos;
//     });
//     return after.slice(0, end).trim();
//   };

//   const priority       = get('PRIORITY',        ['OWNER_TEAM']);
//   const ownerTeam      = get('OWNER_TEAM',      ['ESCALATION_LEVEL']);
//   const escalation     = get('ESCALATION_LEVEL',['REQUIRES_TICKET']);
//   const requiresTicket = get('REQUIRES_TICKET', ['NOTIFY_ONCALL']);
//   const notifyOncall   = get('NOTIFY_ONCALL',   ['EXECUTION_PLAN']);
//   const executionPlan  = get('EXECUTION_PLAN',  ['CONFIDENCE']);
//   const confidence     = get('CONFIDENCE',      ['RATIONALE']);
//   const rationale      = get('RATIONALE',       []);

//   const priorityColor = priority === 'P1' ? '#dc2626' : priority === 'P2' ? '#d97706' : '#16a34a';

//   return (
//     <div style={{ display: 'grid', gap: 12 }}>

//       {/* Top KPI strip */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
//         <Card style={{ padding: 12, textAlign: 'center' }}>
//           <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Priority</div>
//           <div style={{ fontSize: 28, fontWeight: 800, color: priorityColor }}>{priority || '—'}</div>
//         </Card>
//         <Card style={{ padding: 12, textAlign: 'center' }}>
//           <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Escalation</div>
//           <div style={{ fontSize: 18, fontWeight: 700 }}>{escalation || '—'}</div>
//         </Card>
//         <Card style={{ padding: 12, textAlign: 'center' }}>
//           <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Confidence</div>
//           <div style={{ fontSize: 18, fontWeight: 700 }}>{confidence || '—'}</div>
//         </Card>
//         <Card style={{ padding: 12, textAlign: 'center' }}>
//           <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Owner Team</div>
//           <div style={{ fontSize: 13, fontWeight: 700 }}>{ownerTeam || '—'}</div>
//         </Card>
//       </div>

//       {/* Action flags */}
//       <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//         <StatusPill label="Create Ticket"     value={requiresTicket} ok={requiresTicket === 'Yes'} />
//         <StatusPill label="Notify On-call"    value={notifyOncall}   ok={notifyOncall   === 'Yes'} />
//       </div>

//       {/* Execution plan */}
//       <div style={{
//         background: SECTION_STYLES.EXECUTION_PLAN.bg,
//         border: `1px solid ${SECTION_STYLES.EXECUTION_PLAN.border}`,
//         borderRadius: 10, padding: '12px 16px',
//       }}>
//         <div style={{ fontSize: 10, fontWeight: 700, color: SECTION_STYLES.EXECUTION_PLAN.title, letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
//           EXECUTION PLAN
//         </div>
//         <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
//           {executionPlan}
//         </div>
//       </div>

//       {/* Rationale */}
//       {rationale && (
//         <div style={{
//           background: SECTION_STYLES.RATIONALE.bg,
//           border: `1px solid ${SECTION_STYLES.RATIONALE.border}`,
//           borderRadius: 10, padding: '12px 16px',
//         }}>
//           <div style={{ fontSize: 10, fontWeight: 700, color: SECTION_STYLES.RATIONALE.title, letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
//             RATIONALE
//           </div>
//           <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>{rationale}</div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Main component ────────────────────────────────────────────────────────────
// export default function IncidentCommander() {
//   const agent = useAgent('commander');
//   const { rcaResult, recoveryResult } = agent.upstreamContext;

//   const [autoFilled, setAutoFilled] = useState(false);
//   const [copied,     setCopied]     = useState(false);
//   const [summary,    setSummary]    = useState('');

//   // Auto-fill summary textarea when upstream context arrives
//   useEffect(() => {
//     const parts = [];
//     if (rcaResult?.trim())      parts.push(`RCA:\n${rcaResult.trim().slice(0, 600)}`);
//     if (recoveryResult?.trim()) parts.push(`Recovery Plan:\n${recoveryResult.trim().slice(0, 400)}`);
//     if (!parts.length) return;
//     setSummary(parts.join('\n\n'));
//     setAutoFilled(true);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rcaResult, recoveryResult]);

//   // ── Run ───────────────────────────────────────────────────────────────────
//   async function runCommander() {
//     if (agent.isRunning) return;

//     const ctx      = buildContext(agent.upstreamContext, ['rcaResult', 'recoveryResult']);
//     const userMsg  = `Make an incident command decision.\n\n${summary || ''}${ctx}`;
//     const cacheKey = CACHE_PREFIX + encodeURIComponent(userMsg);

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
//       system:      COMMANDER_SYSTEM,
//       userMessage: userMsg,
//       onStart:     () => {},
//       onChunk:     agent.onChunk,
//       onDone: (result) => {
//         try {
//           localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }));
//         } catch (err) {
//           console.error('Cache write failed:', err);
//         }
//         agent.onDone(result);
//       },
//       onError:  agent.onError,
//       maxTokens: 2000,
//     });
//   }

//   function copyReport() {
//     navigator.clipboard.writeText(response);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   }

//   function exportMarkdown() {
//     const blob = new Blob([response], { type: 'text/markdown' });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement('a');
//     a.href     = url;
//     a.download = 'incident-command.md';
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   const response = agent.result;
//   const loading  = agent.isRunning;

//   return (
//     <div className="fade-in">

//       {/* Input card */}
//       <Card style={{ marginBottom: 14 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
//           <SectionLabel style={{ marginBottom: 0 }}>Incident Summary</SectionLabel>
//           {autoFilled && (
//             <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
//               ✓ Pre-filled from RCA + Recovery — edit freely
//             </span>
//           )}
//         </div>

//         <textarea
//           value={summary}
//           onChange={e => setSummary(e.target.value)}
//           placeholder="Paste RCA output and recovery plan, or run Evidence → RCA → Recovery first to auto-fill…"
//           rows={6}
//           style={{
//             width: '100%', padding: '8px 12px',
//             border: '1px solid var(--content-border)', borderRadius: 8,
//             fontSize: 13, fontFamily: 'var(--font-body)',
//             background: 'var(--content-bg)', color: 'var(--text-primary)',
//             resize: 'vertical', outline: 'none', boxSizing: 'border-box',
//           }}
//         />

//         <div style={{ marginTop: 10 }}>
//           <Button
//             variant="primary"
//             onClick={runCommander}
//             disabled={loading}
//             icon={loading ? <Spinner size={14} color="#fff" /> : null}
//           >
//             {loading ? 'Commanding…' : '🎯 Generate Command Decision'}
//           </Button>
//         </div>
//       </Card>

//       {/* Result card */}
//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Incident Command Decision</SectionLabel>

//             {loading && <Spinner size={13} />}
//             {!loading && <Badge variant="red">Active</Badge>}

//             {!loading && response && (
//               <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
//                 <button
//                   onClick={copyReport}
//                   style={{ fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
//                 >
//                   {copied ? '✓ Copied' : '📋 Copy'}
//                 </button>
//                 <button
//                   onClick={exportMarkdown}
//                   style={{ fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
//                 >
//                   ⬇ Markdown
//                 </button>
//               </div>
//             )}
//           </div>

//           {loading && !response
//             ? (
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
//                 <Spinner />Analysing RCA + recovery plan…
//               </div>
//             )
//             : <CommandReport text={response} />
//           }
//         </Card>
//       )}
//     </div>
//   );
// }

















/**
 * IncidentCommander.jsx
 *
 * Reads rcaResult + recoveryResult from upstream context,
 * determines priority / owner team / execution plan,
 * and writes commanderResult to IncidentContext.
 */
import React, { useState, useEffect } from 'react';
import {
  Card, SectionLabel, Button, Spinner, Badge,
} from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';
import { runAgent, buildContext } from './agentRunner.js';

// onTabChange prop lets Commander navigate to the executor tab
// It is passed down from SubTabLayout via index.jsx (optional — degrades gracefully)

const CACHE_PREFIX = 'incident-commander-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

// ── Prompt ────────────────────────────────────────────────────────────────────
const COMMANDER_SYSTEM = `You are an experienced Incident Commander making rapid triage decisions.

Given a Root Cause Analysis and a Recovery Plan, produce a structured command summary.

Return EXACTLY this format — no extra text:

INCIDENT_COMMAND_DECISION

PRIORITY: <P1|P2|P3>

OWNER_TEAM: <team name>

ESCALATION_LEVEL: <Critical|High|Medium|Low>

REQUIRES_TICKET: <Yes|No>

NOTIFY_ONCALL: <Yes|No>

EXECUTION_PLAN:
1. <first action — specific and immediate>
2. <second action>
3. <third action>
4. <fourth action>

CONFIDENCE: <High|Medium|Low>

RATIONALE:
<2-3 sentence explanation of the priority/team decision>

Be decisive. Use exact service names from the evidence.`;

// ── Section colours ───────────────────────────────────────────────────────────
const SECTION_STYLES = {
  PRIORITY:        { bg: '#fef2f2', border: '#fecaca', title: '#991b1b' },
  OWNER_TEAM:      { bg: '#eff6ff', border: '#bfdbfe', title: '#1d4ed8' },
  ESCALATION:      { bg: '#fff7ed', border: '#fdba74', title: '#92400e' },
  EXECUTION_PLAN:  { bg: '#f0fdf4', border: '#bbf7d0', title: '#166534' },
  CONFIDENCE:      { bg: '#f8fafc', border: '#e2e8f0', title: '#475569' },
  RATIONALE:       { bg: '#fdf4ff', border: '#e9d5ff', title: '#6b21a8' },
};

// ── CommandReport ─────────────────────────────────────────────────────────────
function StatusPill({ label, value, ok }) {
  const color = ok ? '#16a34a' : '#dc2626';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: ok ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
      borderRadius: 8, padding: '6px 12px',
    }}>
      <span style={{ fontSize: 14 }}>{ok ? '✓' : '✗'}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
      <span style={{ fontSize: 12, color: '#64748b', marginLeft: 2 }}>— {value}</span>
    </div>
  );
}

function CommandReport({ text }) {
  if (!text) return null;

  const get = (key, nextKeys) => {
    const idx = text.indexOf(`${key}:`);
    if (idx === -1) return '';
    const after = text.slice(idx + key.length + 1);
    let end = after.length;
    (nextKeys || []).forEach(nk => {
      const pos = after.indexOf(`${nk}:`);
      if (pos !== -1 && pos < end) end = pos;
    });
    return after.slice(0, end).trim();
  };

  const priority       = get('PRIORITY',        ['OWNER_TEAM']);
  const ownerTeam      = get('OWNER_TEAM',      ['ESCALATION_LEVEL']);
  const escalation     = get('ESCALATION_LEVEL',['REQUIRES_TICKET']);
  const requiresTicket = get('REQUIRES_TICKET', ['NOTIFY_ONCALL']);
  const notifyOncall   = get('NOTIFY_ONCALL',   ['EXECUTION_PLAN']);
  const executionPlan  = get('EXECUTION_PLAN',  ['CONFIDENCE']);
  const confidence     = get('CONFIDENCE',      ['RATIONALE']);
  const rationale      = get('RATIONALE',       []);

  const priorityColor = priority === 'P1' ? '#dc2626' : priority === 'P2' ? '#d97706' : '#16a34a';

  return (
    <div style={{ display: 'grid', gap: 12 }}>

      {/* Top KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Priority</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: priorityColor }}>{priority || '—'}</div>
        </Card>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Escalation</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{escalation || '—'}</div>
        </Card>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Confidence</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{confidence || '—'}</div>
        </Card>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Owner Team</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{ownerTeam || '—'}</div>
        </Card>
      </div>

      {/* Action flags */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <StatusPill label="Create Ticket"     value={requiresTicket} ok={requiresTicket === 'Yes'} />
        <StatusPill label="Notify On-call"    value={notifyOncall}   ok={notifyOncall   === 'Yes'} />
      </div>

      {/* Execution plan */}
      <div style={{
        background: SECTION_STYLES.EXECUTION_PLAN.bg,
        border: `1px solid ${SECTION_STYLES.EXECUTION_PLAN.border}`,
        borderRadius: 10, padding: '12px 16px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: SECTION_STYLES.EXECUTION_PLAN.title, letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
          EXECUTION PLAN
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {executionPlan}
        </div>
      </div>

      {/* Rationale */}
      {rationale && (
        <div style={{
          background: SECTION_STYLES.RATIONALE.bg,
          border: `1px solid ${SECTION_STYLES.RATIONALE.border}`,
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SECTION_STYLES.RATIONALE.title, letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            RATIONALE
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>{rationale}</div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IncidentCommander({ onTabChange }) {
  const agent = useAgent('commander');
  const { rcaResult, recoveryResult } = agent.upstreamContext;

  const [autoFilled, setAutoFilled] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [summary,    setSummary]    = useState('');

  // Auto-fill summary textarea when upstream context arrives
  useEffect(() => {
    const parts = [];
    if (rcaResult?.trim())      parts.push(`RCA:\n${rcaResult.trim().slice(0, 600)}`);
    if (recoveryResult?.trim()) parts.push(`Recovery Plan:\n${recoveryResult.trim().slice(0, 400)}`);
    if (!parts.length) return;
    setSummary(parts.join('\n\n'));
    setAutoFilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rcaResult, recoveryResult]);

  // ── Run ───────────────────────────────────────────────────────────────────
  async function runCommander() {
    if (agent.isRunning) return;

    const ctx      = buildContext(agent.upstreamContext, ['rcaResult', 'recoveryResult']);
    const userMsg  = `Make an incident command decision.\n\n${summary || ''}${ctx}`;
    const cacheKey = CACHE_PREFIX + encodeURIComponent(userMsg);

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
      system:      COMMANDER_SYSTEM,
      userMessage: userMsg,
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
      onError:  agent.onError,
      maxTokens: 2000,
    });
  }

  function copyReport() {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportMarkdown() {
    const blob = new Blob([response], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'incident-command.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  const response = agent.result;
  const loading  = agent.isRunning;

  return (
    <div className="fade-in">

      {/* Input card */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Incident Summary</SectionLabel>
          {autoFilled && (
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
              ✓ Pre-filled from RCA + Recovery — edit freely
            </span>
          )}
        </div>

        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Paste RCA output and recovery plan, or run Evidence → RCA → Recovery first to auto-fill…"
          rows={6}
          style={{
            width: '100%', padding: '8px 12px',
            border: '1px solid var(--content-border)', borderRadius: 8,
            fontSize: 13, fontFamily: 'var(--font-body)',
            background: 'var(--content-bg)', color: 'var(--text-primary)',
            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
        />

        <div style={{ marginTop: 10 }}>
          <Button
            variant="primary"
            onClick={runCommander}
            disabled={loading}
            icon={loading ? <Spinner size={14} color="#fff" /> : null}
          >
            {loading ? 'Commanding…' : '🎯 Generate Command Decision'}
          </Button>
        </div>
      </Card>

      {/* Result card */}
      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Incident Command Decision</SectionLabel>

            {loading && <Spinner size={13} />}
            {!loading && <Badge variant="red">Active</Badge>}

            {!loading && response && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={copyReport}
                  style={{ fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
                <button
                  onClick={exportMarkdown}
                  style={{ fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
                >
                  ⬇ Markdown
                </button>
              </div>
            )}
          </div>

          {loading && !response
            ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <Spinner />Analysing RCA + recovery plan…
              </div>
            )
            : (
              <>
                <CommandReport text={response} />

                {/* ── One-Click Execute Plan ──────────────────────────────── */}
                <div style={{
                  marginTop: 16, paddingTop: 16,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                }}>
                  <Button
                    variant="primary"
                    onClick={() => onTabChange?.('executor')}
                    style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                  >
                    ⚡ Execute Plan
                  </Button>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Opens Action Executor with all recommended actions pre-selected
                  </span>
                </div>
              </>
            )
          }
        </Card>
      )}
    </div>
  );
}