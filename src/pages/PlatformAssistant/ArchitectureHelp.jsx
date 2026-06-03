// import React, { useState } from 'react';
// import { Card, SectionLabel, Button, Textarea, Spinner, Badge } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `
// You are a Principal AWS Solutions Architect.

// Return the response in EXACTLY this format with ALL sections — do not skip any:

// REFERENCE_ARCHITECTURE:
// \`\`\`
// [Generate a detailed ASCII architecture diagram using box-drawing characters
// (┌ ─ │ └ ┐ ┘ ├ ┤ ┬ ┴ ┼ ▼ ►).

// Requirements:
// - Show VPC boundaries
// - Show public and private subnets
// - Show Availability Zones (AZs) and regions when applicable
// - Include every user-described AWS service and external dependency
// - Include ALBs, API Gateway, databases, caches, queues, storage, CDN, networking, and security components where applicable
// - Show directional data flow using arrows
// - Label major components clearly
// - Reflect the exact architecture described by the user (never generic)
// - Organize components logically and minimize line crossings
// - Make the diagram production-grade and highly detailed]
// \`\`\`

// ARCHITECTURE_ANALYSIS:
// [2–4 paragraph assessment covering architecture quality, service interactions, data flow, availability posture, scalability, and suitability for the workload.]

// SINGLE_POINTS_OF_FAILURE:
// • [Component] — [Why it is a SPOF and impact of failure]
// • [Repeat for every SPOF found]

// RECOMMENDATIONS:
// 1. [Priority: Critical / High / Medium] [Specific actionable AWS recommendation]
// 2. [Repeat]
// 3. [Repeat]

// SCALABILITY_PLAN:
// • [Component] → [Exact AWS scaling strategy]
// • [Repeat for each bottleneck]

// SECURITY_REVIEW:
// • [Finding + AWS-specific remediation]
// • [Repeat]

// COST_OPTIMIZATION:
// • [Optimization + estimated impact]
// • [Repeat]

// OBSERVABILITY:
// • [Gap + monitoring/logging/tracing solution]
// • [Repeat]

// Rules:
// - ALWAYS begin with REFERENCE_ARCHITECTURE.
// - The ASCII diagram MUST be inside triple backticks.
// - The diagram MUST reflect the exact services described by the user.
// - Use box-drawing characters for all diagrams.
// - Show network boundaries, AZ placement, and data flow.
// - Use real AWS services, configurations, instance types, and best practices.
// - Infer missing infrastructure only when necessary and state assumptions.
// - Prioritize high availability, security, scalability, and operational excellence.
// - No filler text. Every line must add value.
// - Maximum response length: 1400 words.
// `;

// const EXAMPLES = [
//   {
//     label: 'Current microservices stack',
//     value: `Services:
// - payment-svc: Node.js on ECS Fargate, RDS Postgres (single AZ), ElastiCache Redis
// - auth-svc: Node.js on ECS Fargate, JWT RS256
// - checkout-api: Node.js on ECS Fargate, talks to payment-svc
// - notification-svc: Node.js, SES for email

// Infrastructure:
// - ALB in front of all services
// - Single VPC, 2 subnets (both public)
// - No CDN
// - CloudWatch for logs, no tracing
// - GitHub Actions CI/CD to ECR + ECS

// Question: What are the weaknesses and how should I improve this architecture?`
//   },
//   {
//     label: 'Scale to 10x traffic',
//     value: `Current setup handles ~1000 req/min across all services.
// We expect Black Friday to bring 10x traffic (10,000 req/min).
// Payment service is the bottleneck — currently 3 ECS tasks, RDS db.t3.medium.
// How should I prepare the infrastructure for 10x load?`
//   },
//   {
//     label: 'Incident Copilot Architecture',
//     value: `
// Application:
// AI Operations Copilot

// Modules:
// - Evidence Correlation
// - RCA
// - Runbook Generation
// - Recovery Actions
// - Postmortem Generation
// - Documentation Intelligence
// - Log Analysis

// Frontend:
// React + Vite

// Backend:
// FastAPI

// AI:
// Claude Sonnet

// Infrastructure:
// AWS ECS Fargate
// CloudWatch
// RDS PostgreSQL
// OpenSearch
// S3

// Question:
// Review this architecture.
// Identify SPOFs.
// Recommend improvements for scalability,
// security, observability and cost.
// Provide an architecture diagram.
// `
//   }
// ];

// function removeArchitectureScore(text) {
//   return text.replace(
//     /ARCHITECTURE_SCORE:\s*\d+\s*/i,
//     ''
//   );
// }

// function RenderResponse({ text }) {
//   if (!text) return null;
//   const parts = text.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--text-primary)' }}>
//       {parts.map((part, i) => {
//         if (part.startsWith('```')) {
//           const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
//           return (
//             <pre
//               key={i}
//               style={{
//                 background: '#0f172a',
//                 color: '#e2e8f0',
//                 borderRadius: 8,
//                 padding: '12px 16px',
//                 fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", monospace',
//                 fontSize: '11.5px',
//                 lineHeight: 1.65,
//                 overflow: 'auto',
//                 margin: '8px 0 12px',
//                 border: '1px solid #1e293b',
//                 whiteSpace: 'pre',
//               }}
//             >
//               {code}
//             </pre>
//           );
//         }

//         // Render plain text, highlighting section headers like SINGLE_POINTS_OF_FAILURE:
//         const lines = part.split('\n');
//         return (
//           <span key={i}>
//             {lines.map((line, j) => {
//               const isHeader = /^[A-Z][A-Z_]+:$/.test(line.trim());
//               if (isHeader) {
//                 return (
//                   <div
//                     key={j}
//                     style={{
//                       fontWeight: 700,
//                       fontSize: 11,
//                       letterSpacing: '0.08em',
//                       color: '#2563eb',
//                       textTransform: 'uppercase',
//                       marginTop: 18,
//                       marginBottom: 4,
//                       borderBottom: '1px solid #e2e8f0',
//                       paddingBottom: 3,
//                     }}
//                   >
//                     {line.replace(/_/g, ' ')}
//                   </div>
//                 );
//               }
//               return (
//                 <span key={j} style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
//                   {line}
//                 </span>
//               );
//             })}
//           </span>
//         );
//       })}
//     </div>
//   );
// }

