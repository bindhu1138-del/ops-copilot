// import React, { useState } from 'react';
// import Sidebar from './components/Sidebar.jsx';
// import DashboardPage from './pages/DashboardPage.jsx';
// import SetupPage from './pages/SetupPage.jsx';
// import DriftPage from './pages/DriftPage.jsx';
// import LogsPage from './pages/LogsPage.jsx';
// import IncidentPage from './pages/IncidentPage.jsx';

// const PAGES = {
//   dashboard: DashboardPage,
//   setup:     SetupPage,
//   drift:     DriftPage,
//   logs:      LogsPage,
//   incident:  IncidentPage,
// };

// export default function App() {
//   const [active, setActive] = useState('dashboard');
//   const Page = PAGES[active] || DashboardPage;

//   // Check for API key
//   // const hasKey = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
//   const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
//       <Sidebar active={active} onNav={setActive} />

//       <main style={{
//         marginLeft: 220,
//         flex: 1,
//         height: '100vh',
//         overflowY: 'auto',
//         background: 'var(--content-bg)',
//       }}>
//         {!hasKey && (
//           <div style={{
//             background: '#fffbeb', borderBottom: '1px solid #fde68a',
//             padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 10,
//           }}>
//             <span style={{ fontSize: 14 }}>⚠</span>
//             <span style={{ fontSize: 12, color: '#92400e' }}>
//               <strong>VITE_ANTHROPIC_API_KEY</strong> not set. Create a <code>.env</code> file with your key — see README.md for instructions.
//             </span>
//           </div>
//         )}

//         <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
//           <Page key={active} />
//         </div>
//       </main>
//     </div>
//   );
// }















// import React, { useState } from 'react';
// import Sidebar from './components/Sidebar.jsx';
// import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
// import SetupPage from './pages/PlatformAssistant/SetupPage.jsx';
// import DriftPage from './pages/DocumentationIntelligence/DocDrift.jsx';
// import LogsPage from './pages/LogExplorer/SearchLogs.jsx';
// import IncidentPage from './pages/IncidentPage.jsx';
// import DeployRiskPage from './pages/DeployRiskPage.jsx';
// import RunbookPage from './pages/IncidentCopilot/RunbookGeneration.jsx';
// import PostmortemPage from './pages/PostmortemPage.jsx';

// const PAGES = {
//   dashboard:  DashboardPage,
//   setup:      SetupPage,
//   drift:      DriftPage,
//   logs:       LogsPage,
//   incident:   IncidentPage,
//   deployrisk: DeployRiskPage,
//   runbook:    RunbookPage,
//   postmortem: PostmortemPage,
// };

// export default function App() {
//   const [active, setActive] = useState('dashboard');
//   const Page = PAGES[active] || DashboardPage;
//   const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

//   return (
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
//       <Sidebar active={active} onNav={setActive} />
//       <main style={{ marginLeft: 220, flex: 1, height: '100vh', overflowY: 'auto', background: 'var(--content-bg)' }}>
//         {!hasKey && (
//           <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
//             <span style={{ fontSize: 14 }}>⚠</span>
//             <span style={{ fontSize: 12, color: '#92400e' }}>
//               <strong>VITE_GEMINI_API_KEY</strong> not set. Create a <code>.env</code> file — see README.md.
//             </span>
//           </div>
//         )}
//         <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
//           <Page key={active} />
//         </div>
//       </main>
//     </div>
//   );
// }














// // App.jsx
// import React, { useState } from 'react';
// import Sidebar         from './components/Sidebar.jsx';
// import DashboardModule from './pages/Dashboard/index.jsx';
// import PlatformModule  from './pages/PlatformAssistant/index.jsx';
// import DocsModule      from './pages/DocumentationIntelligence/index.jsx';
// import LogsModule      from './pages/LogExplorer/index.jsx';
// import IncidentModule  from './pages/IncidentCopilot/index.jsx';
// import { IncidentProvider } from './pages/IncidentCopilot/IncidentContext.jsx';

