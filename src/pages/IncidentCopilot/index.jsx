// // index.jsx
// import React from 'react';
// import SubTabLayout         from '../../components/SubTabLayout.jsx';
// import RCA                  from './RCA.jsx';
// import EvidenceCorrelation  from './EvidenceCorrelation.jsx';
// import RunbookGeneration    from './RunbookGeneration.jsx';
// import RecoveryActions      from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// const TABS = [
//   { id: 'evidence',   label: 'Evidence Correlation',  icon: '🛡', component: <EvidenceCorrelation /> },
//   { id: 'rca',        label: 'RCA',                  icon: '⚠', component: <RCA /> },
//   { id: 'runbook',    label: 'Runbook Generation',    icon: '📖', component: <RunbookGeneration /> },
//   { id: 'recovery',   label: 'Recovery Actions',      icon: '🚨', component: <RecoveryActions /> },
//   { id: 'postmortem', label: 'Postmortem',            icon: '📝', component: <PostmortemGeneration /> },
// ];

// export default function IncidentModule() {
//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Copilot"
//         subtitle="Understand, diagnose, recover from, and document production incidents."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />
//       <SubTabLayout tabs={TABS} defaultTab="evidence" />
//     </div>
//   );
// }















// /**
//  * Incident Copilot — index.jsx
//  *
//  * This is the state orchestrator for the full incident workflow:
//  *   Evidence Correlation → RCA → Runbook → Recovery Actions → Postmortem
//  *
//  * ─── Shared state ────────────────────────────────────────────────────────────
//  *
//  *   evidenceResult  (string)
//  *     Raw text output from EvidenceCorrelation.
//  *     Passed to RCA as `autoFillInput` — used to prime the RCA question input.
//  *
//  *   rcaResult  (string)
//  *     Raw text output from RCA.
//  *     Parsed here to extract service / incident type / severity strings, which
//  *     are passed to RunbookGeneration as `autoFillService`, `autoFillType`,
//  *     `autoFillSeverity` props.
//  *
//  *   runbookResult  (string)
//  *     Raw text output from RunbookGeneration.
//  *     Passed to RecoveryActions as `autoFillQuery` — used to prime its
//  *     incident description textarea.
//  *
//  *   recoveryResult  (string)
//  *     Raw text output from RecoveryActions.
//  *     Combined with the three above and passed to PostmortemGeneration as the
//  *     `autoFillData` object.
//  *
//  * ─── Tab dot indicators ──────────────────────────────────────────────────────
//  *   Each tab shows a green dot once its upstream result is ready, so the user
//  *   knows it has been pre-populated.
//  *
//  * ─── SubTabLayout render-function pattern ────────────────────────────────────
//  *   Instead of passing static JSX as `component`, each tab uses a render
//  *   function: `component: (props) => <Component {...relevantProps} />`
//  *   SubTabLayout calls it with the `sharedProps` object (unused here — we
//  *   close over the state variables directly to avoid coupling the layout
//  *   component to domain types).
//  */

// import React, { useState, useCallback } from 'react';
// import SubTabLayout         from '../../components/SubTabLayout.jsx';
// import EvidenceCorrelation  from './EvidenceCorrelation.jsx';
// import RCA                  from './RCA.jsx';
// import RunbookGeneration    from './RunbookGeneration.jsx';
// import RecoveryActions      from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// // ── Helpers: parse RCA output for Runbook dropdowns ───────────────────────────

// /**
//  * extractRcaFields(rcaText)
//  * Returns { service, incidentType, severity } as free-form strings.
//  * RunbookGeneration does its own fuzzy-match to map these to dropdown options.
//  */
// function extractRcaFields(rcaText) {
//   if (!rcaText) return {};

//   // Service: look for known service names anywhere in the text
//   const KNOWN = ['payment-svc', 'auth-svc', 'checkout-api', 'notification-svc', 'inventory-svc', 'order-svc'];
//   const lower = rcaText.toLowerCase();
//   const service = KNOWN.find(s => lower.includes(s)) ?? '';

//   // Severity: look for Px pattern in RISK ASSESSMENT section
//   const sevMatch = rcaText.match(/Severity:\s*(P\d)/i);
//   const severity = sevMatch ? sevMatch[1] : '';

//   // Incident type: look for keywords
//   let incidentType = '';
//   if (lower.includes('pool') || lower.includes('connection')) incidentType = 'pool';
//   else if (lower.includes('latency') || lower.includes('sla'))  incidentType = 'latency';
//   else if (lower.includes('circuit'))                           incidentType = 'circuit';
//   else if (lower.includes('oom') || lower.includes('memory'))   incidentType = 'oom';
//   else if (lower.includes('rollback'))                          incidentType = 'rollback';
//   else if (lower.includes('5xx') || lower.includes('500'))      incidentType = '5xx';
//   else if (lower.includes('503') || lower.includes('unreachable')) incidentType = '503';
//   else if (lower.includes('auth') || lower.includes('token'))   incidentType = 'auth';

//   return { service, incidentType, severity };
// }