// export default function ArchitectureHelp() {
//   const [input, setInput] = useState(EXAMPLES[0].value);
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [activeExample, setActiveExample] = useState(0);

//   async function run() {
//     if (!input.trim() || loading) return;

//     setLoading(true);
//     setResponse('');

//     try {
//       await callClaudeStream({
//         system: SYSTEM,

//         messages: [
//           {
//             role: 'user',
//             content: input.trim()
//           }
//         ],

//         maxTokens: 8192,

//         onChunk: (_, fullText) => {
//           setResponse(removeArchitectureScore(fullText));
//         },

//         onDone: () => {
//           setLoading(false);
//         }
//       });
//     } catch (error) {
//       console.error(error);

//       setResponse(
//         `Failed to analyze architecture.\n\n${error.message}`
//       );

//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       {/* Example Buttons */}
//       <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
//         {EXAMPLES.map((ex, i) => (
//           <button
//             key={i}
//             onClick={() => {
//               setInput(ex.value);
//               setResponse('');
//               setLoading(false);
//               setActiveExample(i);
//             }}
//             style={{
//               background:
//                 activeExample === i
//                   ? '#eff6ff'
//                   : 'var(--content-bg)',

//               border: `1px solid ${
//                 activeExample === i
//                   ? '#bfdbfe'
//                   : 'var(--content-border)'
//               }`,

//               color:
//                 activeExample === i
//                   ? '#2563eb'
//                   : 'var(--text-secondary)',

//               borderRadius: 6,
//               padding: '4px 12px',
//               fontSize: 12,
//               cursor: 'pointer',
//               fontFamily: 'var(--font-body)',
//               fontWeight:
//                 activeExample === i ? 600 : 400
//             }}
//           >
//             {ex.label}
//           </button>
//         ))}
//       </div>

//       {/* Input Section */}
//       <Card style={{ marginBottom: 14 }}>
//         <SectionLabel>
//           Describe your architecture or ask a question
//         </SectionLabel>

//         <Textarea
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           rows={10}
//           placeholder="Describe your services, infrastructure, and what you want to improve…"
//         />

//         <div style={{ marginTop: 12 }}>
//           <Button
//             variant="primary"
//             onClick={run}
//             disabled={loading}
//             icon={
//               loading
//                 ? <Spinner size={14} color="#fff" />
//                 : null
//             }
//           >
//             {loading
//               ? 'Analyzing…'
//               : '🏛 Analyze Architecture'}
//           </Button>
//         </div>
//       </Card>

//       {/* Results */}
//       {(response || loading) && (
//         <Card className="fade-in">
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               marginBottom: 14
//             }}
//           >
//             <SectionLabel style={{ marginBottom: 0 }}>
//               Architecture Review
//             </SectionLabel>

//             {loading && <Spinner size={13} />}

//             {!loading && (
//               <Badge variant="blue">
//                 Complete
//               </Badge>
//             )}
//           </div>

//           {loading && !response ? (
//             <div
//               style={{
//                 display: 'flex',
//                 gap: 8,
//                 alignItems: 'center',
//                 color: 'var(--text-muted)',
//                 fontSize: 13
//               }}
//             >
//               <Spinner />
//               Analyzing architecture...
//             </div>
//           ) : (
//             <RenderResponse text={response} />
//           )}
//         </Card>
//       )}
//     </div>
//   );
// }













// import React, { useState, useEffect } from 'react';
// import { Card, SectionLabel, Button, Textarea, Spinner, Badge } from '../../components/UI.jsx';
// import { callClaudeStream } from '../../lib/claude.js';

// // const SYSTEM = `
// // You are a Principal AWS Solutions Architect and AWS Well-Architected Framework expert.

// // Return the response in EXACTLY this format with ALL sections — do not skip any:

// // REFERENCE_ARCHITECTURE:
// // \`\`\`
// // First, reason about the structure using this tree format:

// // Region: <region>
// //  ├─ AZ-1
// //  │   ├─ Public Subnet: <components>
// //  │   └─ Private Subnet: <components>
// //  └─ AZ-2
// //      ├─ Public Subnet: <components>
// //      └─ Private Subnet: <components>
// // External: <CDN, users, third-party services>
// // Data: <databases, caches, queues>
// // Monitoring: <observability components>

// // Then convert that structure into a box-drawing diagram using this layout as your template:

// // ┌──────────────────────── AWS Region (us-east-1) ────────────────────────┐
// // │                                                                         │
// // │  ┌───────────────── AZ-1 ──────────────────┐                           │
// // │  │  ┌─ Public Subnet ─┐  ┌─ Private Subnet─┐  │                        │
// // │  │  │  ALB            │  │  ECS Services   │  │                        │
// // │  │  │  NAT Gateway    │  │  RDS Primary    │  │                        │
// // │  │  └─────────────────┘  └─────────────────┘  │                        │
// // │  └─────────────────────────────────────────────┘                        │
// // │                                                                         │
// // │  ┌───────────────── AZ-2 ──────────────────┐                           │
// // │  │  ┌─ Public Subnet ─┐  ┌─ Private Subnet─┐  │                        │
// // │  │  │  ALB            │  │  ECS Services   │  │                        │
// // │  │  │  NAT Gateway    │  │  RDS Replica    │  │                        │
// // │  │  └─────────────────┘  └─────────────────┘  │                        │
// // │  └─────────────────────────────────────────────┘                        │
// // │                                                                         │
// // └─────────────────────────────────────────────────────────────────────────┘

// // Diagram Constraints:
// // - Maximum width: 120 characters per line — never exceed this
// // - Maximum height: 60 lines
// // - Never create borders wider than the content requires
// // - Never generate empty rectangles — every box must contain labeled AWS resources
// // - Prefer horizontal layouts over vertical stacking
// // - Show directional data flow using arrows (▼ ► ◄ ▲)
// // - Label every component clearly with its AWS service name
// // - Show Security Groups, Internet Gateway, NAT Gateway where applicable
// // - Reflect the EXACT services described by the user — never substitute alternatives
// // - Do not invent components unless required for production readiness
// // \`\`\`

