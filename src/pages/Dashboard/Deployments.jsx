import React from 'react';
import { Card, SectionLabel, Badge } from '../../components/UI.jsx';
import { MOCK_DEPLOYMENTS } from '../../lib/mockData.js';

const ALL_DEPLOYMENTS = [
  ...MOCK_DEPLOYMENTS,
  { id: 'd5', version: 'v2.3.0', service: 'payment-svc', timeLabel: 'Yesterday 11:00 UTC', author: 'Priya Sharma', status: 'healthy', changes: 'Minor config cleanup, no functional changes', commit: 'e8d2f01', pr: '#468' },
  { id: 'd6', version: 'v1.9.1', service: 'checkout-api', timeLabel: '2 days ago 09:20 UTC', author: 'Sofia Chen', status: 'healthy', changes: 'Dependency updates', commit: 'f3a9c55', pr: '#460' },
];

const STATUS_COLORS = {
  healthy:  { bg: '#f0fdf4', border: '#bbf7d0', dot: '#10b981', badge: 'green' },
  warning:  { bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', badge: 'amber' },
  incident: { bg: '#fef2f2', border: '#fecaca', dot: '#ef4444', badge: 'red'   },
};

export default function Deployments() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Deployments today', value: '4', sub: 'across all services' },
          { label: 'Incident-linked',   value: '1', sub: 'payment-svc v2.3.1' },
          { label: 'Avg deploy time',   value: '4m', sub: 'last 7 days' },
        ].map(m => (
          <Card key={m.label} style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionLabel>Deployment history</SectionLabel>
        {ALL_DEPLOYMENTS.map(d => {
          const c = STATUS_COLORS[d.status] || STATUS_COLORS.healthy;
          return (
            <div key={d.id} style={{
              display: 'flex', gap: 14, padding: '12px 14px',
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 10, marginBottom: 8, alignItems: 'flex-start',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{d.version}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.service}</span>
                  <Badge variant={c.badge}>{d.status}</Badge>
                  {d.status === 'incident' && <Badge variant="red">⚠ Linked to P1</Badge>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {d.timeLabel} · {d.author}
                  {d.commit && <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 8, background: '#1e293b', color: '#93c5fd', padding: '1px 6px', borderRadius: 4, fontSize: 10 }}>{d.commit}</span>}
                  {d.pr && <span style={{ marginLeft: 6, color: 'var(--accent-blue)', fontSize: 11 }}>{d.pr}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.changes}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}