// // ─────────────────────────────────────────────────────────────────────────────

// export default function IncidentModule() {
//   // ── Shared state ────────────────────────────────────────────────────────────
//   const [evidenceResult,  setEvidenceResult]  = useState('');
//   const [rcaResult,       setRcaResult]       = useState('');
//   const [runbookResult,   setRunbookResult]   = useState('');
//   const [recoveryResult,  setRecoveryResult]  = useState('');

//   // Memoised setters — stable references avoid unnecessary child re-renders
//   const handleEvidenceDone  = useCallback((text) => setEvidenceResult(text),  []);
//   const handleRcaDone       = useCallback((text) => setRcaResult(text),       []);
//   const handleRunbookDone   = useCallback((text) => setRunbookResult(text),   []);
//   const handleRecoveryDone  = useCallback((text) => setRecoveryResult(text),  []);

//   // Parsed fields from RCA for Runbook dropdowns
//   const { service: rcaService, incidentType: rcaType, severity: rcaSeverity } =
//     extractRcaFields(rcaResult);

//   // ── Tab definitions ─────────────────────────────────────────────────────────
//   // Using render functions so props are passed at render time, not definition time.
//   const TABS = [
//     {
//       id: 'evidence',
//       label: 'Evidence Correlation',
//       icon: '🛡',
//       hasResult: !!evidenceResult,
//       component: () => (
//         <EvidenceCorrelation
//           onResult={handleEvidenceDone}
//         />
//       ),
//     },
//     {
//       id: 'rca',
//       label: 'RCA',
//       icon: '⚠',
//       hasResult: !!rcaResult,
//       component: () => (
//         <RCA
//           autoFillInput={evidenceResult}
//           onResult={handleRcaDone}
//         />
//       ),
//     },
//     {
//       id: 'runbook',
//       label: 'Runbook Generation',
//       icon: '📖',
//       hasResult: !!runbookResult,
//       component: () => (
//         <RunbookGeneration
//           autoFillService={rcaService}
//           autoFillType={rcaType}
//           autoFillSeverity={rcaSeverity}
//           onResult={handleRunbookDone}
//         />
//       ),
//     },
//     {
//       id: 'recovery',
//       label: 'Recovery Actions',
//       icon: '🚨',
//       hasResult: !!recoveryResult,
//       component: () => (
//         <RecoveryActions
//           autoFillQuery={runbookResult}
//           onResult={handleRecoveryDone}
//         />
//       ),
//     },
//     {
//       id: 'postmortem',
//       label: 'Postmortem',
//       icon: '📝',
//       hasResult: false,   // postmortem is the final output — no downstream
//       component: () => (
//         <PostmortemGeneration
//           autoFillData={{
//             evidenceResult,
//             rcaResult,
//             runbookResult,
//             recoveryResult,
//           }}
//         />
//       ),
//     },
//   ];

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Copilot"
//         subtitle="Understand, diagnose, recover from, and document production incidents."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />
//       <SubTabLayout tabs={TABS} defaultTab="evidence" />
//     </div>
//   );
// }





















// /**
//  * Incident Copilot — index.jsx
//  *
//  * This is the state orchestrator for the full incident workflow:
//  *   Evidence Correlation → RCA → Runbook → Recovery Actions → Postmortem
//  *
//  * ─── Shared state ────────────────────────────────────────────────────────────
//  *
//  *   evidenceResult  (string)
//  *     Raw text output from EvidenceCorrelation.
//  *     Passed to RCA as `autoFillInput` — used to prime the RCA question input.
//  *
//  *   rcaResult  (string)
//  *     Raw text output from RCA.
//  *     Parsed here to extract service / incident type / severity strings, which
//  *     are passed to RunbookGeneration as `autoFillService`, `autoFillType`,
//  *     `autoFillSeverity` props.
//  *
//  *   runbookResult  (string)
//  *     Raw text output from RunbookGeneration.
//  *     Passed to RecoveryActions as `autoFillQuery` — used to prime its
//  *     incident description textarea.
//  *
//  *   recoveryResult  (string)
//  *     Raw text output from RecoveryActions.
//  *     Combined with the three above and passed to PostmortemGeneration as the
//  *     `autoFillData` object.
//  *
//  * ─── Tab dot indicators ──────────────────────────────────────────────────────
//  *   Each tab shows a green dot once its upstream result is ready, so the user
//  *   knows it has been pre-populated.
//  *
//  * ─── SubTabLayout render-function pattern ────────────────────────────────────
//  *   Instead of passing static JSX as `component`, each tab uses a render
//  *   function: `component: (props) => <Component {...relevantProps} />`
//  *   SubTabLayout calls it with the `sharedProps` object (unused here — we
//  *   close over the state variables directly to avoid coupling the layout
//  *   component to domain types).
//  */

