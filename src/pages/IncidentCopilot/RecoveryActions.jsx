// // RecoveryActions.jsx
// import React, { useState } from 'react';
// import { Card, SectionLabel, Button, Spinner, Badge } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are an SRE Recovery Actions AI. Given an incident description, generate immediate, actionable recovery steps.

// Format EXACTLY:

// IMMEDIATE_ACTIONS (do now — within 5 minutes):
// 1. <exact command or action>
// 2. <command>
// 3. <command>

// STABILIZATION (next 15 minutes):
// 1. <action>
// 2. <action>

// VERIFICATION:
// • <how to confirm service is recovering — specific metric or command>
// • <second verification step>

// AWS_CLI_COMMANDS:
// \`\`\`bash
// # <comment>
// <exact aws cli or kubectl command>
// \`\`\`

// ROLLBACK_PROCEDURE:
// 1. <step>
// 2. <step>
// 3. <step>

// ETA_TO_RECOVERY: <realistic estimate>

// Use exact service names and realistic AWS CLI commands for ECS/RDS. Be specific.`;

// const PRESETS = [
//   { label: 'DB pool exhausted', q: 'payment-svc DB connection pool exhausted — 20/20 connections held, 130 timeouts/min, circuit breaker OPEN' },
//   { label: 'High latency spike', q: 'checkout-api p99 latency at 2400ms (threshold 500ms), error rate 18%, deployment 30 min ago' },
//   { label: 'Service OOM crash',  q: 'auth-svc ECS task crashing with OOM errors, 3 restarts in 10 min, JWT validation failing' },
//   { label: 'Rollback needed',    q: 'payment-svc v2.3.1 deployment caused 18% error rate, need to rollback to v2.3.0' },
// ];

// function CodeBlock({ children }) {
//   return <pre style={{ background: '#0f172a', color: '#7dd3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>{children}</pre>;
// }

// function RecoveryReport({ text }) {
//   if (!text) return null;
//   const parts = text.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
//       {parts.map((part, i) => {
//         if (part.startsWith('```')) return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
//         // Color section headers
//         const lines = part.split('\n').map((line, j) => {
//           if (/^(IMMEDIATE_ACTIONS|STABILIZATION|VERIFICATION|ROLLBACK_PROCEDURE|ETA_TO_RECOVERY):/.test(line)) {
//             return <div key={j} style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 12, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{line}</div>;
//           }
//           return <span key={j} style={{ whiteSpace: 'pre-wrap', display: 'block' }}>{line}</span>;
//         });
//         return <span key={i}>{lines}</span>;
//       })}
//     </div>
//   );
// }

// export default function RecoveryActions() {
//   const [query, setQuery] = useState(PRESETS[0].q);
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function run() {
//     if (!query.trim() || loading) return;
//     setResponse('');
//     setLoading(true);
//     try {
//       await callClaudeStream({ system: SYSTEM, messages: [{ role: 'user', content: `Generate recovery actions for: ${query}` }], maxTokens: 1000, onChunk: (_, full) => setResponse(full), onDone: () => setLoading(false) });
//     } catch (e) { setResponse(`Error: ${e.message}`); setLoading(false); }
//   }

//   return (
//     <div>
//       <Card style={{ marginBottom: 14 }}>
//         <SectionLabel>Incident presets</SectionLabel>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
//           {PRESETS.map(p => (
//             <button key={p.label} onClick={() => setQuery(p.q)} style={{ background: query === p.q ? '#fef2f2' : 'var(--content-bg)', border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`, color: query === p.q ? '#991b1b' : 'var(--text-secondary)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: query === p.q ? 500 : 400 }}>{p.label}</button>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <textarea value={query} onChange={e => setQuery(e.target.value)} placeholder="Describe the incident — service, symptoms, error rates…" rows={3}
//             style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--content-border)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)', background: 'var(--content-bg)', color: 'var(--text-primary)', resize: 'vertical', outline: 'none' }} />
//         </div>
//         <div style={{ marginTop: 10 }}>
//           <Button variant="primary" onClick={run} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>{loading ? 'Generating…' : '🚨 Generate Recovery Plan'}</Button>
//         </div>
//       </Card>
//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Recovery plan</SectionLabel>
//             {loading && <Spinner size={13} />}
//             {!loading && <Badge variant="green">Ready</Badge>}
//           </div>
//           {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Building recovery plan…</div> : <RecoveryReport text={response} />}
//         </Card>
//       )}
//     </div>
//   );
// }
















/**
 * RecoveryActions.jsx
 *
 * Migrated to useAgent + runAgent so it participates in IncidentContext.
 * Primary data flow:
 *   RunbookGeneration → context.runbookResult → (autoFill) this component
 *   this component    → context.recoveryResult → PostmortemGeneration
 *
 * Props:
 *   autoFillQuery (string) — legacy prop, still respected if passed directly.
 *   onResult(text)         — legacy callback, still called on completion.
 */
import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Button, Spinner, Badge } from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';
import { runAgent, buildContext } from './agentRunner.js';
import { RECOVERY_AGENT_PROMPT } from './agents/prompts.js';