// // ASSUMPTIONS:
// // - [List any components or configurations assumed for production readiness]
// // - [If no assumptions were made, write: None]

// // ARCHITECTURE_ANALYSIS:
// // [2–4 paragraph assessment covering architecture quality, service interactions, data flow, availability posture, scalability, and suitability for the workload.]

// // SINGLE_POINTS_OF_FAILURE:
// // - [Component] — [Why it is a SPOF and impact of failure]
// // - [Repeat for every SPOF found]

// // RECOMMENDATIONS:
// // 1. [Priority: Critical / High / Medium] [Specific actionable AWS recommendation]
// // 2. [Repeat]
// // 3. [Repeat]

// // SCALABILITY_PLAN:
// // - [Component] → [Exact AWS scaling strategy]
// // - [Repeat for each bottleneck]

// // SECURITY_REVIEW:
// // - [Finding + AWS-specific remediation]
// // - [Repeat]

// // COST_OPTIMIZATION:
// // - [Optimization + estimated impact]
// // - [Repeat]

// // OBSERVABILITY:
// // - [Gap + monitoring/logging/tracing solution]
// // - [Repeat]

// // WELL_ARCHITECTED_REVIEW:

// // Operational Excellence:
// // - [Finding or confirmation]

// // Security:
// // - [Finding or confirmation]

// // Reliability:
// // - [Finding or confirmation]

// // Performance Efficiency:
// // - [Finding or confirmation]

// // Cost Optimization:
// // - [Finding or confirmation]

// // Workload-Specific Analysis Rules:

// // Food Delivery:
// // - Peak meal traffic
// // - Delivery latency
// // - Notification throughput

// // E-Commerce:
// // - Checkout reliability
// // - Payment bottlenecks
// // - Black Friday scaling

// // AI Platforms:
// // - Model inference latency
// // - GPU utilization
// // - Vector search scalability

// // Incident Management:
// // - MTTR reduction
// // - RCA automation
// // - Alert correlation

// // Rules:
// // - ALWAYS begin with REFERENCE_ARCHITECTURE.
// // - First output the structure tree, then the box-drawing diagram — both inside the single code block.
// // - The ASCII diagram MUST follow the template layout above.
// // - Maximum diagram width: 120 characters. Maximum height: 60 lines.
// // - Never create a border line longer than 120 characters.
// // - Never generate empty boxes — every box must contain labeled AWS resources.
// // - If the user provides AWS services, NEVER replace them with alternative services.
// // - Do not invent components unless required for production readiness. List all assumptions under ASSUMPTIONS.
// // - Prefer horizontal layouts. Show Region, AZs, Subnets, Security Groups, NAT Gateways, Internet Gateway, and data flow.
// // - Use real AWS services, configurations, instance types, and best practices.
// // - Prioritize high availability, security, scalability, and operational excellence.
// // - No filler text. Every line must add value.
// // `;


// const SYSTEM = `
// You are a Principal AWS Solutions Architect and AWS Well-Architected Framework expert.

// Return the response in EXACTLY this format:

// REFERENCE_ARCHITECTURE:
// \`\`\`
// Generate ONE architecture diagram.

// IMPORTANT:
// If the architecture is large, summarize components inside AZs.
// Never create diagrams wider than 120 characters.
// Never create diagrams taller than 20 lines.

// Requirements:
// - Show Region, AZs, Public and Private Subnets
// - Show Internet Gateway, NAT Gateway, Security Groups when applicable
// - Show compute layer and data layer
// - Show major traffic flow arrows
// - Maximum 20 lines
// - Maximum 120 characters per line
// - Prefer horizontal layouts
// - Do not generate empty boxes
// - Do not repeat components unless deployed across multiple AZs

// \`\`\`

// ASSUMPTIONS:
// - List assumptions made for production readiness.
// - If none, write "None".

// ARCHITECTURE_ANALYSIS:
// - Maximum 5 Findings
// - One sentence per finding

// SINGLE_POINTS_OF_FAILURE:
// - Identify at least 3 realistic SPOFs, operational risks, or failure domains.
// - Include deployment, database, networking, and regional risks when applicable.
// - Never return "None identified".

// RECOMMENDATIONS:
// 1. Priority + recommendation
// 2. Priority + recommendation
// 3. Priority + recommendation

// SCALABILITY_PLAN:
// - Component → scaling strategy

// SECURITY_REVIEW:
// - Maximum 5 findings

// COST_OPTIMIZATION:
// - Maximum 5 findings

// OBSERVABILITY:
// - Maximum 5 findings

// WELL_ARCHITECTED_REVIEW:

// Operational Excellence:
// - Finding

// Security:
// - Finding

// Reliability:
// - Finding

// Performance Efficiency:
// - Finding

// Cost Optimization:
// - Finding

// Rules:
// - Always start with REFERENCE_ARCHITECTURE.
// - Keep the diagram concise.
// - Prioritize analysis quality over diagram size.
// - Use AWS best practices.
// - Be workload-specific where applicable.
// - No filler text.
// - Keep the total response under 1500 words.
// Do not repeat the same component in multiple locations unless it is truly deployed in multiple AZs.

// Avoid empty AZs and empty subnets.

// Keep the architecture diagram compact and information-dense.

// `;

// const EXAMPLES = [
//   {
//     label: 'Microservices stack',
//     value: `Services:
// - payment-svc: Node.js on ECS Fargate, RDS Postgres (single AZ), ElastiCache Redis
// - auth-svc: Node.js on ECS Fargate, JWT RS256
// - checkout-api: Node.js on ECS Fargate, talks to payment-svc
// - notification-svc: Node.js, SES for email

// Infrastructure:
// - ALB in front of all services
// - Single VPC, 2 subnets (both public)
// - No CDN
// - CloudWatch for logs, no tracing
// - GitHub Actions CI/CD to ECR + ECS

// Question: What are the weaknesses and how should I improve this architecture?`,
//   },
//   {
//     label: 'Scale to 10x traffic',
//     value: `Current setup handles ~1000 req/min across all services.
// We expect Black Friday to bring 10x traffic (10,000 req/min).
// Payment service is the bottleneck — currently 3 ECS tasks, RDS db.t3.medium.
// How should I prepare the infrastructure for 10x load?`,
//   },
//   {
//     label: 'Incident Copilot',
//     value: `Application:
// AI Operations Copilot

