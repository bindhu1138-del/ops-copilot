// import React, { useState } from 'react';

// /**
//  * SubTabLayout
//  * Renders a horizontal tab bar inside a module page.
//  * Props:
//  *   tabs: [{ id, label, icon, component: <JSX> }]
//  *   defaultTab: string (id)
//  */
// export default function SubTabLayout({ tabs, defaultTab }) {
//   const [active, setActive] = useState(defaultTab || tabs[0]?.id);
//   const current = tabs.find(t => t.id === active);

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//       {/* Tab bar */}
//       <div style={{
//         display: 'flex', gap: 2, marginBottom: 22,
//         borderBottom: '1px solid var(--content-border)',
//         paddingBottom: 0,
//       }}>
//         {tabs.map(tab => {
//           const isActive = active === tab.id;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActive(tab.id)}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '8px 16px',
//                 background: 'transparent',
//                 border: 'none',
//                 borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
//                 color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
//                 fontFamily: 'var(--font-body)',
//                 fontSize: 13,
//                 fontWeight: isActive ? 600 : 400,
//                 cursor: 'pointer',
//                 marginBottom: -1,
//                 transition: 'all 0.15s',
//                 whiteSpace: 'nowrap',
//               }}
//               onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
//               onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
//             >
//               {tab.icon && <span style={{ fontSize: 13 }}>{tab.icon}</span>}
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* Active tab content */}
//       <div className="fade-in" key={active} style={{ flex: 1 }}>
//         {current?.component}
//       </div>
//     </div>
//   );
// }



















// import React, { useState } from 'react';

// /**
//  * SubTabLayout
//  *
//  * Props:
//  *   tabs: [{
//  *     id: string,
//  *     label: string,
//  *     icon?: string,
//  *     component: JSX.Element  OR  (sharedProps: any) => JSX.Element,
//  *     hasResult?: boolean   -- shows green dot when tab has produced output
//  *   }]
//  *   defaultTab: string
//  *   sharedProps?: object   -- passed to every tab that uses the render-function form
//  */
// export default function SubTabLayout({ tabs, defaultTab, sharedProps = {} }) {
//   const [active, setActive] = useState(defaultTab || tabs[0]?.id);
//   const current = tabs.find(t => t.id === active);

//   // Resolve the component: render-function or plain JSX element
//   const content = typeof current?.component === 'function'
//     ? current.component(sharedProps)
//     : current?.component;

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//       {/* ── Tab bar ── */}
//       <div style={{
//         display: 'flex',
//         gap: 2,
//         marginBottom: 22,
//         borderBottom: '1px solid var(--content-border)',
//       }}>
//         {tabs.map(tab => {
//           const isActive = active === tab.id;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActive(tab.id)}
//               style={{
//                 position: 'relative',
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '8px 16px',
//                 background: 'transparent',
//                 border: 'none',
//                 borderBottom: isActive
//                   ? '2px solid var(--accent-blue)'
//                   : '2px solid transparent',
//                 color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
//                 fontFamily: 'var(--font-body)',
//                 fontSize: 13,
//                 fontWeight: isActive ? 600 : 400,
//                 cursor: 'pointer',
//                 marginBottom: -1,
//                 transition: 'all 0.15s',
//                 whiteSpace: 'nowrap',
//               }}
//               onMouseEnter={e => {
//                 if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
//               }}
//               onMouseLeave={e => {
//                 if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
//               }}
//             >
//               {tab.icon && <span style={{ fontSize: 13 }}>{tab.icon}</span>}
//               {tab.label}
//               {/* Green dot: this tab has produced a result */}
//               {tab.hasResult && (
//                 <span style={{
//                   width: 6, height: 6, borderRadius: '50%',
//                   background: '#10b981',
//                   display: 'inline-block', marginLeft: 2, flexShrink: 0,
//                 }} />
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Active tab content ── */}
//       <div className="fade-in" key={active} style={{ flex: 1 }}>
//         {content}
//       </div>
//     </div>
//   );
// }

















// import React, { useState } from 'react';

// /**
//  * SubTabLayout - working
//  *
//  * Props:
//  * tabs: [{
//  *   id: string,
//  *   label: string,
//  *   icon?: string,
//  *   component: JSX.Element | Function,
//  *   hasResult?: boolean
//  * }]
//  *
//  * defaultTab: string
//  * sharedProps?: object
//  */

