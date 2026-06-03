import React from 'react';
import SubTabLayout  from '../../components/SubTabLayout.jsx';
import DocDrift      from './DocDrift.jsx';
import MissingDocs   from './MissingDocs.jsx';
import ReadmeValidator from './ReadmeValidator.jsx';
import { PageHeader } from '../../components/UI.jsx';

const TABS = [
  { id: 'drift',   label: 'Doc Drift',          icon: '⟳', component: <DocDrift /> },
  { id: 'missing', label: 'Missing Docs',        icon: '🔍', component: <MissingDocs /> },
  { id: 'readme',  label: 'README Validation',   icon: '✓', component: <ReadmeValidator /> },
];

export default function DocsModule() {
  return (
    <div className="fade-in">
      <PageHeader
        title="Documentation Intelligence"
        subtitle="Detect drift, find gaps, and validate documentation quality across your services."
      />
      <SubTabLayout tabs={TABS} defaultTab="drift" />
    </div>
  );
}