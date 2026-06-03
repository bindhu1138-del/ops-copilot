import React, { useState } from 'react';
import { Card, SectionLabel, Button, LogLine, Badge } from '../../components/UI.jsx';
import { MOCK_LOGS } from '../../lib/mockData.js';

const SERVICES = ['all', 'payment-svc', 'auth-svc', 'checkout-api', 'notification-svc'];
const LEVELS   = ['all', 'ERROR', 'WARN', 'INFO'];

export default function LogFilters() {
  const [service, setService] = useState('all');
  const [level,   setLevel]   = useState('all');
  const [keyword, setKeyword] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime,   setEndTime]   = useState('');

  const filtered = MOCK_LOGS.filter(log => {
    if (service !== 'all' && log.service !== service) return false;
    if (level   !== 'all' && log.level   !== level)   return false;
    if (keyword && !log.message.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (startTime && new Date(log.ts) < new Date(startTime)) return false;
    if (endTime   && new Date(log.ts) > new Date(endTime))   return false;
    return true;
  });

  const selectStyle = { padding: '7px 10px', borderRadius: 8, border: '1px solid var(--content-border)', background: 'var(--content-bg)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none' };
  const inputStyle  = { ...selectStyle, width: '100%' };

  function reset() { setService('all'); setLevel('all'); setKeyword(''); setStartTime(''); setEndTime(''); }

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <SectionLabel>Filter logs</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Service</div>
            <select value={service} onChange={e => setService(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Level</div>
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Keyword</div>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. timeout" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>From (UTC)</div>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>To (UTC)</div>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge variant="gray">{filtered.length} results</Badge>
          <Badge variant="red">{filtered.filter(l => l.level === 'ERROR').length} errors</Badge>
          <Badge variant="amber">{filtered.filter(l => l.level === 'WARN').length} warnings</Badge>
          <button onClick={reset} style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--content-border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Reset</button>
        </div>
      </Card>

      <Card style={{ padding: '14px 16px' }}>
        <SectionLabel>Filtered results — {filtered.length} entries</SectionLabel>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No logs match the current filters.</div>
          : <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              {filtered.map((log, i) => <LogLine key={i} log={{ ...log, id: i, ts: log.ts || log.timestamp }} />)}
            </div>
        }
      </Card>
    </div>
  );
}