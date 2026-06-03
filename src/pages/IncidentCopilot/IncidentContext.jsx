// /**
//  * IncidentContext.jsx -> working
//  *
//  * The shared brain for the entire Incident Copilot multi-agent system.
//  *
//  * ─── Why React Context (not Zustand / Redux) ─────────────────────────────────
//  * The incident state is scoped entirely to the IncidentModule mount lifecycle.
//  * It doesn't need to survive route changes or be shared with non-incident pages.
//  * Context + useReducer gives us a Flux-style single-source of truth with zero
//  * external dependencies.
//  *
//  * ─── State shape ─────────────────────────────────────────────────────────────
//  *
//  * agents: Record<AgentId, AgentState>
//  *   Each agent has:
//  *     status:   'idle' | 'running' | 'done' | 'error'
//  *     result:   string   — raw AI output (preserved for downstream agents)
//  *     error:    string   — error message if status === 'error'
//  *     startedAt: number  — timestamp ms
//  *     finishedAt: number — timestamp ms
//  *
//  * pipeline: AgentId[]   — ordered list of agents; drives auto-advance logic
//  * activeTab: AgentId    — which tab is currently visible
//  * incidentId: string    — unique id for this incident session
//  *
//  * ─── Coordinator logic ───────────────────────────────────────────────────────
//  * The CoordinatorAgent is NOT a separate tab. It's implemented as a side-effect
//  * inside the context: whenever an agent completes (status → 'done'), the
//  * coordinator reads its output, extracts relevant fields, and injects them into
//  * the downstream agents' inputs via the shared state. Components subscribe via
//  * useIncident() and read from agents[id].result.
//  *
//  * ─── Agent IDs ───────────────────────────────────────────────────────────────
//  * 'evidence'   → EvidenceAgent
//  * 'loganalysis'→ LogAnalysisAgent
//  * 'rca'        → RCAAgent
//  * 'runbook'    → RunbookAgent
//  * 'recovery'   → RecoveryAgent
//  * 'validation' → ValidationAgent
//  * 'postmortem' → PostmortemAgent
//  */

// import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// // ── Agent IDs (ordered pipeline) ─────────────────────────────────────────────
// export const PIPELINE = [
//   'evidence',
//   'loganalysis',
//   'rca',
//   'runbook',
//   'recovery',
//   'validation',
//   'postmortem',
// ];

// // ── Default agent state ───────────────────────────────────────────────────────
// function defaultAgent() {
//   return { status: 'idle', result: '', error: '', startedAt: null, finishedAt: null };
// }

// function initialState() {
//   const agents = {};
//   PIPELINE.forEach(id => { agents[id] = defaultAgent(); });
//   return {
//     agents,
//     activeTab: 'evidence',
//     incidentId: `INC-${Date.now()}`,
//     selectedIncident: null,
//   };
// }

// // ── Reducer ───────────────────────────────────────────────────────────────────
// function reducer(state, action) {
//   switch (action.type) {

//     case 'AGENT_START':
//       return {
//         ...state,
//         agents: {
//           ...state.agents,
//           [action.agentId]: {
//             ...state.agents[action.agentId],
//             status: 'running',
//             result: '',
//             error: '',
//             startedAt: Date.now(),
//             finishedAt: null,
//           },
//         },
//       };

//     case 'AGENT_CHUNK':
//       // Streaming update — only update result, keep status 'running'
//       return {
//         ...state,
//         agents: {
//           ...state.agents,
//           [action.agentId]: {
//             ...state.agents[action.agentId],
//             result: action.result,
//           },
//         },
//       };

//     case 'AGENT_DONE':
//       return {
//         ...state,
//         agents: {
//           ...state.agents,
//           [action.agentId]: {
//             ...state.agents[action.agentId],
//             status: 'done',
//             result: action.result,
//             finishedAt: Date.now(),
//           },
//         },
//       };

//     case 'AGENT_ERROR':
//       return {
//         ...state,
//         agents: {
//           ...state.agents,
//           [action.agentId]: {
//             ...state.agents[action.agentId],
//             status: 'error',
//             error: action.error,
//             finishedAt: Date.now(),
//           },
//         },
//       };

//     case 'SET_SELECTED_INCIDENT':
//   return {
//     ...state,
//     selectedIncident: action.incident,
//     activeTab: 'evidence',
//   };

//     case 'SET_ACTIVE_TAB':
//       return { ...state, activeTab: action.tab };

//     case 'RESET_INCIDENT':
//       return initialState();

