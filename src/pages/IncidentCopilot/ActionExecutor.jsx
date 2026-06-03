/**
 * ActionExecutor.jsx
 *
 * Reads commanderResult from upstream context.
 * Parses PRIORITY / REQUIRES_TICKET / NOTIFY_ONCALL from it,
 * then executes (mock) actions against the FastAPI /execute-action endpoint.
 * Writes executorResult to IncidentContext so Postmortem can reference it.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, SectionLabel, Button, Spinner, Badge,
} from '../../components/UI.jsx';
import { useAgent } from './IncidentContext.jsx';

// ── Types & constants ─────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** All possible actions the executor can perform */
const ACTION_DEFINITIONS = [
  {
    id:      'create_ticket',
    label:   'Create GitLab Incident Ticket',
    icon:    '🎫',
    trigger: (cmd) => cmd.requiresTicket === 'Yes',
    alwaysShow: true,
  },
  {
    id:      'notify_oncall',
    label:   'Notify On-call Engineer',
    icon:    '📟',
    trigger: (cmd) => cmd.notifyOncall === 'Yes',
    alwaysShow: true,
  },
  {
    id:      'prepare_rollback',
    label:   'Generate Rollback Request',
    icon:    '↩️',
    trigger: (cmd) => cmd.priority === 'P1' || cmd.priority === 'P2',
    alwaysShow: true,
  },
  {
    id:      'attach_runbook',
    label:   'Attach Runbook to Ticket',
    icon:    '📖',
    trigger: () => true,
    alwaysShow: true,
  },
  {
    id:      'attach_recovery',
    label:   'Attach Recovery Plan to Ticket',
    icon:    '🚨',
    trigger: () => true,
    alwaysShow: true,
  },
  {
    id:      'generate_change_request',
    label:   'Generate Change Request',
    icon:    '📋',
    trigger: (cmd) => cmd.escalation === 'Critical' || cmd.escalation === 'High',
    alwaysShow: false,
  },
  {
    id:      'page_management',
    label:   'Page Engineering Management',
    icon:    '📣',
    trigger: (cmd) => cmd.priority === 'P1',
    alwaysShow: false,
  },
];