// import React, { useState, useCallback } from 'react';
// import SubTabLayout         from '../../components/SubTabLayout.jsx';
// import EvidenceCorrelation  from './EvidenceCorrelation.jsx';
// import RCA                  from './RCA.jsx';
// import RunbookGeneration    from './RunbookGeneration.jsx';
// import RecoveryActions      from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';
// import LogAnalysisAgent from './LogAnalysisAgent.jsx';
// import { IncidentProvider } from './IncidentContext.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// // ── Helpers: parse RCA output for Runbook dropdowns ───────────────────────────

// /**
//  * extractRcaFields(rcaText)
//  * Returns { service, incidentType, severity } as free-form strings.
//  * RunbookGeneration does its own fuzzy-match to map these to dropdown options.
//  */
// function extractRcaFields(rcaText) {
//   if (!rcaText) return {};

//   // Service: look for known service names anywhere in the text
//   const KNOWN = ['payment-svc', 'auth-svc', 'checkout-api', 'notification-svc', 'inventory-svc', 'order-svc'];
//   const lower = rcaText.toLowerCase();
//   const service = KNOWN.find(s => lower.includes(s)) ?? '';

//   // Severity: look for Px pattern in RISK ASSESSMENT section
//   const sevMatch = rcaText.match(/Severity:\s*(P\d)/i);
//   const severity = sevMatch ? sevMatch[1] : '';

//   // Incident type: look for keywords
//   let incidentType = '';
//   if (lower.includes('pool') || lower.includes('connection')) incidentType = 'pool';
//   else if (lower.includes('latency') || lower.includes('sla'))  incidentType = 'latency';
//   else if (lower.includes('circuit'))                           incidentType = 'circuit';
//   else if (lower.includes('oom') || lower.includes('memory'))   incidentType = 'oom';
//   else if (lower.includes('rollback'))                          incidentType = 'rollback';
//   else if (lower.includes('5xx') || lower.includes('500'))      incidentType = '5xx';
//   else if (lower.includes('503') || lower.includes('unreachable')) incidentType = '503';
//   else if (lower.includes('auth') || lower.includes('token'))   incidentType = 'auth';

//   return { service, incidentType, severity };
// }

// // ─────────────────────────────────────────────────────────────────────────────

// export default function IncidentModule() {
//   // ── Shared state ────────────────────────────────────────────────────────────
//   // const [evidenceResult,  setEvidenceResult]  = useState('');
//   // const [rcaResult,       setRcaResult]       = useState('');
//   // const [runbookResult,   setRunbookResult]   = useState('');
//   // const [recoveryResult,  setRecoveryResult]  = useState('');
//   // const [logAnalysisResult, setLogAnalysisResult] = useState('');
//   // Memoised setters — stable references avoid unnecessary child re-renders
//   const handleEvidenceDone  = useCallback((text) => setEvidenceResult(text),  []);
// //   const handleLogAnalysisDone = useCallback(
// //   (text) => setLogAnalysisResult(text),
// //   []
// // );
//   const handleRcaDone       = useCallback((text) => setRcaResult(text),       []);
//   const handleRunbookDone   = useCallback((text) => setRunbookResult(text),   []);
//   const handleRecoveryDone  = useCallback((text) => setRecoveryResult(text),  []);

//   // Parsed fields from RCA for Runbook dropdowns
//   const { service: rcaService, incidentType: rcaType, severity: rcaSeverity } =
//     extractRcaFields(rcaResult);

//   // ── Tab definitions ─────────────────────────────────────────────────────────
//   // Using render functions so props are passed at render time, not definition time.
//   const TABS = [
//     {
//       id: 'evidence',
//       label: 'Evidence Correlation',
//       icon: '🛡',
//       hasResult: !!evidenceResult,
//       component: () => (
//         <EvidenceCorrelation
//           onResult={handleEvidenceDone}
//         />
//       ),
//     },
//     {
//     id: 'loganalysis',
//     label: 'Log Analysis',
//     icon: '🔍',
//     hasResult: !true,
//     component: () => (
//   <LogAnalysisAgent />
// ),
//   //   component: () => (
//   //     <LogAnalysisAgent
//   //     onResult={handleLogAnalysisDone}
//   //    />
//   //  ),
//   },
//     {
//       id: 'rca',
//       label: 'RCA',
//       icon: '⚠',
//       hasResult: !!rcaResult,
//       component: () => (
//         <RCA
//           autoFillInput={evidenceResult}
//           //  autoFillInput={`
//           //   ${evidenceResult}
//           //   ${logAnalysisResult}
//           // `}
//           onResult={handleRcaDone}
//         />
//       ),
//     },
//     {
//       id: 'runbook',
//       label: 'Runbook Generation',
//       icon: '📖',
//       hasResult: !!runbookResult,
//       component: () => (
//         <RunbookGeneration
//           autoFillService={rcaService}
//           autoFillType={rcaType}
//           autoFillSeverity={rcaSeverity}
//           onResult={handleRunbookDone}
//         />
//       ),
//     },
//     {
//       id: 'recovery',
//       label: 'Recovery Actions',
//       icon: '🚨',
//       hasResult: !!recoveryResult,
//       component: () => (
//         <RecoveryActions
//           autoFillQuery={runbookResult}
//           onResult={handleRecoveryDone}
//         />
//       ),
//     },
//     {
//       id: 'postmortem',
//       label: 'Postmortem',
//       icon: '📝',
//       hasResult: false,   // postmortem is the final output — no downstream
//       component: () => (
//         <PostmortemGeneration
//           autoFillData={{
//             evidenceResult,
//             rcaResult,
//             runbookResult,
//             recoveryResult,
//           }}
//         />
//       ),
//     },
//   ];