//     default:
//       return state;
//   }
// }

// // ── Context ───────────────────────────────────────────────────────────────────
// const IncidentContext = createContext(null);

// export function IncidentProvider({ children }) {
//   const [state, dispatch] = useReducer(reducer, undefined, initialState);

//   // ── Stable action creators ────────────────────────────────────────────────
//   const agentStart = useCallback((agentId) =>
//     dispatch({ type: 'AGENT_START', agentId }), []);

//   const agentChunk = useCallback((agentId, result) =>
//     dispatch({ type: 'AGENT_CHUNK', agentId, result }), []);

//   const agentDone = useCallback((agentId, result) =>
//     dispatch({ type: 'AGENT_DONE', agentId, result }), []);

//   const agentError = useCallback((agentId, error) =>
//     dispatch({ type: 'AGENT_ERROR', agentId, error }), []);

//   const setActiveTab = useCallback((tab) =>
//     dispatch({ type: 'SET_ACTIVE_TAB', tab }), []);

//   const setSelectedIncident = useCallback(
//   (incident) =>
//     dispatch({
//       type: 'SET_SELECTED_INCIDENT',
//       incident,
//     }),
//   []
// );

//   const resetIncident = useCallback(() =>
//     dispatch({ type: 'RESET_INCIDENT' }), []);

//   // ── Coordinator: read upstream context for a given agent ─────────────────
//   /**
//    * getAgentContext(agentId)
//    * Returns the most relevant upstream data for an agent to use as context.
//    * This is the "coordinator" logic — it cross-references completed agents
//    * and assembles a focused briefing for the next agent in the pipeline.
//    */
//   const getAgentContext = useCallback((agentId) => {
//     const a = state.agents;
//     switch (agentId) {
//       case 'loganalysis':
//         return { evidenceResult: a.evidence.result };

//       case 'rca':
//         return {
//           evidenceResult:    a.evidence.result,
//           logAnalysisResult: a.loganalysis.result,
//         };

//       case 'runbook':
//         return {
//           rcaResult:         a.rca.result,
//           evidenceResult:    a.evidence.result,
//         };

//       case 'recovery':
//         return {
//           runbookResult:     a.runbook.result,
//           rcaResult:         a.rca.result,
//         };

//       case 'validation':
//         return {
//           recoveryResult:    a.recovery.result,
//           rcaResult:         a.rca.result,
//         };

//       case 'postmortem':
//         return {
//           evidenceResult:    a.evidence.result,
//           logAnalysisResult: a.loganalysis.result,
//           rcaResult:         a.rca.result,
//           runbookResult:     a.runbook.result,
//           recoveryResult:    a.recovery.result,
//           validationResult:  a.validation.result,
//         };

//       default:
//         return {};
//     }
//   }, [state.agents]);

//   // ── Derived: which agents have completed ─────────────────────────────────
//   const completedAgents = useMemo(() =>
//     PIPELINE.filter(id => state.agents[id].status === 'done'),
//   [state.agents]);

//   const value = useMemo(() => ({
//     // State
//     agents:          state.agents,
//     activeTab:       state.activeTab,
//     incidentId:      state.incidentId,
//     selectedIncident: state.selectedIncident,
//     completedAgents,
//     // Actions
//     agentStart,
//     agentChunk,
//     agentDone,
//     agentError,
//     setActiveTab,
//     setSelectedIncident,
//     resetIncident,
//     getAgentContext,
//   }), [
//     state.agents, state.activeTab, state.incidentId,
//     completedAgents,
//     agentStart, agentChunk, agentDone, agentError,
//     setActiveTab,setSelectedIncident, resetIncident, getAgentContext,
//   ]);

//   return (
//     <IncidentContext.Provider value={value}>
//       {children}
//     </IncidentContext.Provider>
//   );
// }

// // ── Hook ──────────────────────────────────────────────────────────────────────
// export function useIncident() {
//   const ctx = useContext(IncidentContext);
//   if (!ctx) throw new Error('useIncident must be used inside <IncidentProvider>');
//   return ctx;
// }

// // ── Agent-scoped hook ─────────────────────────────────────────────────────────
// /**
//  * useAgent(agentId)
//  * Convenience hook for a single agent. Returns its state + a bound run()
//  * function that handles start/chunk/done/error dispatching automatically.
//  */
// export function useAgent(agentId) {
//   const { agents, agentStart, agentChunk, agentDone, agentError, getAgentContext } = useIncident();
//   const agentState = agents[agentId];
//   const upstreamContext = getAgentContext(agentId);