const CACHE_PREFIX = 'recovery-actions-agent-';
const CACHE_TTL    = 15 * 60 * 1000;

const SYSTEM = `You are an SRE Recovery Actions AI. Given an incident description, generate immediate, actionable recovery steps.

Format EXACTLY:

IMMEDIATE_ACTIONS (do now — within 5 minutes):
1. <exact command or action>
2. <command>
3. <command>

STABILIZATION (next 15 minutes):
1. <action>
2. <action>

VERIFICATION:
- <how to confirm service is recovering — specific metric or command>
- <second verification step>

AWS_CLI_COMMANDS:
\`\`\`bash
# <comment>
<exact aws cli or kubectl command>
\`\`\`

ROLLBACK_PROCEDURE:
1. <step>
2. <step>
3. <step>

ETA_TO_RECOVERY: <realistic estimate>

Use exact service names and realistic AWS CLI commands for ECS/RDS. Be specific.`;

const PRESETS = [
  { label: 'DB pool exhausted',  q: 'payment-svc DB connection pool exhausted — 20/20 connections held, 130 timeouts/min, circuit breaker OPEN' },
  { label: 'High latency spike', q: 'checkout-api p99 latency at 2400ms (threshold 500ms), error rate 18%, deployment 30 min ago' },
  { label: 'Service OOM crash',  q: 'auth-svc ECS task crashing with OOM errors, 3 restarts in 10 min, JWT validation failing' },
  { label: 'Rollback needed',    q: 'payment-svc v2.3.1 deployment caused 18% error rate, need to rollback to v2.3.0' },
];

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Distil the most actionable summary from a raw runbook string.
 * Returns a one-line incident description suitable for the textarea,
 * or '' if nothing useful can be extracted.
 */
function distilRunbook(runbookText) {
  if (!runbookText || !runbookText.trim()) return '';

  const serviceMatch   = runbookText.match(/SERVICE:\s*(.+)/i);
  const sevMatch       = runbookText.match(/SEVERITY:\s*(.+)/i);
  const immediateMatch = runbookText.match(
    /IMMEDIATE_ACTIONS[^:]*:\s*([\s\S]*?)(?=\n[A-Z_]+:|$)/i,
  );

  const service  = serviceMatch?.[1]?.trim() ?? '';
  const severity = sevMatch?.[1]?.trim() ?? '';
  const actions  = immediateMatch
    ? immediateMatch[1].trim().split('\n').slice(0, 3).join('; ')
    : '';

  return [
    service  && `Service: ${service}`,
    severity && `Severity: ${severity}`,
    actions  && `Key actions from runbook: ${actions}`,
  ]
    .filter(Boolean)
    .join(' | ');
}

// ── sub-components ────────────────────────────────────────────────────────────

