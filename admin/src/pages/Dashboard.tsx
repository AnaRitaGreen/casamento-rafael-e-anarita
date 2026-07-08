import { useState } from 'react';

import { OverviewTab } from '../components/tabs/OverviewTab';
import { GuestsTab } from '../components/tabs/GuestsTab';
import { MessagesTab } from '../components/tabs/MessagesTab';
import { ExportTab } from '../components/tabs/ExportTab';
import { PresentesTab } from '../components/tabs/PresentesTab';
import { Sidebar } from '../components/Sidebar';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div id="dashboard-app" style={{ display: 'flex', minHeight: '100vh', background: 'var(--creme)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'guests' && <GuestsTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'presentes' && <PresentesTab />}
      </main>
    </div>
  );
}