//   return (
//   <IncidentProvider>
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Copilot"
//         subtitle="Understand, diagnose, recover from, and document production incidents."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />

//       <SubTabLayout
//         tabs={TABS}
//         defaultTab="evidence"
//       />
//     </div>
//   </IncidentProvider>
// );
// }

// //   return (
// //     <div className="fade-in">
// //       <PageHeader
// //         title="Incident Copilot"
// //         subtitle="Understand, diagnose, recover from, and document production incidents."
// //         actions={<Badge variant="red">P1 Active</Badge>}
// //       />
// //       <SubTabLayout tabs={TABS} defaultTab="evidence" />
// //     </div>
// //   );
// // }















// import React, { useState, useCallback } from 'react';
// import SubTabLayout from '../../components/SubTabLayout.jsx';

// import EvidenceCorrelation from './EvidenceCorrelation.jsx';
// import LogAnalysisAgent from './LogAnalysisAgent.jsx';
// import RCA from './RCA.jsx';
// import RunbookGeneration from './RunbookGeneration.jsx';
// import RecoveryActions from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';

// import { IncidentProvider } from './IncidentContext.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// /**
//  * Extract useful RCA fields for RunbookGeneration
//  */
// function extractRcaFields(rcaText) {
//   if (!rcaText) return {};

//   const KNOWN_SERVICES = [
//     'payment-svc',
//     'auth-svc',
//     'checkout-api',
//     'notification-svc',
//     'inventory-svc',
//     'order-svc',
//   ];

//   const lower = rcaText.toLowerCase();

//   const service =
//     KNOWN_SERVICES.find((s) => lower.includes(s)) || '';

//   const severityMatch = rcaText.match(/Severity:\s*(P\d)/i);

//   const severity = severityMatch
//     ? severityMatch[1]
//     : '';

//   let incidentType = '';

//   if (lower.includes('pool') || lower.includes('connection')) {
//     incidentType = 'pool';
//   } else if (lower.includes('latency')) {
//     incidentType = 'latency';
//   } else if (lower.includes('circuit')) {
//     incidentType = 'circuit';
//   } else if (lower.includes('oom') || lower.includes('memory')) {
//     incidentType = 'oom';
//   } else if (lower.includes('rollback')) {
//     incidentType = 'rollback';
//   } else if (lower.includes('503')) {
//     incidentType = '503';
//   } else if (
//     lower.includes('5xx') ||
//     lower.includes('500')
//   ) {
//     incidentType = '5xx';
//   } else if (
//     lower.includes('auth') ||
//     lower.includes('token')
//   ) {
//     incidentType = 'auth';
//   }

//   return {
//     service,
//     incidentType,
//     severity,
//   };
// }

// export default function IncidentModule() {
//   // Existing workflow state
//   const [evidenceResult, setEvidenceResult] = useState('');
//   const [rcaResult, setRcaResult] = useState('');
//   const [runbookResult, setRunbookResult] = useState('');
//   const [recoveryResult, setRecoveryResult] = useState('');

//   const handleEvidenceDone = useCallback((text) => {
//     setEvidenceResult(text);
//   }, []);

//   const handleRcaDone = useCallback((text) => {
//     setRcaResult(text);
//   }, []);

//   const handleRunbookDone = useCallback((text) => {
//     setRunbookResult(text);
//   }, []);

//   const handleRecoveryDone = useCallback((text) => {
//     setRecoveryResult(text);
//   }, []);

//   const {
//     service: rcaService,
//     incidentType: rcaType,
//     severity: rcaSeverity,
//   } = extractRcaFields(rcaResult);

//   const TABS = [
//     {
//       id: 'evidence',
//       label: 'Evidence Correlation',
//       icon: '🛡',
//       hasResult: !!evidenceResult,
//       component: () => (
//         <EvidenceCorrelation
//           onResult={handleEvidenceDone}
//         />
//       ),
//     },

//     {
//       id: 'loganalysis',
//       label: 'Log Analysis',
//       icon: '🔍',
//       hasResult: true,
//       component: () => <LogAnalysisAgent />,
//     },

//     {
//       id: 'rca',
//       label: 'RCA',
//       icon: '⚠',
//       hasResult: !!rcaResult,
//       component: () => (
//         <RCA
//           autoFillInput={evidenceResult}
//           onResult={handleRcaDone}
//         />
//       ),
//     },

//     {
//       id: 'runbook',
//       label: 'Runbook Generation',
//       icon: '📖',
//       hasResult: !!runbookResult,
//       component: () => (
//         <RunbookGeneration
//           autoFillService={rcaService}
//           autoFillType={rcaType}
//           autoFillSeverity={rcaSeverity}
//           onResult={handleRunbookDone}
//         />
//       ),
//     },

