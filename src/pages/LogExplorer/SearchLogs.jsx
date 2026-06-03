// import React, { useState } from 'react';
// import { Card, SectionLabel, Badge, PageHeader, Button, Input, LogLine, Spinner } from '../components/UI.jsx';
// import { MOCK_LOGS } from '../lib/mockData.js';
// import { callClaudeStream } from '../lib/claude.js';

// const PRESETS = [
//   { label: 'Payment failures (2h)', q: 'Show payment failures from the last 2 hours', variant: 'red' },
//   { label: '5xx errors on checkout', q: 'Show 5xx errors on the checkout API in the last hour', variant: 'amber' },
//   { label: 'Auth timeouts', q: 'Find all timeout errors in the auth service today', variant: 'blue' },
//   { label: 'Slow DB queries', q: 'Show slow database queries above 2 seconds in the last 3 hours', variant: 'gray' },
//   { label: 'Circuit breaker events', q: 'Show all circuit breaker state changes today', variant: 'gray' },
// ];

// const SYSTEM = `You are a Log Intelligence AI for AWS CloudWatch. Given a natural language query from a developer, do the following:

// 1. Generate a valid CloudWatch Logs Insights query (using fields, filter, stats, sort, limit syntax)
// 2. Analyze the provided log data and identify patterns
// 3. Write a concise summary (3-4 sentences) covering: what the logs show, the main error pattern, time range and frequency, and one recommended next step

// Format your response EXACTLY like this:
// CLOUDWATCH_QUERY:
// <the query here>

// ANALYSIS:
// <your analysis paragraphs here>

// Do not use markdown headers. Be specific with numbers from the log data.`;

// function generateCWQuery(query) {
//   const q = query.toLowerCase();
//   if (q.includes('payment') || q.includes('failure') || q.includes('timeout')) {
//     return `fields @timestamp, @message, @logStream
// | filter @message like /PaymentGateway|ERROR|timeout|circuit/
// | filter @message not like /healthcheck/
// | sort @timestamp desc
// | limit 100`;
//   }
//   if (q.includes('5xx') || q.includes('503') || q.includes('500')) {
//     return `fields @timestamp, @message, @logStream
// | filter @message like /5[0-9][0-9]|ServerError|upstream/
// | stats count() as error_count by bin(5min)
// | sort @timestamp desc
// | limit 50`;
//   }
//   if (q.includes('slow') || q.includes('query')) {
//     return `fields @timestamp, @message, @logStream
// | filter @message like /SlowQuery|query_ms|duration/
// | filter @message like /[2-9][0-9]{3}ms|[0-9]{5}ms/
// | sort @timestamp desc
// | limit 50`;
//   }
//   return `fields @timestamp, @message, @logStream, @logGroup
// | filter @message like /ERROR|WARN|exception|timeout/
// | sort @timestamp desc
// | limit 100`;
// }

// function filterLogs(query) {
//   const q = query.toLowerCase();
//   return MOCK_LOGS.filter(log => {
//     if (q.includes('payment') || q.includes('failure')) return log.service === 'payment-svc';
//     if (q.includes('auth')) return log.service === 'auth-svc';
//     if (q.includes('checkout') || q.includes('5xx')) return log.service === 'checkout-api';
//     if (q.includes('slow') || q.includes('db') || q.includes('query')) return log.message.toLowerCase().includes('query') || log.message.toLowerCase().includes('db');
//     if (q.includes('circuit')) return log.message.toLowerCase().includes('circuit');
//     return log.level === 'ERROR' || log.level === 'WARN';
//   });
// }

// export default function LogsPage() {
//   const [query, setQuery] = useState('Show payment failures from the last 2 hours');
//   const [cwQuery, setCwQuery] = useState('');
//   const [logs, setLogs] = useState([]);
//   const [analysis, setAnalysis] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [ran, setRan] = useState(false);

//   async function runQuery() {
//     if (!query.trim() || loading) return;
//     setLoading(true);
//     setAnalysis('');
//     setRan(true);

//     const generatedCW = generateCWQuery(query);
//     setCwQuery(generatedCW);

//     const filteredLogs = filterLogs(query);
//     setLogs(filteredLogs);

