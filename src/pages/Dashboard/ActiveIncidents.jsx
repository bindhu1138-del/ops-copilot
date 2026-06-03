import React from 'react';
import { Card, SectionLabel, Badge, MetricCard } from '../../components/UI.jsx';
import { TIMELINE_EVENTS } from '../../lib/mockData.js';
// import { useIncident } from '../IncidentCopilot/IncidentContext.jsx';

const INCIDENTS = [
  {
    id: 'INC-001', sev: 'P1', status: 'open', title: 'payment-svc latency breach + DB pool exhaustion',
    started: '10:09 UTC', duration: '58 min', affected: 'payment-svc, checkout-api',
    owner: 'Priya Sharma', trigger: 'deployment v2.3.1',
    summary: 'DB pool reduced 50→20 caused cascading timeouts and circuit breaker activation.',
  },
  {
    id: 'INC-002', sev: 'P2', status: 'monitoring', title: 'checkout-api elevated error rate',
    started: '10:15 UTC', duration: '52 min', affected: 'checkout-api',
    owner: 'Sofia Chen', trigger: 'upstream payment-svc degradation',
    summary: 'Error rate 4.1% — threshold 2%. Downstream impact from payment service.',
  },
];

const timelineColors = { green: '#10b981', amber: '#f59e0b', red: '#ef4444', blue: '#3b82f6' };

export default function ActiveIncidents({
  setActive,
  setSelectedIncident
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        <MetricCard label="Open Incidents"    value="2"      delta="1 P1 critical"       deltaDir="bad" />
        <MetricCard label="p99 Latency"       value="1160ms" delta="from 340ms baseline"  deltaDir="bad" />
        <MetricCard label="DB Timeouts/min"   value="130"    delta="from 2/min"           deltaDir="bad" />
        <MetricCard label="Circuit Breaker"   value="OPEN"   sub="payment-gateway" />
      </div>

      {INCIDENTS.map(inc => (
        <Card key={inc.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{inc.id}</span>
              <Badge variant={inc.sev === 'P1' ? 'red' : 'amber'}>{inc.sev}</Badge>
              <Badge variant={inc.status === 'open' ? 'red' : 'amber'}>{inc.status}</Badge>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{inc.title}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Duration: {inc.duration}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Started', value: inc.started },
              { label: 'Affected', value: inc.affected },
              { label: 'Owner', value: inc.owner },
              { label: 'Trigger', value: inc.trigger },
            ].map(f => (
              <div key={f.label} style={{ background: 'var(--content-bg)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--content-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{f.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--content-bg)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--content-border)' }}>
            {inc.summary}
          </div>
          <div
  style={{
    marginTop: 12,
    display: 'flex',
    gap: 8
  }}
>
  <button
    onClick={() => {
  setSelectedIncident(inc);
  setActive('incident');
}}
    style={{
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: 6,
      padding: '8px 12px',
      cursor: 'pointer'
    }}
  >
    🚨 Launch AI Investigation
  </button>
</div>
        </Card>
      ))}

      <Card>
        <SectionLabel>P1 event timeline</SectionLabel>
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
  );
}