function CodeBlock({ children }) {
  return (
    <pre style={{ background: '#0f172a', color: '#7dd3fc', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
      {children}
    </pre>
  );
}

function RecoveryReport({ text }) {
  if (!text) return null;
  const eta =
  text.match(/ETA_TO_RECOVERY:\s*(.*)/i)?.[1] ||
  '15-30 min';
  const immediate =
  text.match(/IMMEDIATE_ACTIONS[\s\S]*?(?=STABILIZATION)/i)?.[0] || '';

const stabilization =
  text.match(/STABILIZATION[\s\S]*?(?=VERIFICATION)/i)?.[0] || '';

const verification =
  text.match(/VERIFICATION[\s\S]*?(?=AWS_CLI_COMMANDS)/i)?.[0] || '';

const rollback =
  text.match(/ROLLBACK_PROCEDURE[\s\S]*?(?=ETA_TO_RECOVERY)/i)?.[0] || '';

const awsCommands =
  text.match(/```[\s\S]*?```/)?.[0] || '';
  // const parts = text.split(/(```[\s\S]*?```)/g);
  // return (
  //   <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
  //     {parts.map((part, i) => {
  //       if (part.startsWith('```'))
  //         return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
  //       const lines = part.split('\n').map((line, j) => {
  //         if (/^(IMMEDIATE_ACTIONS|STABILIZATION|VERIFICATION|ROLLBACK_PROCEDURE|ETA_TO_RECOVERY):/.test(line)) {
  //           return (
  //             <div key={j} style={{ fontSize: 10, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 12, marginBottom: 4, fontFamily: 'var(--font-display)' }}>
  //               {line}
  //             </div>
  //           );
  //         }
  //         return <span key={j} style={{ whiteSpace: 'pre-wrap', display: 'block' }}>{line}</span>;
  //       });
  //       return <span key={i}>{lines}</span>;
  //     })}
  //   </div>
  // );
  return (
  <div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }}
    >

      <Card
        style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: 16
        }}
      >
        <SectionLabel>Immediate Actions</SectionLabel>

        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
          {immediate}
        </div>
      </Card>

      <Card
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: 16
        }}
      >
        <SectionLabel>Stabilization</SectionLabel>

        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
          {stabilization}
        </div>
      </Card>

      <Card
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: 16
        }}
      >
        <SectionLabel>Verification</SectionLabel>

        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
          {verification}
        </div>
      </Card>

      <Card
        style={{
          background: '#fff7ed',
          border: '1px solid #fdba74',
          padding: 16
        }}
      >
        <SectionLabel>Rollback Procedure</SectionLabel>

        <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
          {rollback}
        </div>
      </Card>

    </div>

    <Card
      style={{
        marginTop: 12,
        padding: 16
      }}
    >
      <SectionLabel>AWS Commands</SectionLabel>

      <CodeBlock>
        {awsCommands
          .replace(/^```[^\n]*\n?/, '')
          .replace(/```$/, '')}
      </CodeBlock>
    </Card>

  </div>
);
}

// ── main component ────────────────────────────────────────────────────────────