//     const logText = filteredLogs.map(l =>
//       `[${new Date(l.ts).toLocaleTimeString()}] [${l.level}] [${l.service}] ${l.message}`
//     ).join('\n');

//     const prompt = `Developer query: "${query}"\n\nMatched log entries (${filteredLogs.length} results):\n${logText || '(no matching logs found)'}`;

//     try {
//       let rawFull = '';
//       await callClaudeStream({
//         system: SYSTEM,
//         messages: [{ role: 'user', content: prompt }],
//         maxTokens: 700,
//         onChunk: (_, full) => {
//           rawFull = full;
//           const match = full.match(/ANALYSIS:\s*([\s\S]*)/);
//           if (match) setAnalysis(match[1]);
//         },
//         onDone: (full) => {
//           const match = full.match(/ANALYSIS:\s*([\s\S]*)/);
//           setAnalysis(match ? match[1] : full);
//           setLoading(false);
//         },
//       });
//     } catch (e) {
//       setAnalysis(`Error: ${e.message}`);
//       setLoading(false);
//     }
//   }

//   const errorCount = logs.filter(l => l.level === 'ERROR').length;
//   const warnCount = logs.filter(l => l.level === 'WARN').length;

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Log Analyzer"
//         subtitle="Natural language → CloudWatch Insights query → AI-summarized findings."
//       />

//       <Card style={{ marginBottom: 14 }}>
//         <SectionLabel>Sample queries</SectionLabel>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
//           {PRESETS.map(p => (
//             <button
//               key={p.q}
//               onClick={() => setQuery(p.q)}
//               style={{
//                 background: query === p.q ? '#fef2f2' : 'var(--content-bg)',
//                 border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`,
//                 color: query === p.q ? '#991b1b' : 'var(--text-secondary)',
//                 borderRadius: 6, padding: '4px 12px', fontSize: 12,
//                 cursor: 'pointer', fontFamily: 'var(--font-body)',
//                 fontWeight: query === p.q ? 500 : 400, transition: 'all 0.15s',
//               }}
//             >{p.label}</button>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Input
//             value={query}
//             onChange={e => setQuery(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && runQuery()}
//             placeholder="e.g. Show payment failures from the last 2 hours"
//             style={{ flex: 1 }}
//           />
//           <Button variant="primary" onClick={runQuery} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
//             {loading ? 'Querying…' : 'Run Query'}
//           </Button>
//         </div>
//       </Card>

//       {ran && (
//         <>
//           {/* CloudWatch query */}
//           <Card style={{ marginBottom: 12, padding: '14px 16px' }} className="fade-in">
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
//               <SectionLabel style={{ marginBottom: 0 }}>Generated CloudWatch Insights query</SectionLabel>
//               <Badge variant="dark">aws logs start-query</Badge>
//             </div>
//             <pre style={{
//               background: '#0f172a', color: '#7dd3fc',
//               borderRadius: 8, padding: '12px 14px',
//               fontFamily: 'var(--font-mono)', fontSize: '12px',
//               lineHeight: 1.6, overflow: 'auto', margin: 0,
//               border: '1px solid #1e293b',
//             }}>{cwQuery}</pre>
//           </Card>

//           {/* Log results */}
//           {logs.length > 0 && (
//             <Card style={{ marginBottom: 12, padding: '14px 16px' }} className="fade-in">
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
//                 <SectionLabel style={{ marginBottom: 0 }}>Log results</SectionLabel>
//                 <Badge variant="gray">{logs.length} entries</Badge>
//                 {errorCount > 0 && <Badge variant="red">{errorCount} errors</Badge>}
//                 {warnCount > 0 && <Badge variant="amber">{warnCount} warnings</Badge>}
//               </div>
//               <div style={{ maxHeight: 280, overflowY: 'auto' }}>
//                 {logs.map(log => <LogLine key={log.id} log={log} />)}
//               </div>
//             </Card>
//           )}

//           {/* AI Analysis */}
//           <Card className="fade-in">
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//               <SectionLabel style={{ marginBottom: 0 }}>AI analysis</SectionLabel>
//               {loading && <Spinner size={13} />}
//               {!loading && analysis && <Badge variant="blue">Complete</Badge>}
//             </div>
//             {loading && !analysis
//               ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Analyzing log patterns…</div>
//               : <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{analysis}</div>
//             }
//           </Card>
//         </>
//       )}

