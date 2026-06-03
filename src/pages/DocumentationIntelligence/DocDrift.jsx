import React, { useState } from 'react';
import { Card, SectionLabel, Badge, PageHeader, Button, Textarea, Spinner } from '../../components/UI.jsx';
import { MOCK_DOCS } from '../../lib/mockData.js';
import { callClaudeStream } from '../../lib/claude.js';

const SYSTEM = `You are a Documentation Drift Detector AI.

Your job is to compare README/documentation with the actual codebase configuration and identify every mismatch.

For each mismatch found, output exactly:

[MISMATCH #N] <short title>
📄 Documentation says: <value>
💻 Code actually has: <value>
⚠ Impact: <why it matters>
✅ Fix: <corrected documentation>

Continue until ALL mismatches are listed.

Do not stop after the first mismatch.

If there are no mismatches, return:
"No documentation drift detected."

After listing all mismatches, provide:

Summary:
- Total mismatches: N
- Severity: Critical / High / Medium / Low`;
const EXAMPLES = [
  {
    label: 'Payment Service',
    readme: MOCK_DOCS.readme,
    actual: MOCK_DOCS.actual,
  },
  {
    label: 'Auth Service',
    readme: `## Auth Service

### Requirements
- Node.js 16
- MongoDB 4.4

### Start
\`\`\`
npm run start
\`\`\`
PORT=8080
MONGO_URI=mongodb://localhost:27017/auth`,
    actual: `{
  "engines": { "node": ">=20" },
  "scripts": {
    "start:prod": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts"
  }
}
PORT=9090
MONGO_URI=mongodb://localhost:27017/auth_service_v2
REQUIRE_MFA=true`,
  },
];

function calculateDocScore(text) {
  const mismatchCount =
    (text.match(/\[MISMATCH/g) || []).length;

  return Math.max(
    100 - mismatchCount * 15,
    40
  );
}

function DriftResult({ text }) {
  if (!text) return null;
  const blocks = text.split(/(\[MISMATCH #\d+\])/g).filter(Boolean);
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].match(/\[MISMATCH #\d+\]/)) {
      const content = blocks[i + 1] || '';
      i++;
      out.push(
        <div key={i} style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '12px 14px', marginBottom: 10,
        }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#991b1b', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            {blocks[i - 1]}
          </div>
          <pre style={{ fontSize: 12, color: '#7f1d1d', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: 'var(--font-body)', margin: 0 }}>{content}</pre>
        </div>
      );
    } else {
      out.push(
        <div key={i} style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 8, padding: '10px 14px', marginTop: 6,
          fontSize: 12, color: '#166534', fontWeight: 500,
        }}>{blocks[i]}</div>
      );
    }
  }
  return <div>{out}</div>;
}

export default function DriftPage() {
  const [readme, setReadme] = useState(MOCK_DOCS.readme);
  const [actual, setActual] = useState(MOCK_DOCS.actual);
  const [response, setResponse] = useState('');
const [loading, setLoading] = useState(false);
const [exampleIdx, setExampleIdx] = useState(0);
const [healthScore, setHealthScore] = useState(null);
  

  function loadExample(idx) {
  setExampleIdx(idx);
  setReadme(EXAMPLES[idx].readme);
  setActual(EXAMPLES[idx].actual);
  setResponse('');
  setHealthScore(null);
}

  async function detect() {
    if (loading) return;
    setResponse('');
setHealthScore(null);
setLoading(true);
    const prompt = `README / Documentation:\n\`\`\`\n${readme}\n\`\`\`\n\nActual code / config:\n\`\`\`\n${actual}\n\`\`\``;
    try {
      await callClaudeStream({
        system: SYSTEM,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1200,
        onChunk: (_, full) => setResponse(full),
        // onDone: () => setLoading(false),
        onDone: (full) => {
  setHealthScore(
    calculateDocScore(full)
  );

  setLoading(false);
},
      });
    } catch (e) {
      setResponse(`Error: ${e.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Documentation Drift Detector"
        subtitle="Paste your README and actual config — the AI finds every mismatch and suggests fixes."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => loadExample(i)}
            style={{
              background: exampleIdx === i ? '#eff6ff' : 'var(--content-bg)',
              border: `1px solid ${exampleIdx === i ? '#bfdbfe' : 'var(--content-border)'}`,
              color: exampleIdx === i ? '#1d4ed8' : 'var(--text-secondary)',
              borderRadius: 6, padding: '4px 12px', fontSize: 12,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontWeight: exampleIdx === i ? 500 : 400,
            }}
          >{ex.label} example</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Card style={{ padding: '14px 16px' }}>
          <SectionLabel>README / Documentation</SectionLabel>
          <Textarea
            value={readme}
            onChange={e => setReadme(e.target.value)}
            placeholder="Paste your README or documentation here…"
            rows={14}
          />
        </Card>
        <Card style={{ padding: '14px 16px' }}>
          <SectionLabel>Actual code / config (package.json, .env, etc.)</SectionLabel>
          <Textarea
            value={actual}
            onChange={e => setActual(e.target.value)}
            placeholder="Paste your actual package.json, .env, or config file here…"
            rows={14}
          />
        </Card>
      </div>

      <Button variant="primary" onClick={detect} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null} style={{ marginBottom: 16 }}>
        {loading ? 'Detecting drift…' : '⟳  Detect Documentation Drift'}
      </Button>

      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Drift analysis</SectionLabel>
            {loading && <Spinner size={13} />}
            {!loading && <Badge variant="red">Review required</Badge>}
          </div>
          {/* {loading && !response
            ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Comparing documentation against actual configuration…</div>
            : <DriftResult text={response} />
          } */}
          {loading && !response
  ? (
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          color: 'var(--text-muted)',
          fontSize: 13
        }}
      >
        <Spinner />
        Comparing documentation against actual configuration…
      </div>
    )
  : (
      <>
        {healthScore && (
          <Card style={{ marginBottom: 14 }}>
            <SectionLabel>
              Documentation Health
            </SectionLabel>

            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color:
                  healthScore > 80
                    ? '#10b981'
                    : healthScore > 60
                    ? '#f59e0b'
                    : '#ef4444'
              }}
            >
              {healthScore}/100
            </div>
          </Card>
        )}

        <DriftResult text={response} />
      </>
    )
}
        </Card>
      )}
    </div>
  );
}