//     {
//       id: 'recovery',
//       label: 'Recovery Actions',
//       icon: '🚨',
//       hasResult: !!recoveryResult,
//       component: () => (
//         <RecoveryActions
//           autoFillQuery={runbookResult}
//           onResult={handleRecoveryDone}
//         />
//       ),
//     },

//     {
//       id: 'postmortem',
//       label: 'Postmortem',
//       icon: '📝',
//       hasResult: false,
//       component: () => (
//         <PostmortemGeneration
//           autoFillData={{
//             evidenceResult,
//             rcaResult,
//             runbookResult,
//             recoveryResult,
//           }}
//         />
//       ),
//     },
//   ];

//   return (
//     <IncidentProvider>
//       <div className="fade-in">
//         <PageHeader
//           title="Incident Copilot"
//           subtitle="Understand, diagnose, recover from, and document production incidents."
//           actions={<Badge variant="red">P1 Active</Badge>}
//         />

//         <SubTabLayout
//           tabs={TABS}
//           defaultTab="evidence"
//         />
//       </div>
//     </IncidentProvider>
//   );
// }












// change
// import React from 'react';
// import SubTabLayout from '../../components/SubTabLayout.jsx';

// import EvidenceCorrelation from './EvidenceCorrelation.jsx';
// import LogAnalysisAgent from './LogAnalysisAgent.jsx';
// import RCA from './RCA.jsx';
// import RunbookGeneration from './RunbookGeneration.jsx';
// import RecoveryActions from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';

// import { IncidentProvider, useIncident } from './IncidentContext.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// /**
//  * Inner layout — must be a child of IncidentProvider so it can
//  * read agent status from context for the hasResult tab indicators.
//  */
// function IncidentLayout() {
//   const { agents } = useIncident();

//   const TABS = [
//     {
//       id: 'evidence',
//       label: 'Evidence Correlation',
//       icon: '🛡',
//       hasResult: agents.evidence.status === 'done',
//       component: () => <EvidenceCorrelation />,
//     },
//     {
//       id: 'loganalysis',
//       label: 'Log Analysis',
//       icon: '🔍',
//       hasResult: agents.loganalysis.status === 'done',
//       component: () => <LogAnalysisAgent />,
//     },
//     {
//       id: 'rca',
//       label: 'RCA',
//       icon: '⚠',
//       hasResult: agents.rca.status === 'done',
//       component: () => <RCA />,
//     },
//     {
//       id: 'runbook',
//       label: 'Runbook Generation',
//       icon: '📖',
//       hasResult: agents.runbook.status === 'done',
//       component: () => <RunbookGeneration />,
//     },
//     {
//       id: 'recovery',
//       label: 'Recovery Actions',
//       icon: '🚨',
//       hasResult: agents.recovery.status === 'done',
//       component: () => <RecoveryActions />,
//     },
//     {
//       id: 'postmortem',
//       label: 'Postmortem',
//       icon: '📝',
//       hasResult: agents.postmortem.status === 'done',
//       component: () => <PostmortemGeneration />,
//     },
//   ];

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Copilot"
//         subtitle="Understand, diagnose, recover from, and document production incidents."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />
//       <SubTabLayout tabs={TABS} defaultTab="evidence" />
//     </div>
//   );
// }

// export default function IncidentModule() {
//   return (
//     <IncidentProvider>
//       <IncidentLayout />
//     </IncidentProvider>
//   );
// }












// // working
// import React from 'react';
// import SubTabLayout from '../../components/SubTabLayout.jsx';

// import EvidenceCorrelation from './EvidenceCorrelation.jsx';
// import LogAnalysisAgent from './LogAnalysisAgent.jsx';
// import RCA from './RCA.jsx';
// import RunbookGeneration from './RunbookGeneration.jsx';
// import RecoveryActions from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';

// import { IncidentProvider, useIncident } from './IncidentContext.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// function IncidentLayout({
//   selectedIncident,
//   setActive,
//   setPlatformTab,
//   setArchitectureInput
// }){
//   const { agents } = useIncident();

//   const TABS = [
//     {
//   id: 'evidence',
//   label: 'Evidence Correlation',
//   icon: '🛡',
//   hasResult: agents.evidence.status === 'done',
//   component: () => (
//     <EvidenceCorrelation
//       selectedIncident={selectedIncident}
//     />
//   ),
// },
//     {
//       id: 'loganalysis',
//       label: 'Log Analysis',
//       icon: '🔍',
//       hasResult: agents.loganalysis.status === 'done',
//       component: () => <LogAnalysisAgent />,
//     },
//     {
//   id: 'rca',
//   label: 'RCA',
//   icon: '⚠',
//   hasResult: agents.rca.status === 'done',
//   component: () => (
//     <RCA
//       selectedIncident={selectedIncident}
//       setActive={setActive}
//       setPlatformTab={setPlatformTab}
//       setArchitectureInput={setArchitectureInput}
//     />
//   ),
// },
//     {
//       id: 'runbook',
//       label: 'Runbook Generation',
//       icon: '📖',
//       hasResult: agents.runbook.status === 'done',
//       component: () => <RunbookGeneration />,
//     },
//     {
//       id: 'recovery',
//       label: 'Recovery Actions',
//       icon: '🚨',
//       hasResult: agents.recovery.status === 'done',
//       component: () => <RecoveryActions />,
//     },
//     {
//       id: 'postmortem',
//       label: 'Postmortem',
//       icon: '📝',
//       hasResult: agents.postmortem.status === 'done',
//       component: () => <PostmortemGeneration />,
//     },
//   ];