//       {!ran && (
//         <Card style={{ background: 'var(--content-bg)', borderStyle: 'dashed' }}>
//           <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
//             <div style={{ fontSize: 28, marginBottom: 8 }}>◉</div>
//             <div style={{ fontSize: 13 }}>Enter a natural language query to analyze logs.</div>
//             <div style={{ fontSize: 11, marginTop: 5 }}>Generates a CloudWatch Insights query, scans logs, and summarizes findings.</div>
//           </div>
//         </Card>
//       )}
//     </div>
//   );
// }









import React, { useState } from 'react';
import { Card, SectionLabel, Badge, PageHeader, Button, Input, LogLine, Spinner } from '../../components/UI.jsx';

const API = 'http://localhost:3001';

const PRESETS = [
  { label: 'Payment failures (2h)',    q: 'Show payment failures from the last 2 hours' },
  { label: '5xx errors on checkout',  q: 'Show 5xx errors on the checkout API in the last hour' },
  { label: 'Auth timeouts',           q: 'Find all timeout errors in the auth service today' },
  { label: 'Slow DB queries (3h)',    q: 'Show slow database queries above 2 seconds in the last 3 hours' },
  { label: 'Circuit breaker events',  q: 'Show all circuit breaker state changes today' },
];

// ── Phase 1: Ask backend (Gemini) to generate CW query ──────────────────────
async function generateQuery(naturalLanguage) {
  const res = await fetch(`${API}/generate-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ natural_language: naturalLanguage }),
  });
  if (!res.ok) throw new Error(`generate-query failed: ${res.status}`);
  const data = await res.json();
  return data.cw_query;
}

// ── Phase 3: Extract structured intent ──────────────────────────────────────
async function extractIntent(naturalLanguage) {
  const res = await fetch(`${API}/extract-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ natural_language: naturalLanguage }),
  });
  if (!res.ok) return null;
  return res.json();
}

// ── Phase 2: Fetch real (or mock) logs from backend ─────────────────────────
async function fetchLogs(cwQuery, hours, service) {
  const res = await fetch(`${API}/fetch-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cw_query: cwQuery, hours, log_group: service }),
  });
  if (!res.ok) throw new Error(`fetch-logs failed: ${res.status}`);
  return res.json();  // { source, logs, count }
}

// ── Phase 4+5: Full RCA with correlation ────────────────────────────────────
async function analyzeLogs(logs, deployments, metrics) {
  const res = await fetch(`${API}/analyze-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs, deployments, metrics }),
  });
  if (!res.ok) throw new Error(`analyze-logs failed: ${res.status}`);
  const data = await res.json();
  return data.analysis;
}

// ── Pipeline step indicator ───────────────────────────────────────────────────
function PipelineStep({ num, label, status }) {
  const colors = { done: '#10b981', active: '#3b82f6', idle: '#e2e8f0' };
  const textColors = { done: '#166534', active: '#1d4ed8', idle: '#94a3b8' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: colors[status], display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 10, fontWeight: 700,
        color: status === 'idle' ? '#94a3b8' : '#fff', flexShrink: 0,
        transition: 'background 0.3s',
      }}>
        {status === 'done' ? '✓' : num}
      </div>
      <span style={{ fontSize: 11.5, color: textColors[status], fontWeight: status === 'active' ? 600 : 400 }}>{label}</span>
    </div>
  );
}

function parseRCASection(text, key) {
  const regex = new RegExp(`${key}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`);
  const m = text.match(regex);
  return m ? m[1].trim() : '';
}

function RCAReport({ text }) {
  if (!text) return null;
  const sections = [
    { key: 'ROOT_CAUSE:',          bg: '#fef2f2', border: '#fecaca', tc: '#991b1b', label: 'Root Cause' },
    { key: 'EVIDENCE:',            bg: '#fffbeb', border: '#fde68a', tc: '#92400e', label: 'Evidence' },
    { key: 'FAILURE_CHAIN:',       bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8', label: 'Failure Chain' },
    { key: 'CONFIDENCE:',          bg: '#f8fafc', border: '#e2e8f0', tc: '#475569', label: 'Confidence' },
    { key: 'RECOMMENDED_ACTIONS:', bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534', label: 'Recommended Actions' },
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
    const content = text.slice(idx + sec.key.length, nextIdx).trim();
    blocks.push({ ...sec, content });
  }

  if (!blocks.length) {
    return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: b.tc, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{b.label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{b.content}</div>
        </div>
      ))}
    </div>
  );
}