//   return {
//     ...agentState,
//     upstreamContext,
//     isRunning: agentState.status === 'running',
//     isDone:    agentState.status === 'done',
//     hasResult: agentState.status === 'done' && !!agentState.result,
//     onStart:   () => agentStart(agentId),
//     onChunk:   (result) => agentChunk(agentId, result),
//     onDone:    (result) => agentDone(agentId, result),
//     onError:   (error)  => agentError(agentId, typeof error === 'string' ? error : error.message),
//   };
// }






















/**
 * IncidentContext.jsx — PATCH INSTRUCTIONS
 * =========================================
 * You only need to add "commander" in two places.
 *
 * ── PLACE 1: Initial agent state object ──────────────────────────────────────
 * Find where your agents are initialised (likely inside useState or a const).
 * It will look something like:
 *
 *   const [agents, setAgents] = useState({
 *     evidence:    { status: 'idle', result: '' },
 *     loganalysis: { status: 'idle', result: '' },
 *     rca:         { status: 'idle', result: '' },
 *     runbook:     { status: 'idle', result: '' },
 *     recovery:    { status: 'idle', result: '' },
 *     postmortem:  { status: 'idle', result: '' },
 *   });
 *
 * ADD this line inside that object (after recovery, before postmortem):
 *
 *     commander:   { status: 'idle', result: '' },
 *
 *
 * ── PLACE 2: upstreamContext mapping (inside useAgent) ───────────────────────
 * Find where useAgent() builds upstreamContext — the object that child
 * components read to get rcaResult, recoveryResult, etc.
 * It typically looks like:
 *
 *   const upstreamContext = {
 *     evidenceResult:    agents.evidence.result,
 *     logAnalysisResult: agents.loganalysis.result,
 *     rcaResult:         agents.rca.result,
 *     runbookResult:     agents.runbook.result,
 *     recoveryResult:    agents.recovery.result,
 *   };
 *
 * ADD this line (after recoveryResult):
 *
 *     commanderResult: agents.commander.result,
 *
 *
 * That's it — no other changes needed in IncidentContext.jsx.
 *
 *
 * ── REFERENCE: minimal standalone context (if you need to rebuild) ────────────
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const IncidentCtx = createContext(null);

const AGENT_KEYS = [
  'evidence',
  'loganalysis',
  'rca',
  'runbook',
  'recovery',
  'commander',
  'executor',
  'postmortem',
];

const initialAgents = () =>
  Object.fromEntries(AGENT_KEYS.map(k => [k, { status: 'idle', result: '' }]));

export function IncidentProvider({ children }) {
  const [agents, setAgents] = useState(initialAgents);

  const updateAgent = useCallback((key, patch) => {
    setAgents(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  // Build the shared upstream context read by every agent component
  const upstreamContext = {
  evidenceResult: agents.evidence.result,
  logAnalysisResult: agents.loganalysis.result,
  rcaResult: agents.rca.result,
  runbookResult: agents.runbook.result,
  recoveryResult: agents.recovery.result,
  commanderResult: agents.commander.result,
  executorResult: agents.executor.result,
  postmortemResult: agents.postmortem.result,
};

  return (
    <IncidentCtx.Provider value={{ agents, updateAgent, upstreamContext }}>
      {children}
    </IncidentCtx.Provider>
  );
}

export function useIncident() {
  return useContext(IncidentCtx);
}

/**
 * useAgent(key)
 * Returns { isRunning, result, upstreamContext, onStart, onChunk, onDone, onError }
 */
export function useAgent(key) {
  const { agents, updateAgent, upstreamContext } = useIncident();
  const agent = agents[key];

  const onStart = useCallback(() =>
    updateAgent(key, { status: 'running', result: '' }), [key, updateAgent]);

  const onChunk = useCallback((chunk) =>
    updateAgent(key, { result: (agents[key]?.result ?? '') + chunk }), [key, agents, updateAgent]);

  const onDone = useCallback((result) =>
    updateAgent(key, { status: 'done', result }), [key, updateAgent]);

  const onError = useCallback((err) => {
    console.error(`[${key}] agent error`, err);
    updateAgent(key, { status: 'idle' });
  }, [key, updateAgent]);

  return {
    isRunning:       agent.status === 'running',
    result:          agent.result,
    upstreamContext,
    onStart,
    onChunk,
    onDone,
    onError,
  };
}