//   // const statusItem = (done, label) => (
//   //   <div
//   //     style={{
//   //       display: 'flex',
//   //       alignItems: 'center',
//   //       gap: 6,
//   //       fontSize: 12,
//   //       fontWeight: 500,
//   //       color: done ? '#16a34a' : '#64748b',
//   //     }}
//   //   >
//   //     <span>{done ? '✓' : '○'}</span>
//   //     <span>{label}</span>
//   //   </div>
//   // );

//   const statusItem = (status, label) => {
//   const isDone = status === 'done';
//   const isRunning = status === 'running';

//   return (
//     <div
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: 6,
//         fontSize: 12,
//         fontWeight: 500,
//         color: isDone
//           ? '#16a34a'
//           : isRunning
//           ? '#ca8a04'
//           : '#64748b',
//       }}
//     >
//       <span>
//         {isDone
//           ? '✓'
//           : isRunning
//           ? '●'
//           : '○'}
//       </span>

//       <span>{label}</span>
//     </div>
//   );
// };
//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Copilot"
//         subtitle="Understand, diagnose, recover from, and document production incidents."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />

//       {selectedIncident && (
//   <div
//     style={{
//       background: '#eff6ff',
//       border: '1px solid #bfdbfe',
//       borderRadius: 10,
//       padding: 14,
//       marginBottom: 14,
//     }}
//   >
//     <div
//       style={{
//         fontWeight: 700,
//         marginBottom: 6,
//       }}
//     >
//       Active Investigation
//     </div>

//     <div>
//       {selectedIncident.id} — {selectedIncident.title}
//     </div>

//     <div
//       style={{
//         marginTop: 6,
//         fontSize: 12,
//         color: '#64748b',
//       }}
//     >
//       Trigger: {selectedIncident.trigger}
//     </div>
//   </div>
// )}

//       {/* Pipeline Status */}
//       <div
//         style={{
//           background: '#f8fafc',
//           border: '1px solid #e2e8f0',
//           borderRadius: 10,
//           padding: '12px 16px',
//           marginBottom: 14,
//         }}
//       >
//         <div
//           style={{
//             fontSize: 11,
//             fontWeight: 700,
//             color: '#475569',
//             letterSpacing: '0.08em',
//             textTransform: 'uppercase',
//             marginBottom: 10,
//           }}
//         >
//           Workflow Progress
//         </div>

//         <div
//           style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 18,
//           }}
//         >
//           {/* {statusItem(
//             agents.evidence.status === 'done',
//             'Evidence Correlation'
//           )} */}
//           {statusItem(
//   agents.evidence.status,
//   'Evidence Correlation'
// )}
//           {/* {statusItem(
//             agents.loganalysis.status === 'done',
//             'Log Analysis'
//           )} */}
//           {statusItem(
//   agents.loganalysis.status,
//   'Log Analysis'
// )}

//           {/* {statusItem(
//             agents.rca.status === 'done',
//             'RCA'
//           )} */}

//           {statusItem(
//   agents.rca.status,
//   'RCA'
// )}

//           {/* {statusItem(
//             agents.runbook.status === 'done',
//             'Runbook'
//           )} */}
//           {statusItem(
//   agents.runbook.status,
//   'Runbook'
// )}

//           {/* {statusItem(
//             agents.recovery.status === 'done',
//             'Recovery'
//           )} */}
//           {statusItem(
//   agents.recovery.status,
//   'Recovery'
// )}

//           {/* {statusItem(
//             agents.postmortem.status === 'done',
//             'Postmortem'
//           )} */}

//         {statusItem(
//   agents.postmortem.status,
//   'Postmortem'
// )}
//         </div>
//       </div>

//       <SubTabLayout tabs={TABS} defaultTab="evidence" />
//     </div>
//   );
// }

// // export default function IncidentModule() {
// //   return (
// //     <IncidentProvider>
// //       <IncidentLayout />
// //     </IncidentProvider>
// //   );
// // }

// export default function IncidentModule({
//   selectedIncident,
//   setActive,
//   setPlatformTab,
//   setArchitectureInput
// }) {
//   return (
//     <IncidentLayout
//   selectedIncident={selectedIncident}
//   setActive={setActive}
//   setPlatformTab={setPlatformTab}
//   setArchitectureInput={setArchitectureInput}
// />
//   );
// }
















