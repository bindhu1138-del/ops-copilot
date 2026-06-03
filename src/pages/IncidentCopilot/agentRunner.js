/**
 * agentRunner.js
 *
 * The single execution engine for all agents.
 * Wraps callClaudeStream and bridges it to the IncidentContext dispatch system.
 *
 * Usage:
 *   const { onStart, onChunk, onDone, onError } = useAgent('rca');
 *   await runAgent({ system, userMessage, onStart, onChunk, onDone, onError, maxTokens });
 *
 * This keeps agent components free of try/catch boilerplate and ensures
 * every agent follows the same lifecycle: START → CHUNK* → DONE | ERROR.
 */

import { callClaudeStream } from '../../lib/claude.js';

/**
 * runAgent(opts)
 *
 * @param {string}   opts.system       - Agent system prompt
 * @param {string}   opts.userMessage  - The user-facing prompt (may include upstream context)
 * @param {Function} opts.onStart      - Called before the API request (sets status: running)
 * @param {Function} opts.onChunk      - Called with (chunk, fullText) during streaming
 * @param {Function} opts.onDone       - Called with (fullText) when complete
 * @param {Function} opts.onError      - Called with (errorMessage) on failure
 * @param {number}   [opts.maxTokens]  - Max output tokens (default 4096)
 * @returns {Promise<string>}          - Full response text (empty string on error)
 */
export async function runAgent({
  system,
  userMessage,
  onStart,
  onChunk,
  onDone,
  onError,
  maxTokens = 4096,
}) {
  onStart?.();
  try {
    const result = await callClaudeStream({
      system,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens,
      onChunk: (_, fullText) => onChunk?.(fullText),
      onDone:  (fullText)    => onDone?.(fullText),
    });
    return result || '';
  } catch (err) {
    const msg = err?.message || String(err);
    onError?.(msg);
    return '';
  }
}

/**
 * buildContext(upstreamContext, fields)
 *
 * Helper to append relevant upstream agent results to a user message.
 * Only includes non-empty results to avoid padding the prompt.
 *
 * @param {object} upstreamContext - From useAgent().upstreamContext
 * @param {string[]} fields        - Which keys to include
 * @returns {string}               - Formatted context block or ''
 */
export function buildContext(upstreamContext, fields = []) {
  const lines = [];
  const labels = {
    evidenceResult:    'Evidence Correlation',
    logAnalysisResult: 'Log Analysis',
    rcaResult:         'Root Cause Analysis',
    runbookResult:     'Runbook',
    recoveryResult:    'Recovery Actions',
    validationResult:  'Validation',
  };

  for (const field of fields) {
    const val = upstreamContext?.[field];
    if (val && val.trim()) {
      lines.push(`\n--- ${labels[field] || field} ---\n${val.trim()}`);
    }
  }

  return lines.length
    ? `\n\nPrevious agent outputs for context:${lines.join('\n')}`
    : '';
}