export default function LogsPage({
  setActive,
  setSelectedIncident
}) {
  const [query, setQuery]         = useState('Show payment failures from the last 2 hours');
  const [cwQuery, setCwQuery]     = useState('');
  const [intent, setIntent]       = useState(null);
  const [logs, setLogs]           = useState([]);
  const [logSource, setLogSource] = useState('');
  const [analysis, setAnalysis]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [ran, setRan]             = useState(false);
  const [backendOk, setBackendOk] = useState(null);

  // Pipeline step tracking: idle | active | done
  const [steps, setSteps] = useState({ intent: 'idle', query: 'idle', fetch: 'idle', analyze: 'idle' });

  function setStep(key, val) {
    setSteps(prev => ({ ...prev, [key]: val }));
  }

  // Check backend health on first render
  React.useEffect(() => {
    fetch(`${API}/health`)
      .then(r => r.json())
      .then(d => setBackendOk(d.status === 'ok'))
      .catch(() => setBackendOk(false));
  }, []);

  async function runPipeline() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setRan(true);
    setCwQuery('');
    setIntent(null);
    setLogs([]);
    setAnalysis('');
    setSteps({ intent: 'idle', query: 'idle', fetch: 'idle', analyze: 'idle' });

    try {
      // Phase 3 — Intent extraction (parallel with query gen)
      setStep('intent', 'active');
      setStep('query', 'active');
      const [intentData, generatedQuery] = await Promise.all([
        extractIntent(query).catch(() => null),
        generateQuery(query),
      ]);
      setIntent(intentData);
      setCwQuery(generatedQuery);
      setStep('intent', 'done');
      setStep('query', 'done');

      // Phase 2 — Fetch logs
      setStep('fetch', 'active');
      const hours = intentData?.time_range_hours || 2;
      const logResult = await fetchLogs(generatedQuery, hours, intentData?.service);
      setLogs(logResult.logs || []);
      setLogSource(logResult.source || '');
      setStep('fetch', 'done');

      // Phase 4+5 — RCA + correlation
      setStep('analyze', 'active');
      // Fetch deployments + metrics for correlation
      const [deploymentsRes, metricsRes] = await Promise.all([
        fetch(`${API}/deployments`).then(r => r.json()).catch(() => ({ deployments: [] })),
        fetch(`${API}/metrics`).then(r => r.json()).catch(() => ({ metrics: {} })),
      ]);
      const rca = await analyzeLogs(logResult.logs || [], deploymentsRes.deployments, metricsRes.metrics);
      setAnalysis(rca);
      setStep('analyze', 'done');

    } catch (e) {
      setAnalysis(`Pipeline error: ${e.message}\n\nMake sure the backend is running:\n  cd backend && uvicorn main:app --reload --port 3001`);
      setStep('analyze', 'done');
    }
    setLoading(false);
  }

  console.log("LOGS:", logs);
  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const warnCount  = logs.filter(l => l.level === 'WARN').length;

  return (
    <div className="fade-in">
      <PageHeader
        title="Log Analyzer"
        subtitle="Natural language → Gemini-generated CloudWatch query → real log fetch → AI root cause analysis."
      />

      {/* Backend status banner */}
      {backendOk === false && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#991b1b' }}>
          ⚠ Backend not reachable at {API}. Run: <code style={{ fontFamily: 'var(--font-mono)', background: '#fef2f2' }}>cd backend && uvicorn main:app --reload --port 3001</code>
        </div>
      )}
      {backendOk === true && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px', marginBottom: 14, fontSize: 12, color: '#166534', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Backend connected — Gemini AI + CloudWatch pipeline ready
        </div>
      )}

      {/* Query input */}
      <Card style={{ marginBottom: 14 }}>
        <SectionLabel>Natural language query</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
          {PRESETS.map(p => (
            <button key={p.q} onClick={() => setQuery(p.q)} style={{
              background: query === p.q ? '#fef2f2' : 'var(--content-bg)',
              border: `1px solid ${query === p.q ? '#fecaca' : 'var(--content-border)'}`,
              color: query === p.q ? '#991b1b' : 'var(--text-secondary)',
              borderRadius: 6, padding: '4px 12px', fontSize: 12,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontWeight: query === p.q ? 500 : 400, transition: 'all 0.15s',
            }}>{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runPipeline()}
            placeholder="e.g. Show payment failures from the last 2 hours"
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={runPipeline} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
            {loading ? 'Running…' : 'Run Pipeline'}
          </Button>
        </div>
      </Card>

      {/* Pipeline step tracker */}
      {ran && (
        <Card style={{ marginBottom: 14, padding: '14px 18px' }} className="fade-in">
          <SectionLabel>AI pipeline</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <PipelineStep num={1} label="Intent extraction"          status={steps.intent} />
            <PipelineStep num={2} label="CloudWatch query (Gemini)"  status={steps.query} />
            <PipelineStep num={3} label="Log fetch (CloudWatch)"     status={steps.fetch} />
            <PipelineStep num={4} label="RCA + correlation"          status={steps.analyze} />
          </div>
        </Card>
      )}

      {/* Phase 3 — Extracted intent */}
      {intent && (
        <Card style={{ marginBottom: 12, padding: '12px 16px' }} className="fade-in">
          <SectionLabel>Extracted intent</SectionLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {intent.service       && <Badge variant="blue">service: {intent.service}</Badge>}
            {intent.time_range_hours && <Badge variant="gray">last {intent.time_range_hours}h</Badge>}
            {intent.severity      && <Badge variant={intent.severity === 'error' ? 'red' : 'amber'}>severity: {intent.severity}</Badge>}
            {intent.search_pattern && <Badge variant="dark">pattern: {intent.search_pattern}</Badge>}
          </div>
        </Card>
      )}

      {/* Phase 1 — Generated CW query */}
      {cwQuery && (
        <Card style={{ marginBottom: 12, padding: '14px 16px' }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Generated CloudWatch Insights query</SectionLabel>
            <Badge variant="dark">Gemini-generated</Badge>
          </div>
          <pre style={{
            background: '#0f172a', color: '#7dd3fc', borderRadius: 8,
            padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px',
            lineHeight: 1.6, overflow: 'auto', margin: 0, border: '1px solid #1e293b',
          }}>{cwQuery}</pre>
        </Card>
      )}

      {/* Phase 2 — Log results */}
      {logs.length > 0 && (
        <Card style={{ marginBottom: 12, padding: '14px 16px' }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Log results</SectionLabel>
            <Badge variant="gray">{logs.length} entries</Badge>
            {errorCount > 0 && <Badge variant="red">{errorCount} errors</Badge>}
            {warnCount  > 0 && <Badge variant="amber">{warnCount} warnings</Badge>}
            <Badge variant={logSource === 'cloudwatch' ? 'green' : 'gray'}>
              {logSource === 'cloudwatch' ? '☁ CloudWatch' : '📦 mock data'}
            </Badge>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <LogLine key={i} log={{ ...log, id: i, ts: log.timestamp }} />
            ))}
          </div>
        </Card>
      )}

      {/* Phase 4+5 — RCA */}
      {(analysis || (loading && steps.analyze === 'active')) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Root cause analysis + correlation</SectionLabel>
            {loading && steps.analyze === 'active' && <Spinner size={13} />}
            {!loading && analysis && <Badge variant="blue">Complete</Badge>}
          </div>
          {loading && !analysis
            ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Correlating logs, deployments, and metrics…</div>
            : <RCAReport text={analysis} /> 
          }
          {analysis && (
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

    setSelectedIncident({
      id: 'LOG-INCIDENT',
      title: 'Detected from Log Explorer',
      trigger: query
    });

    setActive('incident');

  }}
>
  🚨 Launch AI Investigation
</Button>
  </div>
)}
        </Card>
      )}

      {!ran && (
        <Card style={{ borderStyle: 'dashed', background: 'var(--content-bg)' }}>
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>◉</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>Enter a natural language query and click Run Pipeline.</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Gemini generates the CloudWatch query → backend fetches logs → AI performs root cause analysis
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
