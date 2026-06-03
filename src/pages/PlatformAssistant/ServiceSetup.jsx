// import React, { useState } from 'react';
// import { Card, SectionLabel, Button, Input, Spinner, Badge } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `You are an AI Setup Assistant for microservices in a Node.js/TypeScript monorepo on AWS ECS.
// Given a developer question about running a service locally, generate a detailed actionable setup guide.

// Structure your response:
// 1. Prerequisites — Node version, DB, env vars, tools needed
// 2. Clone & install — exact shell commands
// 3. Configure environment — .env variables with realistic sample values
// 4. Start the service — exact commands
// 5. Verify it's running — health check URL, expected log output
// 6. Common pitfalls — 2-3 things that often go wrong and fixes

// Use realistic service names, ports, configs. Format commands in backtick code blocks. Under 400 words.`;

// const PRESETS = [
//   'How do I run the payment service locally?',
//   'How do I set up the auth service with local JWT?',
//   'How do I run checkout-api with Redis and Postgres?',
//   'How do I configure the notification service with SES locally?',
// ];

// function CodeBlock({ children }) {
//   return (
//     <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
//       {children}
//     </pre>
//   );
// }

// function RenderResponse({ text }) {
//   if (!text) return null;
//   const parts = text.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
//       {parts.map((part, i) => {
//         if (part.startsWith('```')) return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
//         return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
//       })}
//     </div>
//   );
// }

// export default function ServiceSetup() {
//   const [query, setQuery] = useState(PRESETS[0]);
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function run() {
//     if (!query.trim() || loading) return;
//     setResponse('');
//     setLoading(true);
//     try {
//       await callClaudeStream({ system: SYSTEM, messages: [{ role: 'user', content: query }], maxTokens: 4096, onChunk: (_, full) => setResponse(full), onDone: () => setLoading(false) });
//     } catch (e) { setResponse(`Error: ${e.message}`); setLoading(false); }
//   }

//   return (
//     <div>
//       <Card style={{ marginBottom: 16 }}>
//         <SectionLabel>Presets</SectionLabel>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
//           {PRESETS.map(p => (
//             <button key={p} onClick={() => setQuery(p)} style={{ background: query === p ? '#eff6ff' : 'var(--content-bg)', border: `1px solid ${query === p ? '#bfdbfe' : 'var(--content-border)'}`, color: query === p ? '#1d4ed8' : 'var(--text-secondary)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: query === p ? 500 : 400 }}>{p}</button>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} placeholder="e.g. How do I run the payment service locally?" style={{ flex: 1 }} />
//           <Button variant="primary" onClick={run} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>{loading ? 'Generating…' : '⚡ Generate Steps'}</Button>
//         </div>
//       </Card>
//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Setup guide</SectionLabel>
//             {loading && <Spinner size={13} />}
//             {!loading && <Badge variant="green">Complete</Badge>}
//           </div>
//           {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Generating setup steps…</div> : <RenderResponse text={response} />}
//         </Card>
//       )}
//     </div>
//   );
// }











import React, { useState } from 'react';
import { Card, SectionLabel, Button, Input, Spinner, Badge } from '../../components/UI.jsx';
import { callClaudeStream } from '../../lib/claude.js';

const SYSTEM = `You are an AI Setup Assistant for microservices in a Node.js/TypeScript monorepo on AWS ECS.
Given a developer question about running a service locally, generate a detailed actionable setup guide.

Structure your response:
1. Prerequisites — Node version, DB, env vars, tools needed
2. Clone & install — exact shell commands
3. Configure environment — .env variables with realistic sample values
4. Start the service — exact commands
5. Verify it's running — health check URL, expected log output
6. Common pitfalls — 2-3 things that often go wrong and fixes

Use realistic service names, ports, configs. Format commands in backtick code blocks. Under 400 words.`;

const PRESETS = [
  'How do I run the payment service locally?',
  'How do I set up the auth service with local JWT?',
  'How do I run checkout-api with Redis and Postgres?',
  'How do I configure the notification service with SES locally?',
];

const CACHE_PREFIX = 'service-setup-';
const CACHE_TTL    = 15 * 60 * 1000;

function CodeBlock({ children }) {
  return (
    <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6, overflow: 'auto', margin: '6px 0', border: '1px solid #1e293b', whiteSpace: 'pre-wrap' }}>
      {children}
    </pre>
  );
}

function RenderResponse({ text }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) return <CodeBlock key={i}>{part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '')}</CodeBlock>;
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </div>
  );
}

export default function ServiceSetup() {
  const [query, setQuery] = useState(PRESETS[0]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!query.trim() || loading) return;
    setResponse('');
    setLoading(true);

    const cacheKey = CACHE_PREFIX + encodeURIComponent(query);

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          await new Promise(r => setTimeout(r, 120));
          setResponse(parsed.result);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Cache read failed:', err);
    }

    try {
      await callClaudeStream({
        system: SYSTEM,
        messages: [{ role: 'user', content: query }],
        maxTokens: 4096,
        onChunk: (_, full) => setResponse(full),
        onDone: (full) => {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ result: full, timestamp: Date.now() }));
          } catch (err) {
            console.error('Cache write failed:', err);
          }
          setLoading(false);
        },
      });
    } catch (e) {
      setResponse(`Error: ${e.message}`);
      setLoading(false);
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>Presets</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
          {PRESETS.map(p => (
            <button key={p} onClick={() => setQuery(p)} style={{ background: query === p ? '#eff6ff' : 'var(--content-bg)', border: `1px solid ${query === p ? '#bfdbfe' : 'var(--content-border)'}`, color: query === p ? '#1d4ed8' : 'var(--text-secondary)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: query === p ? 500 : 400 }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} placeholder="e.g. How do I run the payment service locally?" style={{ flex: 1 }} />
          <Button variant="primary" onClick={run} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>{loading ? 'Generating…' : '⚡ Generate Steps'}</Button>
        </div>
      </Card>
      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Setup guide</SectionLabel>
            {loading && <Spinner size={13} />}
            {!loading && <Badge variant="green">Complete</Badge>}
          </div>
          {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Generating setup steps…</div> : <RenderResponse text={response} />}
        </Card>
      )}
    </div>
  );
}