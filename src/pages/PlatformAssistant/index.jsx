import React from 'react';
import SubTabLayout from '../../components/SubTabLayout.jsx';
import ServiceSetup      from './ServiceSetup.jsx';
import InfraSetup        from './InfraSetup.jsx';
import ConfigGenerator   from './ConfigGenerator.jsx';
import ArchitectureHelp  from './ArchitectureHelp.jsx';
import { PageHeader } from '../../components/UI.jsx';

// const TABS = [
//   { id: 'service',  label: 'Service Setup',      icon: '⚡', component: <ServiceSetup /> },
//   { id: 'infra',    label: 'Infra Setup',         icon: '🏗', component: <InfraSetup /> },
//   { id: 'config',   label: 'Config Generator',    icon: '⚙', component: <ConfigGenerator /> },
//   { id: 'arch',     label: 'Architecture Help',   icon: '🏛', component: <ArchitectureHelp /> },
// ];

export default function PlatformModule({
  defaultPlatformTab = 'service',
  architectureInput
}) {

  const TABS = [
    {
      id: 'service',
      label: 'Service Setup',
      icon: '⚡',
      component: <ServiceSetup />
    },
    {
      id: 'infra',
      label: 'Infra Setup',
      icon: '🏗',
      component: <InfraSetup />
    },
    {
      id: 'config',
      label: 'Config Generator',
      icon: '⚙',
      component: <ConfigGenerator />
    },
    {
      id: 'arch',
      label: 'Architecture Help',
      icon: '🏛',
      component: (
  <ArchitectureHelp
    initialInput={architectureInput}
  />
)
    }
  ];
  return (
    <div className="fade-in">
      <PageHeader
        title="Platform Assistant"
        subtitle="Build, configure, and onboard services — AI-powered setup and architecture guidance."
      />

      <SubTabLayout
        tabs={TABS}
        defaultTab={defaultPlatformTab}
      />
    </div>
  );
}