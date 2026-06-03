// UI.jsx
import React from 'react';

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'gray', size = 'sm' }) {
  const styles = {
    gray:    { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
    blue:    { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
    red:     { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    amber:   { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
    green:   { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    purple:  { background: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff' },
    dark:    { background: '#1e2d4a', color: '#93c5fd', border: '1px solid #2d3f5f' },
  };
  return (
    <span style={{
      ...styles[variant],
      fontSize: size === 'sm' ? '11px' : '12px',
      fontWeight: 500,
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      borderRadius: '6px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: 'var(--font-body)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
export function StatusDot({ status }) {
  const colors = { healthy: '#10b981', degraded: '#ef4444', warning: '#f59e0b', incident: '#ef4444', unknown: '#94a3b8' };
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: colors[status] || '#94a3b8',
      display: 'inline-block', flexShrink: 0,
      boxShadow: status === 'degraded' || status === 'incident' ? `0 0 0 3px ${colors[status]}30` : 'none',
    }} />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, className = '' }) {
  return (
    <div className={className} style={{
      background: 'var(--content-surface)',
      border: '1px solid var(--content-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: '10px',
      fontFamily: 'var(--font-display)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 16, color = 'var(--accent-blue)' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: `2px solid ${color}30`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = 'default', disabled = false, style = {}, icon }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    padding: '8px 16px', borderRadius: 'var(--radius-md)',
    fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-body)',
    transition: 'all 0.15s', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: '1px solid transparent',
    lineHeight: 1,
  };
  const variants = {
    default: { background: '#f1f5f9', color: 'var(--text-primary)', border: '1px solid var(--content-border)' },
    primary: { background: 'var(--accent-blue)', color: '#fff', border: '1px solid var(--accent-blue-dark)' },
    ghost:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--content-border)' },
    danger:  { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    dark:    { background: '#111827', color: '#e2e8f0', border: '1px solid #1e2d4a' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ value, onChange, onKeyDown, placeholder, style = {}, autoFocus }) {
  return (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        width: '100%', padding: '9px 14px',
        border: '1px solid var(--content-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px', fontFamily: 'var(--font-body)',
        background: 'var(--content-bg)',
        color: 'var(--text-primary)',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent-blue)'; e.target.style.boxShadow = 'var(--shadow-glow)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--content-border)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ value, onChange, placeholder, rows = 5, style = {} }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '10px 14px',
        border: '1px solid var(--content-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '12px', fontFamily: 'var(--font-mono)',
        background: 'var(--content-bg)',
        color: 'var(--text-primary)',
        outline: 'none', resize: 'vertical',
        lineHeight: 1.7,
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent-blue)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--content-border)'; }}
    />
  );
}

// ─── AIResponseBox ────────────────────────────────────────────────────────────
export function AIResponseBox({ text, loading, empty, style = {} }) {
  return (
    <div style={{
      background: 'var(--content-bg)',
      border: '1px solid var(--content-border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontSize: '13px',
      lineHeight: 1.8,
      color: loading || (!text && empty) ? 'var(--text-muted)' : 'var(--text-primary)',
      minHeight: '80px',
      fontFamily: 'var(--font-body)',
      whiteSpace: 'pre-wrap',
      ...style,
    }}>
      {loading
        ? <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Spinner />{loading}</span>
        : text || empty || ''}
    </div>
  );
}

// ─── LogLine ──────────────────────────────────────────────────────────────────
export function LogLine({ log }) {
  const colors = {
    ERROR: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    WARN:  { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
    INFO:  { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
  };
  const c = colors[log.level] || colors.INFO;
  const time = new Date(log.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '8px',
      background: c.bg, borderRadius: '6px', padding: '6px 10px',
      marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11.5px',
      lineHeight: 1.5, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, marginTop: 5, flexShrink: 0 }} />
      <span style={{ color: '#94a3b8', flexShrink: 0, minWidth: 72 }}>{time}</span>
      <span style={{ flexShrink: 0, minWidth: 38, fontWeight: 600, fontSize: 10 }}>{log.level}</span>
      <span style={{ flexShrink: 0, minWidth: 110, color: '#64748b' }}>{log.service}</span>
      <span>{log.message}</span>
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
export function MetricCard({ label, value, delta, deltaDir, sub }) {
  return (
    <div style={{
      background: 'var(--content-bg)',
      border: '1px solid var(--content-border)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {delta && (
        <div style={{ fontSize: '11px', marginTop: 5, color: deltaDir === 'bad' ? 'var(--red)' : deltaDir === 'good' ? 'var(--green)' : 'var(--text-muted)' }}>
          {deltaDir === 'bad' ? '↑' : deltaDir === 'good' ? '↓' : ''} {delta}
        </div>
      )}
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>{title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}