/** Status colours */
const STATUS_COLOR = {
  idle:    { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', dot: '#94a3b8' },
  running: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', dot: '#f59e0b' },
  done:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', dot: '#10b981' },
  error:   { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' },
  skipped: { bg: '#f8fafc', border: '#e2e8f0', text: '#94a3b8', dot: '#cbd5e1' },
};

// ── Helper: parse commander output ────────────────────────────────────────────
function parseCommander(text) {
  if (!text) return {};
  const get = (key) => {
    const m = text.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };
  return {
    priority:        get('PRIORITY'),
    ownerTeam:       get('OWNER_TEAM'),
    escalation:      get('ESCALATION_LEVEL'),
    requiresTicket:  get('REQUIRES_TICKET'),
    notifyOncall:    get('NOTIFY_ONCALL'),
    confidence:      get('CONFIDENCE'),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionRow({ action, status, result }) {
  const s = STATUS_COLOR[status] || STATUS_COLOR.idle;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: '10px 14px', marginBottom: 8,
      transition: 'all 0.2s',
    }}>
      {/* Status dot */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: s.dot, flexShrink: 0,
        boxShadow: status === 'running' ? `0 0 0 3px ${s.border}` : 'none',
      }} />

      {/* Icon + label */}
      <span style={{ fontSize: 16 }}>{action.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: s.text, flex: 1 }}>
        {action.label}
      </span>

      {/* Right side */}
      {status === 'running' && <Spinner size={13} />}
      {status === 'done' && result && (
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#16a34a', fontWeight: 600 }}>
          {result.ticket_id || result.ref || '✓ Done'}
        </span>
      )}
      {status === 'error' && (
        <span style={{ fontSize: 11, color: '#dc2626' }}>Failed</span>
      )}
      {status === 'skipped' && (
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Skipped</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ActionExecutor() {
  const agent = useAgent('executor');
  const { commanderResult, runbookResult, recoveryResult } = agent.upstreamContext;

  // Parsed fields from commander
  const [cmd,          setCmd]          = useState({});
  // Per-action state: { [actionId]: { status, result } }
  const [actionStates, setActionStates] = useState({});
  // Which actions are selected (checkboxes)
  const [selected,     setSelected]     = useState({});
  // Overall execution state
  const [executing,    setExecuting]    = useState(false);
  const [executed,     setExecuted]     = useState(false);
  const [summary,      setSummary]      = useState('');

  // Parse commander result whenever it arrives
  useEffect(() => {
    if (!commanderResult?.trim()) return;
    const parsed = parseCommander(commanderResult);
    setCmd(parsed);

    // Pre-select actions whose trigger matches
    const preSelected = {};
    ACTION_DEFINITIONS.forEach(a => {
      preSelected[a.id] = a.trigger(parsed);
    });
    setSelected(preSelected);
  }, [commanderResult]);

  // ── Toggle selection ───────────────────────────────────────────────────────
  function toggle(id) {
    if (executing) return;
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // ── Execute one action ─────────────────────────────────────────────────────
  const executeOne = useCallback(async (actionId) => {
    setActionStates(prev => ({ ...prev, [actionId]: { status: 'running', result: null } }));
    try {
      const res  = await fetch(`${API_BASE}/execute-action`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action:          actionId,
          priority:        cmd.priority,
          owner_team:      cmd.ownerTeam,
          escalation:      cmd.escalation,
          runbook_snippet: runbookResult?.slice(0, 300) || '',
          recovery_snippet:recoveryResult?.slice(0, 300) || '',
        }),
      });
      const data = await res.json();
      setActionStates(prev => ({ ...prev, [actionId]: { status: 'done', result: data } }));
      return data;
    } catch (err) {
      setActionStates(prev => ({ ...prev, [actionId]: { status: 'error', result: null } }));
      return null;
    }
  }, [cmd, runbookResult, recoveryResult]);

  // ── Execute all selected actions in sequence ───────────────────────────────
  async function executeAll() {
    if (executing) return;
    setExecuting(true);
    setExecuted(false);
    agent.onStart();

    const results = [];
    for (const action of ACTION_DEFINITIONS) {
      if (!selected[action.id]) {
        setActionStates(prev => ({ ...prev, [action.id]: { status: 'skipped', result: null } }));
        continue;
      }
      const data = await executeOne(action.id);
      results.push({ action: action.label, ...data });
      // small delay so UI animates visibly
      await new Promise(r => setTimeout(r, 350));
    }

    // Build plain-text summary for context + postmortem
    const lines = results.map(r =>
      `• ${r.action}: ${r.ticket_id || r.ref || r.status || 'completed'}`
    );
    const summaryText = `EXECUTION_SUMMARY\n\nPriority: ${cmd.priority}\nOwner Team: ${cmd.ownerTeam}\n\nActions Completed:\n${lines.join('\n')}`;
    setSummary(summaryText);
    agent.onDone(summaryText);

    setExecuting(false);
    setExecuted(true);
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    setActionStates({});
    setExecuted(false);
    setSummary('');
  }

  // ── Visible actions (always show + triggered) ──────────────────────────────
  const visibleActions = ACTION_DEFINITIONS.filter(
    a => a.alwaysShow || a.trigger(cmd)
  );

  const noCommander = !commanderResult?.trim();

  return (
    <div className="fade-in">

      {/* Context banner */}
      {noCommander ? (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
          fontSize: 13, color: '#92400e',
        }}>
          ⚠ Run <strong>Incident Commander</strong> first — this tab reads its output to determine which actions to execute.
        </div>
      ) : (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Command Context
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[
              ['Priority',    cmd.priority,    cmd.priority === 'P1' ? '#dc2626' : cmd.priority === 'P2' ? '#d97706' : '#16a34a'],
              ['Owner Team',  cmd.ownerTeam,   '#1d4ed8'],
              ['Escalation',  cmd.escalation,  '#92400e'],
              ['Confidence',  cmd.confidence,  '#475569'],
            ].map(([label, value, color]) => value ? (
              <div key={label} style={{ fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>{label}: </span>
                <span style={{ fontWeight: 700, color }}>{value}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Action selection card */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Select Actions to Execute</SectionLabel>
          {!noCommander && (
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>
              ✓ Pre-selected from Commander output
            </span>
          )}
        </div>

        {visibleActions.map(action => {
          const state  = actionStates[action.id];
          const status = state?.status || (executed ? 'skipped' : 'idle');
          const isSelected = !!selected[action.id];

          return (
            <div
              key={action.id}
              onClick={() => toggle(action.id)}
              style={{ cursor: executing ? 'default' : 'pointer' }}
            >
              {executed ? (
                <ActionRow action={action} status={status} result={state?.result} />
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: isSelected ? '#f0fdf4' : 'var(--content-bg)',
                  border: `1px solid ${isSelected ? '#bbf7d0' : 'var(--content-border)'}`,
                  borderRadius: 8, padding: '10px 14px', marginBottom: 8,
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(action.id)}
                    disabled={executing}
                    style={{ accentColor: '#16a34a', width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 16 }}>{action.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#166534' : 'var(--text-primary)', flex: 1 }}>
                    {action.label}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>SELECTED</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          {!executed ? (
            <Button
              variant="primary"
              onClick={executeAll}
              disabled={executing || noCommander || !Object.values(selected).some(Boolean)}
              icon={executing ? <Spinner size={14} color="#fff" /> : null}
            >
              {executing ? 'Executing…' : '⚡ Execute All Selected Actions'}
            </Button>
          ) : (
            <>
              <Button variant="primary" onClick={reset}>
                🔄 Reset & Re-run
              </Button>
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>
                ✓ All actions completed — Postmortem tab pre-filled
              </span>
            </>
          )}
        </div>
      </Card>

      {/* Live execution progress (shown during + after run) */}
      {(executing || executed) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Execution Progress</SectionLabel>
            {executing && <Spinner size={13} />}
            {executed  && <Badge variant="green">Complete</Badge>}
          </div>

          {visibleActions.map(action => {
            const state  = actionStates[action.id];
            const status = state?.status || 'idle';
            return (
              <ActionRow
                key={action.id}
                action={action}
                status={status}
                result={state?.result}
              />
            );
          })}

          {executed && summary && (
            <div style={{
              marginTop: 12, background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', marginBottom: 6 }}>
                EXECUTION SUMMARY
              </div>
              <pre style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {summary}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}