// // Sidebar.jsx
// import React from 'react';

// const NAV = [
//   { id: 'dashboard',  label: 'Dashboard',         icon: '⬡', desc: 'Overview' },
//   { id: 'setup',      label: 'Setup Assistant',    icon: '⚡', desc: 'Local env' },
//   { id: 'drift',      label: 'Doc Drift',          icon: '⟳', desc: 'Doc vs code' },
//   { id: 'logs',       label: 'Log Analyzer',       icon: '◉', desc: 'NL queries' },
//   { id: 'incident',   label: 'Incident AI',        icon: '⚠', desc: 'Root cause' },
// ];

// export default function Sidebar({ active, onNav }) {
//   return (
//     <aside style={{
//       width: 220,
//       minWidth: 220,
//       background: '#0a0e1a',
//       borderRight: '1px solid #111827',
//       display: 'flex',
//       flexDirection: 'column',
//       height: '100vh',
//       position: 'fixed',
//       left: 0,
//       top: 0,
//       zIndex: 100,
//     }}>
//       {/* Brand */}
//       <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid #111827' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 32, height: 32, borderRadius: 8,
//             background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 15, color: '#fff', fontWeight: 700,
//             fontFamily: 'var(--font-display)', flexShrink: 0,
//           }}>O</div>
//           <div>
//             <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>OpsCopilot</div>
//             <div style={{ color: '#374151', fontSize: '10px', marginTop: 1 }}>AI · Observability · DevOps</div>
//           </div>
//         </div>
//       </div>

//       {/* Environment badge */}
//       <div style={{ padding: '10px 20px', borderBottom: '1px solid #111827' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease infinite' }} />
//           <span style={{ fontSize: '10px', color: '#374151', fontFamily: 'var(--font-mono)' }}>ap-south-1 · production</span>
//         </div>
//       </div>

//       {/* Nav label */}
//       <div style={{ padding: '14px 20px 6px', fontSize: '9px', color: '#1f2937', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
//         Navigation
//       </div>

//       {/* Nav items */}
//       <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
//         {NAV.map(item => {
//           const isActive = active === item.id;
//           return (
//             <button
//               key={item.id}
//               onClick={() => onNav(item.id)}
//               style={{
//                 width: '100%', display: 'flex', alignItems: 'center', gap: 10,
//                 padding: '9px 12px', borderRadius: 8, marginBottom: 2,
//                 background: isActive ? '#1d3461' : 'transparent',
//                 border: isActive ? '1px solid #1e3a5f' : '1px solid transparent',
//                 color: isActive ? '#93c5fd' : '#4b5563',
//                 cursor: 'pointer', transition: 'all 0.15s',
//                 fontFamily: 'var(--font-body)',
//                 textAlign: 'left',
//               }}
//               onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#111827'; e.currentTarget.style.color = '#9ca3af'; } }}
//               onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}
//             >
//               <span style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ fontSize: '12.5px', fontWeight: isActive ? 500 : 400, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
//                 <div style={{ fontSize: '10px', color: isActive ? '#4b7bb5' : '#1f2937', marginTop: 1 }}>{item.desc}</div>
//               </div>
//               {isActive && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
//             </button>
//           );
//         })}
//       </nav>

//       {/* Footer */}
//       <div style={{ padding: '14px 20px', borderTop: '1px solid #111827' }}>
//         <div style={{ fontSize: '10px', color: '#1f2937', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>claude-sonnet-4-20250514</div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//           <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
//           <span style={{ fontSize: '10px', color: '#374151' }}>AI engine active</span>
//         </div>
//       </div>
//     </aside>
//   );
// }













// import React from 'react';

// const NAV_GROUPS = [
//   {
//     label: 'V1 — Core',
//     items: [
//       { id: 'dashboard', label: 'Dashboard',        icon: '⬡', desc: 'Overview' },
//       { id: 'setup',     label: 'Setup Assistant',  icon: '⚡', desc: 'Local env' },
//       { id: 'drift',     label: 'Doc Drift',        icon: '⟳', desc: 'Doc vs code' },
//       { id: 'logs',      label: 'Log Analyzer',     icon: '◉', desc: 'NL queries' },
//       { id: 'incident',  label: 'Incident AI',      icon: '⚠', desc: 'Root cause' },
//     ]
//   },
//   {
//     label: 'V2 — Intelligence',
//     items: [
//       { id: 'deployrisk',  label: 'Deploy Risk',      icon: '🛡', desc: 'PR risk score' },
//       { id: 'runbook',     label: 'Runbook Generator',icon: '📖', desc: 'Ops playbooks' },
//       { id: 'postmortem',  label: 'Postmortem AI',    icon: '📝', desc: 'Incident reports' },
//     ]
//   },
// ];

// export default function Sidebar({ active, onNav }) {
//   return (
//     <aside style={{
//       width: 220, minWidth: 220, background: '#0a0e1a',
//       borderRight: '1px solid #111827', display: 'flex',
//       flexDirection: 'column', height: '100vh',
//       position: 'fixed', left: 0, top: 0, zIndex: 100,
//     }}>
//       {/* Brand */}
//       <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid #111827' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 32, height: 32, borderRadius: 8,
//             background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 15, color: '#fff', fontWeight: 700,
//             fontFamily: 'var(--font-display)', flexShrink: 0,
//           }}>O</div>
//           <div>
//             <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>OpsCopilot</div>
//             <div style={{ color: '#374151', fontSize: '10px', marginTop: 1 }}>AI · Observability · DevOps</div>
//           </div>
//         </div>
//       </div>

