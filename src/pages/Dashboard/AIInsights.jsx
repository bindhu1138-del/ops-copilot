import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Spinner,
  SectionLabel,
  Badge
} from '../../components/UI.jsx';
import { callClaude } from '../../lib/claude.js';

const SUGGESTED = [
  'What is causing the payment-svc degradation?',
  'How do I fix the DB connection pool exhaustion?',
  'What is the blast radius of the current P1?',
  'Which deployment triggered the latency spike?',
];

const SYSTEM = `You are an AI Operations Copilot. Current system context:
- payment-svc: DEGRADED — p99=1160ms, error_rate=18.4%, DB pool exhausted (20/20), circuit breaker=OPEN
- auth-svc: HEALTHY — p99=45ms, error_rate=0.02%
- checkout-api: WARNING — p99=780ms, error_rate=4.1%, circuit breaker=HALF_OPEN
- notification-svc: HEALTHY
- Last deployment: payment-svc v2.3.1 at 10:01 UTC by Priya Sharma — changed max_pool_size from 50 to 20
- Active incidents: P1 (payment latency+errors), P2 (checkout warning)
- DB timeouts: 130/min (was 2/min before deploy)
Answer SRE/dev questions concisely and specifically. Use the exact numbers above. For remediation, give concrete commands.`;

export default function AIInsights() {
  const [input, setInput] = useState('');
  // const [messages, setMessages] = useState([
  //   { role: 'assistant', text: 'Hello! I have full context on your production environment. I can see payment-svc is degraded after the v2.3.1 deployment — DB pool reduced 50→20 is the root cause. Ask me anything.' }
  // ]);
  const [messages, setMessages] = useState([
  {
    role: 'assistant',
    text:
`👋 AI Insights Ready

I have access to:
• Service Health
• Active Alerts
• Deployments
• Incident Data

Try asking:
• What caused the payment latency spike?
• Which deployment triggered the incident?
• How do I fix the DB connection pool exhaustion?`
  }
]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function send(msg) {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    const newHistory = [...history, { role: 'user', content: text }];
    try {
      const reply = await callClaude({ system: SYSTEM, messages: newHistory });
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${e.message}` }]);
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Suggested prompts */}
      <Card style={{ marginBottom: 14, padding: '14px 16px' }}>
        <SectionLabel>Suggested questions</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              background: 'var(--content-bg)', border: '1px solid var(--content-border)',
              borderRadius: 6, padding: '5px 12px', fontSize: 12,
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--content-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >{s}</button>
          ))}
        </div>
      </Card>

      {/* Chat window */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--content-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>AI Insights</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Full production context loaded</span>
        </div> */}
        <div
  style={{
    padding: '12px 18px',
    borderBottom: '1px solid var(--content-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#10b981',
      }}
    />

    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        color: 'var(--text-primary)',
      }}
    >
      AI Insights
    </span>
  </div>

  <div
    style={{
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
    }}
  >
    <Badge variant="green">Logs</Badge>
    <Badge variant="blue">Metrics</Badge>
    <Badge variant="amber">Deployments</Badge>
    <Badge variant="green">Alerts</Badge>
  </div>
</div>
        <div ref={chatRef} style={{ height: 420, overflowY: 'auto', padding: '16px 18px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                // <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0, marginRight: 8, marginTop: 2 }}>O</div>
                <div
  style={{
    width: 28,
    height: 28,
    borderRadius: '50%',
    background:
      'linear-gradient(135deg,#1d4ed8,#7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
    marginRight: 8,
    marginTop: 2,
  }}
>
  AI
</div>
              )}
              <div
  style={{
    maxWidth:
      i === 0 && m.role === 'assistant'
        ? '100%'
        : '78%',

    width:
      i === 0 && m.role === 'assistant'
        ? '100%'
        : 'auto',

    padding: '10px 14px',
                borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                background: m.role === 'user' ? 'var(--accent-blue)' : 'var(--content-bg)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.role === 'user' ? 'none' : '1px solid var(--content-border)',
                fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap',
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>O</div>
              <Spinner size={14} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thinking…</span>
            </div>
          )}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--content-border)', display: 'flex', gap: 8 }}>
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about your systems, incidents, metrics, or fixes…" />
          <Button variant="primary" onClick={() => send()} disabled={loading}>Send</Button>
        </div>
      </Card>
    </div>
  );
}