// Modules:
// - Evidence Correlation
// - RCA
// - Runbook Generation
// - Recovery Actions
// - Postmortem Generation
// - Log Analysis

// Frontend: React + Vite
// Backend: FastAPI
// AI: Claude Sonnet

// Infrastructure:
// AWS ECS Fargate, CloudWatch, RDS PostgreSQL, OpenSearch, S3

// Question:
// Review this architecture. Identify SPOFs. Recommend improvements for scalability, security, observability and cost. Provide an architecture diagram.`,
//   },
//   {
//     label: 'Event-driven',
//     value: `Frontend:
// React

// API:
// API Gateway

// Services:
// Order Service
// Inventory Service
// Payment Service

// Messaging:
// SNS
// SQS

// Database:
// Aurora PostgreSQL

// Question:
// Review architecture and identify scaling bottlenecks.`,
//   },
//   {
//     label: 'Multi-region DR',
//     value: `Users worldwide

// CloudFront
// Route53 Latency Routing

// Primary Region:
// us-east-1

// Secondary Region:
// us-west-2

// Aurora Global Database

// Question:
// Review disaster recovery posture.`,
//   },
// ];

// const CACHE_PREFIX = 'architecture-help-';
// const CACHE_TTL    = 15 * 60 * 1000;

// // ── Guards ────────────────────────────────────────────────────────────────────

// function removeArchitectureScore(text) {
//   return text.replace(/ARCHITECTURE_SCORE:\s*\d+\s*/i, '');
// }

// /**
//  * Detect pathological diagrams — a run of 300+ identical box-drawing
//  * characters is a strong signal that the model produced a runaway border line.
//  */
// // function isBrokenDiagram(text) {
// //   return /─{300,}/.test(text);
// // }

// // function isBrokenDiagram(text) {
// //   const lines = text.split('\n');

// //   return lines.some(line =>
// //     line.length > 500
// //   );
// // }

// // ── Renderer ──────────────────────────────────────────────────────────────────

// function RenderResponse({ text }) {
//   if (!text) return null;
//   const parts = text.split(/(```[\s\S]*?```)/g);
//   return (
//     <div style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--text-primary)' }}>
//       {parts.map((part, i) => {
//         if (part.startsWith('```')) {
//           const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
//           return (
//             <pre
//               key={i}
//               style={{
//                 background:  '#0f172a',
//                 color:       '#e2e8f0',
//                 borderRadius: 8,
//                 padding:     '12px 16px',
//                 fontFamily:  'ui-monospace, "Cascadia Code", "Fira Code", monospace',
//                 fontSize:    '11.5px',
//                 lineHeight:  1.65,
//                 // overflow:    'auto',
//                 overflowX: 'auto',
//                 overflowY: 'auto',
//                 maxHeight: '700px',
//                 margin:      '8px 0 12px',
//                 border:      '1px solid #1e293b',
//                 whiteSpace:  'pre',
//               }}
//             >
//               {code}
//             </pre>
//           );
//         }

//         const lines = part.split('\n');
//         return (
//           <span key={i}>
//             {lines.map((line, j) => {
//               // Matches both ALL_CAPS_HEADERS: and Title Case Headers:
//               const isHeader = /^[A-Z][A-Za-z_\s]+:$/.test(line.trim());
//               if (isHeader) {
//                 return (
//                   <div
//   key={j}
//   style={{
//     background: '#eff6ff',
//     border: '1px solid #bfdbfe',
//     borderRadius: 8,
//     padding: '8px 12px',
//     fontWeight: 700,
//     fontSize: 11,
//     letterSpacing: '0.08em',
//     color:
// line.includes('SINGLE_POINTS_OF_FAILURE') ? '#dc2626' :
// line.includes('SECURITY_REVIEW') ? '#ea580c' :
// line.includes('COST_OPTIMIZATION') ? '#16a34a' :
// line.includes('RECOMMENDATIONS') ? '#2563eb' :
// '#1d4ed8',
//     textTransform: 'uppercase',
//     marginTop: 14,
//     marginBottom: 8
//   }}
// >
//                     {line.replace(/_/g, ' ')}
//                   </div>
//                 );
//               }
//               return (
//                 <span key={j} style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
//                   {line}
//                 </span>
//               );
//             })}
//           </span>
//         );
//       })}
//     </div>
//   );
// }

// // ── Component ─────────────────────────────────────────────────────────────────

// export default function ArchitectureHelp() {
//   const [input,         setInput]         = useState(EXAMPLES[0].value);
//   const [response,      setResponse]      = useState('');
//   const [loading,       setLoading]       = useState(false);
//   const [activeExample, setActiveExample] = useState(0);
//   const [copied,        setCopied]        = useState(false);

//   // Purge expired cache entries on mount
//   useEffect(() => {
//     try {
//       Object.keys(localStorage).forEach(key => {
//         if (key.startsWith(CACHE_PREFIX)) {
//           // const item = JSON.parse(localStorage.getItem(key));
//           // if (Date.now() - item.timestamp > CACHE_TTL) {
//           //   localStorage.removeItem(key);
//           // }
//           const raw = localStorage.getItem(key);
// if (!raw) return;

// const item = JSON.parse(raw);

// if (
//   item?.timestamp &&
//   Date.now() - item.timestamp > CACHE_TTL
// ) {
//   localStorage.removeItem(key);
// }
//         }
//       });
//     } catch (err) {
//       console.error('Cache cleanup failed:', err);
//     }
//   }, []);

//   async function run() {
//     if (!input.trim() || loading) return;
//     setResponse('');
//     setLoading(true);
//     setCopied(false);

//     const cacheKey = CACHE_PREFIX + encodeURIComponent(input.trim());

//     // ── Cache read ────────────────────────────────────────────────────────────
//     try {
//   const cached = localStorage.getItem(cacheKey);

//   if (cached) {
//     const parsed = JSON.parse(cached);

