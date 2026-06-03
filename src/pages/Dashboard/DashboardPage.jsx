import React, { useState, useRef, useEffect } from 'react';
import { Card, SectionLabel, Badge, StatusDot, MetricCard, PageHeader, Spinner, Button, Input } from '../../components/UI.jsx';
import { MOCK_SERVICES, MOCK_DEPLOYMENTS, TIMELINE_EVENTS, MOCK_METRICS } from '../../lib/mockData.js';
import { callClaude } from '../../lib/claude.js';

const ALERTS = [
  { id: 1, sev: 'critical', msg: 'payment-svc p99 latency SLA breach (1160ms > 500ms)', time: '12 min ago' },
  { id: 2, sev: 'critical', msg: 'Circuit breaker OPEN — payment-gateway (5 failures)', time: '10 min ago' },
  { id: 3, sev: 'warning',  msg: 'checkout-api error rate 4.1% (threshold: 2%)', time: '22 min ago' },
];

function HealthBar({ value, status }) {
  const color = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  );
}

export default function DashboardPage() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your ops copilot. I can see 3 active alerts — payment-svc is degraded after deployment v2.3.1. Ask me anything about service health, incidents, or how to fix an alert.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    const userMsg = { role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);
    const newHistory = [...history, { role: 'user', content: msg }];
    const SYSTEM = `You are an AI Operations Copilot embedded in a unified observability dashboard. Current system context:
- payment-svc: DEGRADED — p99=1160ms, error_rate=18.4%, DB timeouts=130/min, circuit breaker=OPEN
- auth-svc: HEALTHY — p99=45ms, error_rate=0.02%
- checkout-api: WARNING — p99=780ms, error_rate=4.1%
- notification-svc: HEALTHY
- Last deployment: payment-svc v2.3.1 (10:01 UTC, by Priya Sharma) — root cause: max_pool_size reduced 50→20
- Active incidents: P1 (payment latency), P2 (checkout warning)
Answer SRE/dev questions concisely and specifically. Use actual numbers from the context. For remediation, be concrete.`;
    try {
      const reply = await callClaude({ system: SYSTEM, messages: newHistory });
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${e.message}` }]);
    }
    setChatLoading(false);
  }

  const timelineColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6' };

  return (
    <div className="fade-in">
      <PageHeader
        title="Operations Dashboard"
        subtitle="Real-time system health — ap-south-1 production"
        actions={<Badge variant="red">3 active alerts</Badge>}
      />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        <MetricCard label="Overall Uptime" value="99.4%" delta="0.1% from yesterday" deltaDir="bad" />
        <MetricCard label="Active Alerts" value="3" delta="1 new in last hour" deltaDir="bad" />
        <MetricCard label="MTTR Today" value="12m" delta="from 34m yesterday" deltaDir="good" />
        <MetricCard label="Deployments" value="4" sub="Last 24 hours" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Service Health */}
        <Card>
          <SectionLabel>Service health</SectionLabel>
          {MOCK_SERVICES.map(svc => (
            <div key={svc.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <StatusDot status={svc.status} />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{svc.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{svc.instances} instances</span>
                  <Badge variant={svc.status === 'healthy' ? 'green' : svc.status === 'warning' ? 'amber' : 'red'} size="sm">
                    {svc.status}
                  </Badge>
                </div>
              </div>
              <HealthBar value={svc.health} status={svc.status} />
            </div>
          ))}
        </Card>

        {/* Active Alerts */}
        <Card>
          <SectionLabel>Active alerts</SectionLabel>
          {ALERTS.map(a => (
            <div key={a.id} style={{
              display: 'flex', gap: 10, padding: '10px 12px',
              background: a.sev === 'critical' ? '#fef2f2' : '#fffbeb',
              borderRadius: 8, marginBottom: 8,
              borderLeft: `3px solid ${a.sev === 'critical' ? '#ef4444' : '#f59e0b'}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: a.sev === 'critical' ? '#991b1b' : '#92400e', lineHeight: 1.5 }}>{a.msg}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14, marginBottom: 14 }}>
        {/* Recent deployments */}
        <Card>
          <SectionLabel>Recent deployments</SectionLabel>
          {MOCK_DEPLOYMENTS.map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: d.status === 'healthy' ? '#10b981' : d.status === 'warning' ? '#f59e0b' : '#ef4444' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.version}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.service}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{d.timeLabel} · {d.author}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Incident timeline */}
        <Card>
          <SectionLabel>Incident timeline — today's P1</SectionLabel>
          {TIMELINE_EVENTS.map((evt, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 9, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: timelineColors[evt.type], marginTop: 4, flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginRight: 6 }}>{evt.time}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{evt.label}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Chat */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--content-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Copilot Chat</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Ask anything about your systems</span>
        </div>
        <div ref={chatRef} style={{ height: 220, overflowY: 'auto', padding: '14px 18px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '9px 13px',
                borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                background: m.role === 'user' ? 'var(--accent-blue)' : 'var(--content-bg)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.role === 'user' ? 'none' : '1px solid var(--content-border)',
                fontSize: 13, lineHeight: 1.6,
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <Spinner size={14} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thinking…</span>
            </div>
          )}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--content-border)', display: 'flex', gap: 8 }}>
          <Input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder="Ask the copilot — 'What caused the payment spike?' or 'How do I fix the circuit breaker?'"
          />
          <Button variant="primary" onClick={sendChat} disabled={chatLoading}>Send</Button>
        </div>
      </Card>
    </div>
  );
}