export default function RecoveryActions({ autoFillQuery: autoFillQueryProp, onResult }) {
  // ── context wiring ────────────────────────────────────────────────────────
  // 'recovery' is the agent key; IncidentContext must register it.
  // upstreamContext will contain runbookResult written by RunbookGeneration.
  const agent = useAgent('recovery');
  const { runbookResult } = agent.upstreamContext;

  // ── local UI state ────────────────────────────────────────────────────────
  const [query,      setQuery]      = useState(PRESETS[0].q);
  const [autoFilled, setAutoFilled] = useState(false);
  const [copied,     setCopied]     = useState(false);

  // ── auto-fill: context runbook result (primary) ───────────────────────────
  useEffect(() => {
    const filled = distilRunbook(runbookResult);
    if (!filled) return;
    setQuery(filled);
    setAutoFilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runbookResult]);

  // ── auto-fill: legacy prop (fallback, lower priority) ────────────────────
  useEffect(() => {
    // Only apply the prop if the context hasn't already provided a richer fill.
    if (runbookResult && runbookResult.trim()) return;
    const filled = distilRunbook(autoFillQueryProp);
    if (!filled) return;
    setQuery(filled);
    setAutoFilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFillQueryProp]);

  // ── generate ──────────────────────────────────────────────────────────────
  async function run() {
    if (!query.trim() || agent.isRunning) return;

    const ctx      = buildContext(agent.upstreamContext, ['runbookResult']);
    const userMsg  = `Generate recovery actions for: ${query}${ctx}`;
    const cacheKey = CACHE_PREFIX + encodeURIComponent(query + ctx);

    // ── MUST call onStart before cache check (same pattern as Runbook/Postmortem)
    agent.onStart();

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          await new Promise(r => setTimeout(r, 120));
          agent.onDone(parsed.result);
          onResult?.(parsed.result);   // legacy callback
          return;
        }
      }
    } catch (err) {
      console.error('Cache read failed:', err);
    }

    await runAgent({
      // Use RECOVERY_AGENT_PROMPT from prompts.js if available; fall back to
      // the inline SYSTEM constant so the file works standalone too.
      system:      (typeof RECOVERY_AGENT_PROMPT !== 'undefined' ? RECOVERY_AGENT_PROMPT : null) ?? SYSTEM,
      userMessage: userMsg,
      onStart:     () => {},           // already called above
      onChunk:     agent.onChunk,
      onDone: (result) => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ result, timestamp: Date.now() }));
        } catch (err) {
          console.error('Cache write failed:', err);
        }
        agent.onDone(result);          // → writes recoveryResult to context
        onResult?.(result);            // → legacy callback for parent (PostmortemGeneration prop path)
      },
      onError: agent.onError,
      maxTokens: 4096,
    });
  }

  function copyReport() {
  navigator.clipboard.writeText(response);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
}

  function exportMarkdown() {
  const blob = new Blob(
    [response],
    { type: 'text/markdown' }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = 'recovery-plan.md';

  a.click();

  URL.revokeObjectURL(url);
}



  // ── render ────────────────────────────────────────────────────────────────
  const response = agent.result;
  const loading  = agent.isRunning;

  return (
    <div className="fade-in">
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Incident presets</SectionLabel>
          {autoFilled && (
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
              ✓ Pre-filled from Runbook — edit freely
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => setQuery(p.q)} style={{
              background: query === p.q ? '#fef2f2' : 'var(--content-bg)',
              border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`,
              color: query === p.q ? '#991b1b' : 'var(--text-secondary)',
              borderRadius: 6, padding: '4px 12px', fontSize: 12,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontWeight: query === p.q ? 500 : 400, transition: 'all 0.15s',
            }}>{p.label}</button>
          ))}
        </div>

        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Describe the incident — service, symptoms, error rates…"
          rows={4}
          style={{
            width: '100%', padding: '8px 12px',
            border: '1px solid var(--content-border)', borderRadius: 8,
            fontSize: 13, fontFamily: 'var(--font-body)',
            background: 'var(--content-bg)', color: 'var(--text-primary)',
            resize: 'vertical', outline: 'none',
          }}
        />

        <div style={{ marginTop: 10 }}>
          <Button variant="primary" onClick={run} disabled={loading}
            icon={loading ? <Spinner size={14} color="#fff" /> : null}>
            {loading ? 'Generating…' : '🚨 Generate Recovery Plan'}
          </Button>
        </div>
      </Card>

      {(response || loading) && (
        <Card className="fade-in">
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Recovery plan</SectionLabel>
            {loading  && <Spinner size={13} />}
            {!loading && <Badge variant="green">Ready</Badge>}
            {!loading && response && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#10b981', fontWeight: 500 }}>
                ✓ Postmortem tab pre-filled
              </span>
            )}
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
    Recovery Plan
  </SectionLabel>

  {loading && <Spinner size={13} />}

  {!loading && (
    <Badge variant="green">
      Ready
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

      <span
        style={{
          fontSize: 11,
          color: '#10b981',
          fontWeight: 500
        }}
      >
        ✓ Postmortem tab pre-filled
      </span>
    </div>
  )}
</div>
          {loading && !response
            ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Building recovery plan…</div>
            : <RecoveryReport text={response} />
          }
        </Card>
      )}
    </div>
  );
}