// import React from 'react';
// import SubTabLayout from '../../components/SubTabLayout.jsx';

// import EvidenceCorrelation  from './EvidenceCorrelation.jsx';
// import LogAnalysisAgent     from './LogAnalysisAgent.jsx';
// import RCA                  from './RCA.jsx';
// import RunbookGeneration    from './RunbookGeneration.jsx';
// import RecoveryActions      from './RecoveryActions.jsx';
// import PostmortemGeneration from './PostmortemGeneration.jsx';
// import IncidentCommander    from './IncidentCommander.jsx';   // ← NEW

// import { IncidentProvider, useIncident } from './IncidentContext.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// function IncidentLayout({
//   selectedIncident,
//   setActive,
//   setPlatformTab,
//   setArchitectureInput,
// }) {
//   const { agents } = useIncident();

//   const TABS = [
//     {
//       id: 'evidence',
//       label: 'Evidence Correlation',
//       icon: '🛡',
//       hasResult: agents.evidence.status === 'done',
//       component: () => (
//         <EvidenceCorrelation selectedIncident={selectedIncident} />
//       ),
//     },
//     {
//       id: 'loganalysis',
//       label: 'Log Analysis',
//       icon: '🔍',
//       hasResult: agents.loganalysis.status === 'done',
//       component: () => <LogAnalysisAgent />,
//     },
//     {
//       id: 'rca',
//       label: 'RCA',
//       icon: '⚠',
//       hasResult: agents.rca.status === 'done',
//       component: () => (
//         <RCA
//           selectedIncident={selectedIncident}
//           setActive={setActive}
//           setPlatformTab={setPlatformTab}
//           setArchitectureInput={setArchitectureInput}
//         />
//       ),
//     },
//     {
//       id: 'runbook',
//       label: 'Runbook Generation',
//       icon: '📖',
//       hasResult: agents.runbook.status === 'done',
//       component: () => <RunbookGeneration />,
//     },
//     {
//       id: 'recovery',
//       label: 'Recovery Actions',
//       icon: '🚨',
//       hasResult: agents.recovery.status === 'done',
//       component: () => <RecoveryActions />,
//     },
//     // ── NEW ────────────────────────────────────────────────────────────────
//     {
//       id: 'commander',
//       label: 'Incident Commander',
//       icon: '🎯',
//       hasResult: agents.commander.status === 'done',
//       component: () => <IncidentCommander />,
//     },
//     // ──────────────────────────────────────────────────────────────────────
//     {
//       id: 'postmortem',
//       label: 'Postmortem',
//       icon: '📝',
//       hasResult: agents.postmortem.status === 'done',
//       component: () => <PostmortemGeneration />,
//     },
//   ];

//   const statusItem = (status, label) => {
//     const isDone    = status === 'done';
//     const isRunning = status === 'running';
//     return (
//       <div style={{
//         display: 'flex', alignItems: 'center', gap: 6,
//         fontSize: 12, fontWeight: 500,
//         color: isDone ? '#16a34a' : isRunning ? '#ca8a04' : '#64748b',
//       }}>
//         <span>{isDone ? '✓' : isRunning ? '●' : '○'}</span>
//         <span>{label}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Incident Copilot"
//         subtitle="Understand, diagnose, recover from, and document production incidents."
//         actions={<Badge variant="red">P1 Active</Badge>}
//       />

//       {selectedIncident && (
//         <div style={{
//           background: '#eff6ff', border: '1px solid #bfdbfe',
//           borderRadius: 10, padding: 14, marginBottom: 14,
//         }}>
//           <div style={{ fontWeight: 700, marginBottom: 6 }}>Active Investigation</div>
//           <div>{selectedIncident.id} — {selectedIncident.title}</div>
//           <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
//             Trigger: {selectedIncident.trigger}
//           </div>
//         </div>
//       )}

//       {/* Pipeline Status */}
//       <div style={{
//         background: '#f8fafc', border: '1px solid #e2e8f0',
//         borderRadius: 10, padding: '12px 16px', marginBottom: 14,
//       }}>
//         <div style={{
//           fontSize: 11, fontWeight: 700, color: '#475569',
//           letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
//         }}>
//           Workflow Progress
//         </div>
//         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
//           {statusItem(agents.evidence.status,   'Evidence Correlation')}
//           {statusItem(agents.loganalysis.status, 'Log Analysis')}
//           {statusItem(agents.rca.status,         'RCA')}
//           {statusItem(agents.runbook.status,     'Runbook')}
//           {statusItem(agents.recovery.status,    'Recovery')}
//           {statusItem(agents.commander.status,   'Commander')}   {/* ← NEW */}
//           {statusItem(agents.postmortem.status,  'Postmortem')}
//         </div>
//       </div>

//       <SubTabLayout tabs={TABS} defaultTab="evidence" />
//     </div>
//   );
// }

// export default function IncidentModule({
//   selectedIncident,
//   setActive,
//   setPlatformTab,
//   setArchitectureInput,
// }) {
//   return (
//     <IncidentLayout
//       selectedIncident={selectedIncident}
//       setActive={setActive}
//       setPlatformTab={setPlatformTab}
//       setArchitectureInput={setArchitectureInput}
//     />
//   );
// }















