import React, { useState } from 'react';
import { Card, SectionLabel, Button, Textarea, Spinner, Badge } from '../../components/UI.jsx';
import { callClaudeStream } from '../../lib/claude.js';

const SYSTEM = `You are a README Quality Validator. Analyze the provided README and score it.

Evaluate these dimensions (score each 1-10):
- COMPLETENESS: Does it cover setup, usage, config, API, contributing?
- ACCURACY: Are commands realistic and likely to work?
- CLARITY: Is it well-organized and easy to follow?
- EXAMPLES: Does it include code examples and sample outputs?
- MAINTENANCE: Does it have version info, changelog, last-updated?

Output format:
SCORES:
Completeness: X/10
Accuracy: X/10
Clarity: X/10
Examples: X/10
Maintenance: X/10
Overall: X/10

ISSUES:
• <issue 1 — be specific, quote the problematic text>
• <issue 2>

IMPROVEMENTS:
1. <concrete improvement with example text>
2. <improvement>
3. <improvement>

VERDICT: <Pass (8+) / Needs Work (5-7) / Fail (<5)>`;

const EXAMPLE = `# Payment Service

A service for processing payments.

## Setup
Run npm install then npm start.

## API
POST /pay - make a payment

## Notes
Make sure to set your env vars.`;

export default function ReadmeValidator() {
  const [input, setInput] = useState(EXAMPLE);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!input.trim() || loading) return;
    setResponse('');
    setLoading(true);
    try {
      await callClaudeStream({ system: SYSTEM, messages: [{ role: 'user', content: `Validate this README:\n\n${input}` }], maxTokens: 1200, onChunk: (_, full) => setResponse(full), onDone: () => setLoading(false) });
    } catch (e) { setResponse(`Error: ${e.message}`); setLoading(false); }
  }

  function parseScores(text) {
    const lines = text.match(/(\w[\w ]+):\s*(\d+)\/10/g) || [];
    return lines.map(l => { const m = l.match(/(.+):\s*(\d+)\/10/); return m ? { label: m[1].trim(), score: parseInt(m[2]) } : null; }).filter(Boolean);
  }

  const scores = response ? parseScores(response) : [];
  const verdictMatch = response.match(/VERDICT:\s*(.+)/);
  const verdict = verdictMatch?.[1]?.trim();
  const verdictColor = verdict?.startsWith('Pass') ? 'green' : verdict?.startsWith('Needs') ? 'amber' : verdict?.startsWith('Fail') ? 'red' : 'gray';

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <SectionLabel>Paste your README content</SectionLabel>
        <Textarea value={input} onChange={e => setInput(e.target.value)} rows={12} placeholder="Paste your README.md content here…" />
        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={run} disabled={loading} icon={loading ? <Spinner size={14} color="#fff" /> : null}>{loading ? 'Validating…' : '✓ Validate README'}</Button>
        </div>
      </Card>

      {scores.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, marginBottom: 14 }} className="fade-in">
          {scores.map(s => {
            const color = s.score >= 8 ? '#10b981' : s.score >= 5 ? '#f59e0b' : '#ef4444';
            return (
              <Card key={s.label} style={{ padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{s.score}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
                <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.score * 10}%`, background: color, borderRadius: 2 }} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Validation report</SectionLabel>
            {loading && <Spinner size={13} />}
            {verdict && <Badge variant={verdictColor}>{verdict}</Badge>}
          </div>
          {loading && !response ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Analyzing README…</div> : <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{response}</div>}
        </Card>
      )}
    </div>
  );
}