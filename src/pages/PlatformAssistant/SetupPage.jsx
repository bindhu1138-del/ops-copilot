import React, { useState } from 'react';
import { Card, SectionLabel, Badge, PageHeader, Button, Input, Spinner } from '../../components/UI.jsx';
import { callClaudeStream } from '../../lib/claude.js';

const PRESETS = [
  { label: 'Payment Service', q: 'How do I run the payment service locally?', variant: 'blue' },
  { label: 'Auth Service', q: 'How do I set up the auth service locally?', variant: 'blue' },
  { label: 'Notification Service', q: 'How do I run the notification microservice locally?', variant: 'blue' },
  { label: 'Order Service + Redis + RabbitMQ', q: 'How do I configure the order service with local Redis and RabbitMQ?', variant: 'gray' },
  { label: 'Checkout API', q: 'How do I set up the checkout API with database migrations?', variant: 'gray' },
];

const SYSTEM = `You are an AI Setup Assistant for microservices in a Node.js/TypeScript monorepo. Given a developer question about running a service locally, generate a detailed, actionable setup guide.

Structure your response exactly like this:
1. Prerequisites — list every requirement (Node version, DB, env vars, tools)
2. Clone & install — commands to get the repo and install dependencies
3. Configure environment — what .env variables are needed and sample values
4. Start the service — exact commands to run
5. Verify it's running — how to confirm the service started (health check URL, expected log output)
6. Common pitfalls — 2-3 things that often go wrong and how to fix them

Use realistic service names, ports, and configs. Format commands in code blocks using backtick fences. Be concrete — no placeholders like <your-value>; use realistic mock values.Provide a complete response covering all six sections.Do not stop until all sections are finished.Use markdown headings and code blocks.`;

function CodeBlock({ code }) {
  return (
    <pre style={{
      background: '#0f172a', color: '#e2e8f0',
      borderRadius: 8, padding: '12px 14px',
      fontFamily: 'var(--font-mono)', fontSize: '11.5px',
      lineHeight: 1.6, overflow: 'auto', margin: '8px 0',
      border: '1px solid #1e293b',
    }}><code>{code}</code></pre>
  );
}

function RenderResponse({ text }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-primary)' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return <CodeBlock key={i} code={code} />;
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </div>
  );
}

export default function SetupPage() {
  const [query, setQuery] = useState('How do I run the payment service locally?');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!query.trim() || loading) return;
    setResponse('');
    setLoading(true);
    try {
      await callClaudeStream({
        system: SYSTEM,
        messages: [{ role: 'user', content: query }],
        maxTokens: 4096,
        onChunk: (_, full) => setResponse(full),
        onDone: () => setLoading(false),
      });
    } catch (e) {
      setResponse(`Error: ${e.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Local Environment Setup Assistant"
        subtitle="Ask how to run any service — the AI reads docs, detects dependencies, and generates setup steps."
      />

      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>Quick presets</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setQuery(p.q)}
              style={{
                background: query === p.q ? '#eff6ff' : 'var(--content-bg)',
                border: `1px solid ${query === p.q ? '#bfdbfe' : 'var(--content-border)'}`,
                color: query === p.q ? '#1d4ed8' : 'var(--text-secondary)',
                borderRadius: 6, padding: '4px 12px', fontSize: 12,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontWeight: query === p.q ? 500 : 400,
                transition: 'all 0.15s',
              }}
            >{p.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="e.g. How do I run the payment service locally?"
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={run} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>
            {loading ? 'Generating…' : 'Generate Steps'}
          </Button>
        </div>
      </Card>

      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>AI-generated setup guide</SectionLabel>
            {loading && <Spinner size={13} />}
            {!loading && response && <Badge variant="green">Complete</Badge>}
          </div>
          {loading && !response
            ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner size={14} />Analyzing documentation and generating steps…</div>
            : <RenderResponse text={response} />
          }
        </Card>
      )}

      {!response && !loading && (
        <Card style={{ background: 'var(--content-bg)', borderStyle: 'dashed' }}>
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 13 }}>Select a preset or type your question, then click Generate Steps.</div>
            <div style={{ fontSize: 11, marginTop: 5 }}>The AI generates prerequisites, commands, env config, and common pitfalls.</div>
          </div>
        </Card>
      )}
    </div>
  );
}