// const MODULES = {
//   dashboard: DashboardModule,
//   platform:  PlatformModule,
//   docs:      DocsModule,
//   logs:      LogsModule,
//   incident:  IncidentModule,
// };

// export default function App() {
//   const [active, setActive] = useState('dashboard');
//   const [selectedIncident, setSelectedIncident] = useState(null);
//   const [platformTab, setPlatformTab] =
//   useState('service');
//   const [architectureInput, setArchitectureInput] =
//   useState('');
//   const Module = MODULES[active] || DashboardModule;
//   const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

//   return (
//   <IncidentProvider>
//     <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
//       <Sidebar active={active} onNav={setActive} />
//       <main style={{ marginLeft: 230, flex: 1, height: '100vh', overflowY: 'auto', background: 'var(--content-bg)' }}>
//         {!hasKey && (
//           <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '9px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
//             <span style={{ fontSize: 14 }}>⚠</span>
//             <span style={{ fontSize: 12, color: '#92400e' }}>
//               <strong>VITE_GEMINI_API_KEY</strong> not set in <code>.env</code> — AI features will not work. See README.md.
//             </span>
//           </div>
//         )}
//         <div style={{ padding: '28px 32px', maxWidth: 1120, margin: '0 auto' }}>
//           <Module
//   key={active}
//   active={active}
//   setActive={setActive}
//   selectedIncident={selectedIncident}
//   setSelectedIncident={setSelectedIncident}
//   defaultPlatformTab={platformTab}
//   setPlatformTab={setPlatformTab}
//   architectureInput={architectureInput}
//   setArchitectureInput={setArchitectureInput}
// />
//                 </div>
//       </main>
//     </div>
//   </IncidentProvider>
//   );
// }













import React, { useState } from 'react';
import Sidebar         from './components/Sidebar.jsx';
import DashboardModule from './pages/Dashboard/index.jsx';
import PlatformModule  from './pages/PlatformAssistant/index.jsx';
import DocsModule      from './pages/DocumentationIntelligence/index.jsx';
import LogsModule      from './pages/LogExplorer/index.jsx';
import IncidentModule  from './pages/IncidentCopilot/index.jsx';
import { IncidentProvider } from './pages/IncidentCopilot/IncidentContext.jsx';

const MODULES = {
  dashboard: DashboardModule,
  platform:  PlatformModule,
  docs:      DocsModule,
  logs:      LogsModule,
  incident:  IncidentModule,
};

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [platformTab, setPlatformTab] = useState('service');
  const [architectureInput, setArchitectureInput] = useState('');

  const Module = MODULES[active] || DashboardModule;

  // ✅ CHANGED: was VITE_GEMINI_API_KEY
  const hasKey = Boolean(import.meta.env.VITE_AZURE_OPENAI_KEY);

  return (
    <IncidentProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar active={active} onNav={setActive} />
        <main style={{
          marginLeft: 230, flex: 1, height: '100vh',
          overflowY: 'auto', background: 'var(--content-bg)',
        }}>
          {!hasKey && (
            <div style={{
              background: '#fffbeb', borderBottom: '1px solid #fde68a',
              padding: '9px 28px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 14 }}>⚠</span>
              <span style={{ fontSize: 12, color: '#92400e' }}>
                <strong>VITE_AZURE_OPENAI_KEY</strong> not set in <code>.env</code> — AI features will not work. See README.md.
              </span>
            </div>
          )}
          <div style={{ padding: '28px 32px', maxWidth: 1120, margin: '0 auto' }}>
            <Module
              key={active}
              active={active}
              setActive={setActive}
              selectedIncident={selectedIncident}
              setSelectedIncident={setSelectedIncident}
              defaultPlatformTab={platformTab}
              setPlatformTab={setPlatformTab}
              architectureInput={architectureInput}
              setArchitectureInput={setArchitectureInput}
            />
          </div>
        </main>
      </div>
    </IncidentProvider>
  );
}