import React, { useRef } from 'react';
import SubTabLayout from '../../components/SubTabLayout.jsx';

import EvidenceCorrelation  from './EvidenceCorrelation.jsx';
import LogAnalysisAgent     from './LogAnalysisAgent.jsx';
import RCA                  from './RCA.jsx';
import RunbookGeneration    from './RunbookGeneration.jsx';
import RecoveryActions      from './RecoveryActions.jsx';
import IncidentCommander    from './IncidentCommander.jsx';
import ActionExecutor       from './ActionExecutor.jsx';        // ← NEW
import PostmortemGeneration from './PostmortemGeneration.jsx';

import { useIncident } from './IncidentContext.jsx';
import { PageHeader, Badge } from '../../components/UI.jsx';

function IncidentLayout({
  selectedIncident,
  setActive,
  setPlatformTab,
  setArchitectureInput,
}) {
  const { agents } = useIncident();

  // Ref lets Commander imperatively switch to the executor tab
  const tabRef = useRef(null);
  function onTabChange(tabId) {
    tabRef.current?.setTab?.(tabId);
  }

  const TABS = [
    {
      id: 'evidence',
      label: 'Evidence Correlation',
      icon: '🛡',
      hasResult: agents.evidence.status === 'done',
      component: () => (
        <EvidenceCorrelation selectedIncident={selectedIncident} />
      ),
    },
    {
      id: 'loganalysis',
      label: 'Log Analysis',
      icon: '🔍',
      hasResult: agents.loganalysis.status === 'done',
      component: () => <LogAnalysisAgent />,
    },
    {
      id: 'rca',
      label: 'RCA',
      icon: '⚠',
      hasResult: agents.rca.status === 'done',
      component: () => (
        <RCA
          selectedIncident={selectedIncident}
          setActive={setActive}
          setPlatformTab={setPlatformTab}
          setArchitectureInput={setArchitectureInput}
        />
      ),
    },
    {
      id: 'runbook',
      label: 'Runbook Generation',
      icon: '📖',
      hasResult: agents.runbook.status === 'done',
      component: () => <RunbookGeneration />,
    },
    {
      id: 'recovery',
      label: 'Recovery Actions',
      icon: '🚨',
      hasResult: agents.recovery.status === 'done',
      component: () => <RecoveryActions />,
    },
    {
      id: 'commander',
      label: 'Incident Commander',
      icon: '🎯',
      hasResult: agents.commander.status === 'done',
      component: () => (
        <IncidentCommander onTabChange={onTabChange} />
      ),
    },
    // ── NEW ───────────────────────────────────────────────────────────────────
    {
      id: 'executor',
      label: 'Action Executor',
      icon: '⚡',
      hasResult: agents.executor.status === 'done',
      component: () => <ActionExecutor />,
    },
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'postmortem',
      label: 'Postmortem',
      icon: '📝',
      hasResult: agents.postmortem.status === 'done',
      component: () => <PostmortemGeneration />,
    },
  ];

  const statusItem = (status, label) => {
    const isDone    = status === 'done';
    const isRunning = status === 'running';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 500,
        color: isDone ? '#16a34a' : isRunning ? '#ca8a04' : '#64748b',
      }}>
        <span>{isDone ? '✓' : isRunning ? '●' : '○'}</span>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Incident Copilot"
        subtitle="Understand, diagnose, recover from, and document production incidents."
        actions={<Badge variant="red">P1 Active</Badge>}
      />

      {selectedIncident && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 10, padding: 14, marginBottom: 14,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Active Investigation</div>
          <div>{selectedIncident.id} — {selectedIncident.title}</div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
            Trigger: {selectedIncident.trigger}
          </div>
        </div>
      )}

      {/* Pipeline Status */}
      <div style={{
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 10, padding: '12px 16px', marginBottom: 14,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#475569',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          Workflow Progress
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
          {statusItem(agents.evidence.status,    'Evidence Correlation')}
          {statusItem(agents.loganalysis.status,  'Log Analysis')}
          {statusItem(agents.rca.status,          'RCA')}
          {statusItem(agents.runbook.status,      'Runbook')}
          {statusItem(agents.recovery.status,     'Recovery')}
          {statusItem(agents.commander.status,    'Commander')}
          {statusItem(agents.executor.status,     'Executor')}    {/* ← NEW */}
          {statusItem(agents.postmortem.status,   'Postmortem')}
        </div>
      </div>

      <SubTabLayout ref={tabRef} tabs={TABS} defaultTab="evidence" />
    </div>
  );
}

export default function IncidentModule({
  selectedIncident,
  setActive,
  setPlatformTab,
  setArchitectureInput,
}) {
  return (
    <IncidentLayout
      selectedIncident={selectedIncident}
      setActive={setActive}
      setPlatformTab={setPlatformTab}
      setArchitectureInput={setArchitectureInput}
    />
  );
}
