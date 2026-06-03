// import React from 'react';
// import SubTabLayout from '../../components/SubTabLayout.jsx';
// import SearchLogs  from './SearchLogs.jsx';
// import LogFilters  from './LogFilters.jsx';
// import { PageHeader } from '../../components/UI.jsx';

// const TABS = [
//   { id: 'search',  label: 'Search Logs',         icon: '◉', component: <SearchLogs
//   setActive={setActive}
//   setSelectedIncident={setSelectedIncident}
// /> },
//   { id: 'filters', label: 'Filters & Browser',    icon: '⚙', component: <LogFilters /> },
// ];

// export default function LogsModule({
//   setActive,
//   setSelectedIncident
// }) {
//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Log Explorer"
//         subtitle="Natural language → AI-generated CloudWatch query → log fetch → root cause analysis."
//       />
//       <SubTabLayout tabs={TABS} defaultTab="search" />
//     </div>
//   );
// }















import React from 'react';
import SubTabLayout from '../../components/SubTabLayout.jsx';
import SearchLogs from './SearchLogs.jsx';
import LogFilters from './LogFilters.jsx';
import { PageHeader } from '../../components/UI.jsx';

export default function LogsModule({
  setActive,
  setSelectedIncident
}) {

  const TABS = [
    {
      id: 'search',
      label: 'Search Logs',
      icon: '◉',
      component: (
        <SearchLogs
          setActive={setActive}
          setSelectedIncident={setSelectedIncident}
        />
      )
    },
    {
      id: 'filters',
      label: 'Filters & Browser',
      icon: '⚙',
      component: <LogFilters />
    }
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Log Explorer"
        subtitle="Natural language → AI-generated CloudWatch query → log fetch → root cause analysis."
      />

      <SubTabLayout
        tabs={TABS}
        defaultTab="search"
      />
    </div>
  );
}