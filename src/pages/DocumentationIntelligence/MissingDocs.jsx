import React, { useState } from 'react';
import { Card, SectionLabel, Button, Textarea, Spinner, Badge } from '../../components/UI.jsx';
import { callClaudeStream } from '../../lib/claude.js';

const SYSTEM = `You are a Documentation Completeness Analyzer. Given a service's source code structure or file list, identify what documentation is missing.

Check for:
- README.md (setup, usage, API reference)
- API documentation (OpenAPI/Swagger)
- Architecture decision records (ADRs)
- Runbooks for common operational scenarios
- Environment variable documentation
- Deployment guide
- Troubleshooting guide
- Contributing guide
- Changelog

For each missing document, output:
MISSING: <document name>
PRIORITY: <High/Medium/Low>
REASON: <why it matters>
TEMPLATE: <first 5-10 lines of what it should contain>

End with a summary score: Documentation coverage: X/10`;

const EXAMPLE = `payment-svc/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── payments.ts
│   │   └── health.ts
│   ├── services/
│   │   ├── stripe.ts
│   │   └── database.ts
│   └── middleware/
│       └── auth.ts
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example`;

function MissingDocCard({ block }) {
  const lines = block.trim().split('\n');
  const missing = lines.find(l => l.startsWith('MISSING:'))?.replace('MISSING:', '').trim();
  const priority = lines.find(l => l.startsWith('PRIORITY:'))?.replace('PRIORITY:', '').trim();
  const reason = lines.find(l => l.startsWith('REASON:'))?.replace('REASON:', '').trim();
  const template = lines.find(l => l.startsWith('TEMPLATE:'))?.replace('TEMPLATE:', '').trim();
  if (!missing) return <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{block}</div>;
  const pColor = priority === 'High' ? { bg: '#fef2f2', border: '#fecaca', tc: '#991b1b', bv: 'red' } : priority === 'Medium' ? { bg: '#fffbeb', border: '#fde68a', tc: '#92400e', bv: 'amber' } : { bg: '#f0fdf4', border: '#bbf7d0', tc: '#166534', bv: 'green' };
  return (
    <div style={{ background: pColor.bg, border: `1px solid ${pColor.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: pColor.tc }}>📄 {missing}</span>
        <Badge variant={pColor.bv}>{priority}</Badge>
      </div>
      {reason && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{reason}</div>}
      {template && <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 11, fontFamily: 'var(--font-mono)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{template}</pre>}
    </div>
  );
}

function ParsedResult({ text }) {
  if (!text) return null;
  // Split on MISSING: boundaries
  const blocks = text.split(/(?=MISSING:)/g).filter(Boolean);
  const summaryMatch = text.match(/Documentation coverage:\s*.+/);
  if (blocks.length <= 1) return <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>;
  return (
    <div>
      {summaryMatch && <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>{summaryMatch[0]}</div>}
      {blocks.map((b, i) => <MissingDocCard key={i} block={b} />)}
    </div>
  );
}

export default function MissingDocs() {
  const [input, setInput] = useState(EXAMPLE);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!input.trim() || loading) return;
    setResponse('');
    setLoading(true);
    try {
      await callClaudeStream({ system: SYSTEM, messages: [{ role: 'user', content: `Service file structure:\n${input}` }], maxTokens: 1200, onChunk: (_, full) => setResponse(full), onDone: () => setLoading(false) });
    } catch (e) { setResponse(`Error: ${e.message}`); setLoading(false); }
  }

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <SectionLabel>Paste your service file structure or file list</SectionLabel>
        <Textarea value={input} onChange={e => setInput(e.target.value)} rows={12} placeholder="Paste directory tree or ls output…" />
        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={run} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>{loading ? 'Scanning…' : '🔍 Find Missing Docs'}</Button>
        </div>
      </Card>
      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Missing documentation report</SectionLabel>
            {loading && <Spinner size={13} />}
            {!loading && <Badge variant="amber">Review required</Badge>}
          </div>
          {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Scanning for missing documentation…</div> : <ParsedResult text={response} />}
        </Card>
      )}
    </div>
  );
}