//     if (!parsed?.result || !parsed?.timestamp) {
//   localStorage.removeItem(cacheKey);
// } else if (Date.now() - parsed.timestamp < CACHE_TTL) {
//   await new Promise(r => setTimeout(r, 120));

//   setResponse(removeArchitectureScore(parsed.result));
//   setLoading(false);
//   return;
// }
//   }
// } catch (err) {
//   console.error('Cache read failed:', err);
// }

//     // ── Stream ────────────────────────────────────────────────────────────────
//     // Throttle rerenders to at most once every 100ms during streaming
//     let lastUpdate = 0;

//     try {
//       await callClaudeStream({
//         system:    SYSTEM,
//         messages:  [{ role: 'user', content: input.trim() }],
//         temperature: 0.2,
//         maxTokens: 4500,
//         onChunk: (_, fullText) => {
//           const now = Date.now();
//           if (now - lastUpdate > 100) {
//             setResponse(removeArchitectureScore(fullText));
//             lastUpdate = now;
//           }
//         },
//         onDone: (full) => {
//           // Validate before displaying or caching
//           // if (isBrokenDiagram(full)) {
//           //   setResponse(
//           //     'Architecture diagram generation failed — the model produced an oversized border line.\n\nPlease try again. If the problem persists, simplify your architecture description.',
//           //   );
//           //   setLoading(false);
//           //   return;
//           // }
//           // if (isBrokenDiagram(full)) {
//           //   console.warn('Large diagram detected');
//           // }

//           const clean = removeArchitectureScore(full);
//           // Final update — always apply so the last streamed chunk isn't dropped
//           setResponse(clean);

//           try {
//             localStorage.setItem(cacheKey, JSON.stringify({ result: full, timestamp: Date.now() }));
//           } catch (err) {
//             console.error('Cache write failed:', err);
//           }
//           setLoading(false);
//         },
//       });
//     } catch (error) {
//       console.error(error);
//       setResponse(
//         `Failed to analyze architecture.\n\nPossible causes:\n- Claude API unavailable\n- Network issue\n- Invalid API key\n\nDetails:\n${error?.message || 'Unknown error'}`,
//       );
//       setLoading(false);
//     }
//   }

//   function handleCopy() {
//     navigator.clipboard.writeText(response).then(() => {
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     });
//   }

//   // ── Render ────────────────────────────────────────────────────────────────

//   return (
//     <div>
//       {/* Example buttons */}
//       <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
//         {EXAMPLES.map((ex, i) => (
//           <button
//             key={i}
//             onClick={() => {
//               setInput(ex.value);
//               setResponse('');
//               setLoading(false);
//               setCopied(false);
//               setActiveExample(i);
//             }}
//             style={{
//               background:   activeExample === i ? '#eff6ff' : 'var(--content-bg)',
//               border:       `1px solid ${activeExample === i ? '#bfdbfe' : 'var(--content-border)'}`,
//               color:        activeExample === i ? '#2563eb' : 'var(--text-secondary)',
//               borderRadius: 6,
//               padding:      '4px 12px',
//               fontSize:     12,
//               cursor:       'pointer',
//               fontFamily:   'var(--font-body)',
//               fontWeight:   activeExample === i ? 600 : 400,
//             }}
//           >
//             {ex.label}
//           </button>
//         ))}
//       </div>

//       {/* Input */}
//       <Card style={{ marginBottom: 14 }}>
//         <SectionLabel>Describe your architecture or ask a question</SectionLabel>
//         <Textarea
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           rows={10}
//           placeholder="Describe your services, infrastructure, and what you want to improve…"
//         />
//         <div style={{ marginTop: 12 }}>
//           <Button
//             variant="primary"
//             onClick={run}
//             disabled={loading}
//             icon={loading ? <Spinner size={14} color="#fff" /> : null}
//           >
//             {loading ? 'Analyzing…' : '🏛 Analyze Architecture'}
//           </Button>
//         </div>
//       </Card>

//       {/* Results */}
//       {(response || loading) && (
//         <Card className="fade-in">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <SectionLabel style={{ marginBottom: 0 }}>Architecture Review</SectionLabel>
//             {loading  && <Spinner size={13} />}
//             {!loading && <Badge variant="blue">Complete</Badge>}
//             {!loading && response && (
//               <button
//                 onClick={handleCopy}
//                 style={{
//                   marginLeft:   'auto',
//                   fontSize:     12,
//                   color:        copied ? '#10b981' : 'var(--accent-blue)',
//                   background:   'none',
//                   border:       '1px solid var(--content-border)',
//                   borderRadius: 6,
//                   padding:      '3px 10px',
//                   cursor:       'pointer',
//                   fontFamily:   'var(--font-body)',
//                   transition:   'color 0.15s',
//                 }}
//               >
//                 {copied ? '✓ Copied' : '⎘ Copy Report'}
//               </button>
//             )}
//           </div>

//           {loading && !response
//             ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}><Spinner />Analyzing architecture…</div>
//             : <RenderResponse text={response} />
//           }
//         </Card>
//       )}
//     </div>
//   );
// }

















import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, Button, Textarea, Spinner, Badge } from '../../components/UI.jsx';
import { callClaudeStream } from '../../lib/claude.js';

// const SYSTEM = `
// You are a Principal AWS Solutions Architect and AWS Well-Architected Framework expert.

// Return the response in EXACTLY this format with ALL sections — do not skip any:

// REFERENCE_ARCHITECTURE:
// \`\`\`
// First, reason about the structure using this tree format:

// Region: <region>
//  ├─ AZ-1
//  │   ├─ Public Subnet: <components>
//  │   └─ Private Subnet: <components>
//  └─ AZ-2
//      ├─ Public Subnet: <components>
//      └─ Private Subnet: <components>
// External: <CDN, users, third-party services>
// Data: <databases, caches, queues>
// Monitoring: <observability components>

// Then convert that structure into a box-drawing diagram using this layout as your template:

// ┌──────────────────────── AWS Region (us-east-1) ────────────────────────┐
// │                                                                         │
// │  ┌───────────────── AZ-1 ──────────────────┐                           │
// │  │  ┌─ Public Subnet ─┐  ┌─ Private Subnet─┐  │                        │
// │  │  │  ALB            │  │  ECS Services   │  │                        │
// │  │  │  NAT Gateway    │  │  RDS Primary    │  │                        │
// │  │  └─────────────────┘  └─────────────────┘  │                        │
// │  └─────────────────────────────────────────────┘                        │
// │                                                                         │
// │  ┌───────────────── AZ-2 ──────────────────┐                           │
// │  │  ┌─ Public Subnet ─┐  ┌─ Private Subnet─┐  │                        │
// │  │  │  ALB            │  │  ECS Services   │  │                        │
// │  │  │  NAT Gateway    │  │  RDS Replica    │  │                        │
// │  │  └─────────────────┘  └─────────────────┘  │                        │
// │  └─────────────────────────────────────────────┘                        │
// │                                                                         │
// └─────────────────────────────────────────────────────────────────────────┘

// Diagram Constraints:
// - Maximum width: 120 characters per line — never exceed this
// - Maximum height: 60 lines
// - Never create borders wider than the content requires
// - Never generate empty rectangles — every box must contain labeled AWS resources
// - Prefer horizontal layouts over vertical stacking
// - Show directional data flow using arrows (▼ ► ◄ ▲)
// - Label every component clearly with its AWS service name
// - Show Security Groups, Internet Gateway, NAT Gateway where applicable
// - Reflect the EXACT services described by the user — never substitute alternatives
// - Do not invent components unless required for production readiness
// \`\`\`

// ASSUMPTIONS:
// - [List any components or configurations assumed for production readiness]
// - [If no assumptions were made, write: None]

// ARCHITECTURE_ANALYSIS:
// [2–4 paragraph assessment covering architecture quality, service interactions, data flow, availability posture, scalability, and suitability for the workload.]

// SINGLE_POINTS_OF_FAILURE:
// - [Component] — [Why it is a SPOF and impact of failure]
// - [Repeat for every SPOF found]

// RECOMMENDATIONS:
// 1. [Priority: Critical / High / Medium] [Specific actionable AWS recommendation]
// 2. [Repeat]
// 3. [Repeat]

// SCALABILITY_PLAN:
// - [Component] → [Exact AWS scaling strategy]
// - [Repeat for each bottleneck]

// SECURITY_REVIEW:
// - [Finding + AWS-specific remediation]
// - [Repeat]

// COST_OPTIMIZATION:
// - [Optimization + estimated impact]
// - [Repeat]

// OBSERVABILITY:
// - [Gap + monitoring/logging/tracing solution]
// - [Repeat]

// WELL_ARCHITECTED_REVIEW:

// Operational Excellence:
// - [Finding or confirmation]

// Security:
// - [Finding or confirmation]

// Reliability:
// - [Finding or confirmation]

// Performance Efficiency:
// - [Finding or confirmation]

// Cost Optimization:
// - [Finding or confirmation]

// Workload-Specific Analysis Rules:

// Food Delivery:
// - Peak meal traffic
// - Delivery latency
// - Notification throughput

// E-Commerce:
// - Checkout reliability
// - Payment bottlenecks
// - Black Friday scaling

// AI Platforms:
// - Model inference latency
// - GPU utilization
// - Vector search scalability

// Incident Management:
// - MTTR reduction
// - RCA automation
// - Alert correlation

// Rules:
// - ALWAYS begin with REFERENCE_ARCHITECTURE.
// - First output the structure tree, then the box-drawing diagram — both inside the single code block.
// - The ASCII diagram MUST follow the template layout above.
// - Maximum diagram width: 120 characters. Maximum height: 60 lines.
// - Never create a border line longer than 120 characters.
// - Never generate empty boxes — every box must contain labeled AWS resources.
// - If the user provides AWS services, NEVER replace them with alternative services.
// - Do not invent components unless required for production readiness. List all assumptions under ASSUMPTIONS.
// - Prefer horizontal layouts. Show Region, AZs, Subnets, Security Groups, NAT Gateways, Internet Gateway, and data flow.
// - Use real AWS services, configurations, instance types, and best practices.
// - Prioritize high availability, security, scalability, and operational excellence.
// - No filler text. Every line must add value.
// `;


const SYSTEM = `
You are a Principal AWS Solutions Architect and AWS Well-Architected Framework expert.

Return the response in EXACTLY this format:

REFERENCE_ARCHITECTURE:
\`\`\`
Generate ONE architecture diagram.

IMPORTANT:
If the architecture is large, summarize components inside AZs.
Never create diagrams wider than 120 characters.
Never create diagrams taller than 20 lines.

Requirements:
- Show Region, AZs, Public and Private Subnets
- Show Internet Gateway, NAT Gateway, Security Groups when applicable
- Show compute layer and data layer
- Show major traffic flow arrows
- Maximum 20 lines
- Maximum 120 characters per line
- Prefer horizontal layouts
- Do not generate empty boxes
- Do not repeat components unless deployed across multiple AZs

\`\`\`

ASSUMPTIONS:
- List assumptions made for production readiness.
- If none, write "None".

ARCHITECTURE_ANALYSIS:
- Maximum 5 Findings
- One sentence per finding

SINGLE_POINTS_OF_FAILURE:
- Identify at least 3 realistic SPOFs, operational risks, or failure domains.
- Include deployment, database, networking, and regional risks when applicable.
- Never return "None identified".

RECOMMENDATIONS:
1. Priority + recommendation
2. Priority + recommendation
3. Priority + recommendation

SCALABILITY_PLAN:
- Component → scaling strategy

SECURITY_REVIEW:
- Maximum 5 findings

COST_OPTIMIZATION:
- Maximum 5 findings

OBSERVABILITY:
- Maximum 5 findings

WELL_ARCHITECTED_REVIEW:

Operational Excellence:
- Finding

Security:
- Finding

Reliability:
- Finding

Performance Efficiency:
- Finding

Cost Optimization:
- Finding

Rules:
- Always start with REFERENCE_ARCHITECTURE.
- Keep the diagram concise.
- Prioritize analysis quality over diagram size.
- Use AWS best practices.
- Be workload-specific where applicable.
- No filler text.
- Keep the total response under 1500 words.
Do not repeat the same component in multiple locations unless it is truly deployed in multiple AZs.

Avoid empty AZs and empty subnets.

Keep the architecture diagram compact and information-dense.

`;