//       {/* Env badge */}
//       <div style={{ padding: '10px 20px', borderBottom: '1px solid #111827' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
//           <span style={{ fontSize: '10px', color: '#374151', fontFamily: 'var(--font-mono)' }}>ap-south-1 · production</span>
//         </div>
//       </div>

//       {/* Nav groups */}
//       <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
//         {NAV_GROUPS.map(group => (
//           <div key={group.label}>
//             <div style={{ fontSize: '9px', color: '#1f2937', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 600, padding: '10px 8px 5px' }}>
//               {group.label}
//             </div>
//             {group.items.map(item => {
//               const isActive = active === item.id;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => onNav(item.id)}
//                   style={{
//                     width: '100%', display: 'flex', alignItems: 'center', gap: 10,
//                     padding: '8px 10px', borderRadius: 8, marginBottom: 2,
//                     background: isActive ? '#1d3461' : 'transparent',
//                     border: isActive ? '1px solid #1e3a5f' : '1px solid transparent',
//                     color: isActive ? '#93c5fd' : '#4b5563',
//                     cursor: 'pointer', transition: 'all 0.15s',
//                     fontFamily: 'var(--font-body)', textAlign: 'left',
//                   }}
//                   onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#111827'; e.currentTarget.style.color = '#9ca3af'; } }}
//                   onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}
//                 >
//                   <span style={{ fontSize: 12, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ fontSize: '12px', fontWeight: isActive ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
//                     <div style={{ fontSize: '10px', color: isActive ? '#4b7bb5' : '#1f2937', marginTop: 1 }}>{item.desc}</div>
//                   </div>
//                   {isActive && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
//                 </button>
//               );
//             })}
//           </div>
//         ))}
//       </nav>

//       {/* Footer */}
//       <div style={{ padding: '14px 20px', borderTop: '1px solid #111827' }}>
//         <div style={{ fontSize: '10px', color: '#1f2937', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>gemini-2.5-flash</div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//           <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
//           <span style={{ fontSize: '10px', color: '#374151' }}>AI engine active</span>
//         </div>
//       </div>
//     </aside>
//   );
// }











import React from 'react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',                   icon: '⬡', desc: 'Health · Incidents · AI' },
  { id: 'platform',  label: 'Platform Assistant',          icon: '⚡', desc: 'Setup · Infra · Config' },
  { id: 'docs',      label: 'Documentation Intelligence',  icon: '⟳', desc: 'Drift · Missing · Validate' },
  { id: 'logs',      label: 'Log Explorer',                icon: '◉', desc: 'Search · CloudWatch · Filter' },
  { id: 'incident',  label: 'Incident Copilot',            icon: '⚠', desc: 'RCA · Runbook · Postmortem' },
];

export default function Sidebar({ active, onNav }) {
  return (
    <aside style={{
      width: 230, minWidth: 230, background: '#0a0e1a',
      borderRight: '1px solid #0f1629', display: 'flex',
      flexDirection: 'column', height: '100vh',
      position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #0f1629' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', flexShrink: 0 }}>O</div>
          <div>
            <div style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>OpsCopilot</div>
            <div style={{ color: '#1f2937', fontSize: '10px', marginTop: 3, letterSpacing: '0.04em' }}>ENTERPRISE SRE PLATFORM</div>
          </div>
        </div>
      </div>

      {/* Environment */}
      <div style={{ padding: '8px 18px', borderBottom: '1px solid #0f1629' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse-dot 2s ease infinite' }} />
          <span style={{ fontSize: '10px', color: '#374151', fontFamily: 'var(--font-mono)' }}>ap-south-1 · production</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ fontSize: '9px', color: '#1f2937', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, padding: '0 8px 8px', fontFamily: 'var(--font-display)' }}>Modules</div>
        {NAV.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 9, marginBottom: 3,
              background: isActive ? 'linear-gradient(135deg, #1d3461 0%, #1e2d4a 100%)' : 'transparent',
              border: isActive ? '1px solid #1e3a5f' : '1px solid transparent',
              color: isActive ? '#93c5fd' : '#4b5563',
              cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'var(--font-body)', textAlign: 'left',
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#111827'; e.currentTarget.style.color = '#9ca3af'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0, opacity: isActive ? 1 : 0.55 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: isActive ? 600 : 400, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                <div style={{ fontSize: '10px', color: isActive ? '#3b6ea5' : '#1f2937', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
              </div>
              {isActive && <div style={{ width: 3, height: 20, borderRadius: 2, background: '#3b82f6', flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid #0f1629' }}>
        <div style={{ fontSize: '10px', color: '#1f2937', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>gemini-2.5-flash · v2.0.0</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '10px', color: '#374151' }}>AI engine active</span>
        </div>
      </div>
    </aside>
  );
}