// export default function SubTabLayout({
//   tabs = [],
//   defaultTab,
//   sharedProps = {},
// }) {
//   // const [active, setActive] = useState(
//   //   defaultTab || tabs?.[0]?.id
//   // );
//   const [active, setActive] = useState(
//   defaultTab || tabs?.[0]?.id
// );

// React.useEffect(() => {
//   if (defaultTab) {
//     setActive(defaultTab);
//   }
// }, [defaultTab]);

//   const current = tabs.find(
//     (tab) => tab.id === active
//   );

//   const content =
//     typeof current?.component === 'function'
//       ? current.component(sharedProps)
//       : current?.component;

//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//       }}
//     >
//       {/* Tab Bar */}
//       <div
//         style={{
//           display: 'flex',
//           gap: 2,
//           marginBottom: 22,
//           borderBottom:
//             '1px solid var(--content-border)',
//           overflowX: 'auto',
//         }}
//       >
//         {tabs.map((tab) => {
//           const isActive = active === tab.id;

//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActive(tab.id)}
//               style={{
//                 position: 'relative',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 6,
//                 padding: '8px 16px',
//                 background: 'transparent',
//                 border: 'none',
//                 borderBottom: isActive
//                   ? '2px solid var(--accent-blue)'
//                   : '2px solid transparent',
//                 color: isActive
//                   ? 'var(--accent-blue)'
//                   : 'var(--text-secondary)',
//                 fontFamily: 'var(--font-body)',
//                 fontSize: 13,
//                 fontWeight: isActive ? 600 : 400,
//                 cursor: 'pointer',
//                 marginBottom: -1,
//                 transition: 'all 0.15s',
//                 whiteSpace: 'nowrap',
//               }}
//               onMouseEnter={(e) => {
//                 if (!isActive) {
//                   e.currentTarget.style.color =
//                     'var(--text-primary)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isActive) {
//                   e.currentTarget.style.color =
//                     'var(--text-secondary)';
//                 }
//               }}
//             >
//               {tab.icon && (
//                 <span style={{ fontSize: 13 }}>
//                   {tab.icon}
//                 </span>
//               )}

//               {tab.label}

//               {tab.hasResult && (
//                 <span
//                   style={{
//                     width: 6,
//                     height: 6,
//                     borderRadius: '50%',
//                     background: '#10b981',
//                     display: 'inline-block',
//                     marginLeft: 2,
//                     flexShrink: 0,
//                   }}
//                 />
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* Active Tab Content */}
//       <div
//         key={active}
//         className="fade-in"
//         style={{ flex: 1 }}
//       >
//         {content || (
//           <div
//             style={{
//               padding: 20,
//               color: 'var(--text-secondary)',
//             }}
//           >
//             No content available.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }












import React,
{
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';

/**
 * SubTabLayout
 *
 * Props:
 * tabs: [{
 *   id: string,
 *   label: string,
 *   icon?: string,
 *   component: JSX.Element | Function,
 *   hasResult?: boolean
 * }]
 *
 * defaultTab: string
 * sharedProps?: object
 */

const SubTabLayout = forwardRef(({
  tabs = [],
  defaultTab,
  sharedProps = {},
}, ref) => {

  const [active, setActive] = useState(
    defaultTab || tabs?.[0]?.id
  );

  useEffect(() => {
    if (defaultTab) {
      setActive(defaultTab);
    }
  }, [defaultTab]);

  // Expose tab switching to parent components
  useImperativeHandle(ref, () => ({
    setTab: (tabId) => {
      setActive(tabId);
    }
  }));

  const current = tabs.find(
    (tab) => tab.id === active
  );

  const content =
    typeof current?.component === 'function'
      ? current.component(sharedProps)
      : current?.component;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          marginBottom: 22,
          borderBottom:
            '1px solid var(--content-border)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid var(--accent-blue)'
                  : '2px solid transparent',
                color: isActive
                  ? 'var(--accent-blue)'
                  : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color =
                    'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color =
                    'var(--text-secondary)';
                }
              }}
            >
              {tab.icon && (
                <span style={{ fontSize: 13 }}>
                  {tab.icon}
                </span>
              )}

              {tab.label}

              {tab.hasResult && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'inline-block',
                    marginLeft: 2,
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div
        key={active}
        className="fade-in"
        style={{ flex: 1 }}
      >
        {content || (
          <div
            style={{
              padding: 20,
              color: 'var(--text-secondary)',
            }}
          >
            No content available.
          </div>
        )}
      </div>
    </div>
  );
});

export default SubTabLayout;