const EXAMPLES = [
  {
    label: 'Microservices stack',
    value: `Services:
- payment-svc: Node.js on ECS Fargate, RDS Postgres (single AZ), ElastiCache Redis
- auth-svc: Node.js on ECS Fargate, JWT RS256
- checkout-api: Node.js on ECS Fargate, talks to payment-svc
- notification-svc: Node.js, SES for email

Infrastructure:
- ALB in front of all services
- Single VPC, 2 subnets (both public)
- No CDN
- CloudWatch for logs, no tracing
- GitHub Actions CI/CD to ECR + ECS

Question: What are the weaknesses and how should I improve this architecture?`,
  },
  {
    label: 'Scale to 10x traffic',
    value: `Current setup handles ~1000 req/min across all services.
We expect Black Friday to bring 10x traffic (10,000 req/min).
Payment service is the bottleneck — currently 3 ECS tasks, RDS db.t3.medium.
How should I prepare the infrastructure for 10x load?`,
  },
  {
    label: 'Incident Copilot',
    value: `Application:
AI Operations Copilot

Modules:
- Evidence Correlation
- RCA
- Runbook Generation
- Recovery Actions
- Postmortem Generation
- Log Analysis

Frontend: React + Vite
Backend: FastAPI
AI: Claude Sonnet

Infrastructure:
AWS ECS Fargate, CloudWatch, RDS PostgreSQL, OpenSearch, S3

Question:
Review this architecture. Identify SPOFs. Recommend improvements for scalability, security, observability and cost. Provide an architecture diagram.`,
  },
  {
    label: 'Event-driven',
    value: `Frontend:
React

API:
API Gateway

Services:
Order Service
Inventory Service
Payment Service

Messaging:
SNS
SQS

Database:
Aurora PostgreSQL

Question:
Review architecture and identify scaling bottlenecks.`,
  },
  {
    label: 'Multi-region DR',
    value: `Users worldwide

CloudFront
Route53 Latency Routing

Primary Region:
us-east-1

Secondary Region:
us-west-2

Aurora Global Database

Question:
Review disaster recovery posture.`,
  },
];

const CACHE_PREFIX = 'architecture-help-';
const CACHE_TTL    = 15 * 60 * 1000;

// ── Guards ────────────────────────────────────────────────────────────────────

function removeArchitectureScore(text) {
  return text.replace(/ARCHITECTURE_SCORE:\s*\d+\s*/i, '');
}

/**
 * Detect pathological diagrams — a run of 300+ identical box-drawing
 * characters is a strong signal that the model produced a runaway border line.
 */
// function isBrokenDiagram(text) {
//   return /─{300,}/.test(text);
// }

// function isBrokenDiagram(text) {
//   const lines = text.split('\n');

//   return lines.some(line =>
//     line.length > 500
//   );
// }

// ── Renderer ──────────────────────────────────────────────────────────────────

function RenderResponse({ text }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.85, color: 'var(--text-primary)' }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre
              key={i}
              style={{
                background:  '#0f172a',
                color:       '#e2e8f0',
                borderRadius: 8,
                padding:     '12px 16px',
                fontFamily:  'ui-monospace, "Cascadia Code", "Fira Code", monospace',
                fontSize:    '11.5px',
                lineHeight:  1.65,
                // overflow:    'auto',
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: '700px',
                margin:      '8px 0 12px',
                border:      '1px solid #1e293b',
                whiteSpace:  'pre',
              }}
            >
              {code}
            </pre>
          );
        }

        const lines = part.split('\n');
        return (
  <span key={i}>
    {lines.map((line, j) => {
      const isHeader = /^[A-Z][A-Za-z_\s]+:$/.test(line.trim());

      if (isHeader) {
        return (
          <div
            key={j}
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '8px 12px',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.08em',
              color:
                line.includes('SINGLE_POINTS_OF_FAILURE')
                  ? '#dc2626'
                  : line.includes('SECURITY_REVIEW')
                  ? '#ea580c'
                  : line.includes('COST_OPTIMIZATION')
                  ? '#16a34a'
                  : line.includes('RECOMMENDATIONS')
                  ? '#2563eb'
                  : '#1d4ed8',
              textTransform: 'uppercase',
              marginTop: 14,
              marginBottom: 8
            }}
          >
            {line.replace(/_/g, ' ')}
          </div>
        );
      }

      const lowerLine = line.toLowerCase();

      const isCritical =
        lowerLine.includes('single az') ||
        lowerLine.includes('outage') ||
        lowerLine.includes('downtime') ||
        lowerLine.includes('data loss') ||
        lowerLine.includes('single point of failure');

      const isHigh =
        lowerLine.includes('security') ||
        lowerLine.includes('public subnet') ||
        lowerLine.includes('vulnerable') ||
        lowerLine.includes('risk');

      return (
        <div
          key={j}
          style={{
            whiteSpace: 'pre-wrap',
            display: 'block',
            marginBottom: 4
          }}
        >
          {isCritical && (
            <span
              style={{
                display: 'inline-block',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 600,
                marginRight: 8
              }}
            >
              CRITICAL
            </span>
          )}

          {!isCritical && isHigh && (
            <span
              style={{
                display: 'inline-block',
                background: '#ffedd5',
                color: '#c2410c',
                border: '1px solid #fdba74',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 600,
                marginRight: 8
              }}
            >
              HIGH
            </span>
          )}

          <span>{line}</span>
        </div>
      );
    })}
  </span>
);
      })}
    </div>
  );
}


// ── Component ─────────────────────────────────────────────────────────────────

