// import React from 'react';
// import SubTabLayout from '../../components/SubTabLayout.jsx';
// import HealthOverview  from './HealthOverview.jsx';
// import ActiveIncidents from './ActiveIncidents.jsx';
// import AIInsights      from './AIInsights.jsx';
// import Deployments     from './Deployments.jsx';
// import { PageHeader, Badge } from '../../components/UI.jsx';

// // const TABS = [
// //   { id: 'health',     label: 'Health Overview',  icon: '⬡', component: <HealthOverview /> },
// //   { id: 'incidents',  label: 'Active Incidents',  icon: '⚠', component: (
// //   <ActiveIncidents
// //     setActive={setActive}
// //     setSelectedIncident={setSelectedIncident}
// //   />
// // ) },
// //   { id: 'insights',   label: 'AI Insights',       icon: '✦', component: <AIInsights /> },
// //   { id: 'deploys',    label: 'Deployments',        icon: '⬆', component: <Deployments /> },
// // ];

// export default function DashboardModule({
//   setActive,
//   setSelectedIncident
// }) {
//   return (
//     <div className="fade-in">
//       <PageHeader
//         title="Dashboard"
//         subtitle="Real-time system health — ap-south-1 production"
//         actions={<Badge variant="red">3 active alerts</Badge>}
//       />
//       <SubTabLayout tabs={TABS} defaultTab="health" />
//     </div>
//   );
// }













import React from 'react';
import SubTabLayout from '../../components/SubTabLayout.jsx';

import HealthOverview from './HealthOverview.jsx';
import ActiveIncidents from './ActiveIncidents.jsx';
import AIInsights from './AIInsights.jsx';
import Deployments from './Deployments.jsx';

import { PageHeader, Badge } from '../../components/UI.jsx';

export default function DashboardModule({
  setActive,
  setSelectedIncident
}) {

  const TABS = [
    {
      id: 'health',
      label: 'Health Overview',
      icon: '⬡',
      component: <HealthOverview />
    },

    {
      id: 'incidents',
      label: 'Active Incidents',
      icon: '⚠',
      component: (
        <ActiveIncidents
          setActive={setActive}
          setSelectedIncident={setSelectedIncident}
        />
      )
    },

    {
      id: 'insights',
      label: 'AI Insights',
      icon: '✦',
      component: <AIInsights />
    },

    {
      id: 'deploys',
      label: 'Deployments',
      icon: '⬆',
      component: <Deployments />
    }
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time system health — ap-south-1 production"
        actions={<Badge variant="red">3 active alerts</Badge>}
      />

      <SubTabLayout
        tabs={TABS}
        defaultTab="health"
      />
    </div>
  );
}