export default function ArchitectureHelp({
  initialInput
}) {
  const [input, setInput] =
  useState(initialInput || EXAMPLES[0].value);
  const [response,      setResponse]      = useState('');
  const [healthScore, setHealthScore] = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const [copied,        setCopied]        = useState(false);
  useEffect(() => {
  if (initialInput) {
    setInput(initialInput);
  }
}, [initialInput]);
  // Purge expired cache entries on mount
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          // const item = JSON.parse(localStorage.getItem(key));
          // if (Date.now() - item.timestamp > CACHE_TTL) {
          //   localStorage.removeItem(key);
          // }
          const raw = localStorage.getItem(key);
if (!raw) return;

const item = JSON.parse(raw);

if (
  item?.timestamp &&
  Date.now() - item.timestamp > CACHE_TTL
) {
  localStorage.removeItem(key);
}
        }
      });
    } catch (err) {
      console.error('Cache cleanup failed:', err);
    }
  }, []);

  function calculateScore(text) {
  let score = 100;

  const critical =
    (text.match(/single az/gi) || []).length +
    (text.match(/public subnet/gi) || []).length;

  const high =
    (text.match(/security/gi) || []).length;

  score -= critical * 8;
  score -= high * 2;

  return Math.max(score, 40);
}

  async function run() {
    if (!input.trim() || loading) return;
    setResponse('');
    setLoading(true);
    setCopied(false);

    const cacheKey = CACHE_PREFIX + encodeURIComponent(input.trim());

    // ── Cache read ────────────────────────────────────────────────────────────
    try {
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);

    if (!parsed?.result || !parsed?.timestamp) {
  localStorage.removeItem(cacheKey);
} else if (Date.now() - parsed.timestamp < CACHE_TTL) {
  await new Promise(r => setTimeout(r, 120));

  // setResponse(removeArchitectureScore(parsed.result));
  // setLoading(false);
  // return;
  const clean = removeArchitectureScore(parsed.result);

setResponse(clean);
setHealthScore(calculateScore(clean));

setLoading(false);
return;
}
  }
} catch (err) {
  console.error('Cache read failed:', err);
}

    // ── Stream ────────────────────────────────────────────────────────────────
    // Throttle rerenders to at most once every 100ms during streaming
    let lastUpdate = 0;

    try {
      await callClaudeStream({
        system:    SYSTEM,
        messages:  [{ role: 'user', content: input.trim() }],
        temperature: 0.2,
        maxTokens: 4500,
        onChunk: (_, fullText) => {
          const now = Date.now();
          if (now - lastUpdate > 100) {
            setResponse(removeArchitectureScore(fullText));
            lastUpdate = now;
          }
        },
        onDone: (full) => {
          // Validate before displaying or caching
          // if (isBrokenDiagram(full)) {
          //   setResponse(
          //     'Architecture diagram generation failed — the model produced an oversized border line.\n\nPlease try again. If the problem persists, simplify your architecture description.',
          //   );
          //   setLoading(false);
          //   return;
          // }
          // if (isBrokenDiagram(full)) {
          //   console.warn('Large diagram detected');
          // }

          const clean = removeArchitectureScore(full);
          setHealthScore(calculateScore(clean));
          // Final update — always apply so the last streamed chunk isn't dropped
          setResponse(clean);

          try {
            localStorage.setItem(cacheKey, JSON.stringify({ result: full, timestamp: Date.now() }));
          } catch (err) {
            console.error('Cache write failed:', err);
          }
          setLoading(false);
        },
      });
    } catch (error) {
      console.error(error);
      setResponse(
        `Failed to analyze architecture.\n\nPossible causes:\n- Claude API unavailable\n- Network issue\n- Invalid API key\n\nDetails:\n${error?.message || 'Unknown error'}`,
      );
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Example buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => {
              setInput(ex.value);
              setResponse('');
              setLoading(false);
              setCopied(false);
              setActiveExample(i);
            }}
            style={{
              background:   activeExample === i ? '#eff6ff' : 'var(--content-bg)',
              border:       `1px solid ${activeExample === i ? '#bfdbfe' : 'var(--content-border)'}`,
              color:        activeExample === i ? '#2563eb' : 'var(--text-secondary)',
              borderRadius: 6,
              padding:      '4px 12px',
              fontSize:     12,
              cursor:       'pointer',
              fontFamily:   'var(--font-body)',
              fontWeight:   activeExample === i ? 600 : 400,
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <Card style={{ marginBottom: 14 }}>
        <SectionLabel>Describe your architecture or ask a question</SectionLabel>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          placeholder="Describe your services, infrastructure, and what you want to improve…"
        />
        <div style={{ marginTop: 12 }}>
          <Button
            variant="primary"
            onClick={run}
            disabled={loading}
            icon={loading ? <Spinner size={14} color="#fff" /> : null}
          >
            {loading ? 'Analyzing…' : '🏛 Analyze Architecture'}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {(response || loading) && (
        <Card className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Architecture Review</SectionLabel>
            {loading  && <Spinner size={13} />}
            {!loading && <Badge variant="blue">Complete</Badge>}
            {!loading && response && (
              <button
                onClick={handleCopy}
                style={{
                  marginLeft:   'auto',
                  fontSize:     12,
                  color:        copied ? '#10b981' : 'var(--accent-blue)',
                  background:   'none',
                  border:       '1px solid var(--content-border)',
                  borderRadius: 6,
                  padding:      '3px 10px',
                  cursor:       'pointer',
                  fontFamily:   'var(--font-body)',
                  transition:   'color 0.15s',
                }}
              >
                {copied ? '✓ Copied' : '⎘ Copy Report'}
                <button
  onClick={() => {
    const blob = new Blob(
      [response],
      { type: 'text/plain' }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;
    a.download =
      'architecture-review.txt';

    a.click();

    URL.revokeObjectURL(url);
  }}
  style={{
    marginLeft: 8,
    fontSize: 12,
    border: '1px solid var(--content-border)',
    borderRadius: 6,
    padding: '3px 10px',
    cursor: 'pointer'
  }}
>
  ⬇ Export
</button>
              </button>
            )}
          </div>

          {loading && !response ? (
  <div
    style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      color: 'var(--text-muted)',
      fontSize: 13
    }}
  >
    <Spinner />
    Analyzing architecture…
  </div>
) : (
  <>
    {/* {healthScore && (
      <Card style={{ marginBottom: 16 }}>
        <h3>Architecture Health Score</h3>

        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color:
              healthScore > 80
                ? '#10b981'
                : healthScore > 60
                ? '#f59e0b'
                : '#ef4444'
          }}
        >
          {healthScore}/100
        </div>
      </Card>
    )} */}

    <RenderResponse text={response} />
    
  </>
)}
        </Card>
      )}
    </div>
  );
}