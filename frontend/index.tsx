import { useState } from 'react';
import { Coins, Users, Settings } from 'lucide-react';
import { TiersTab } from './admin/TiersTab';
import { UsersTab } from './admin/UsersTab';
import { SettingsTab } from './admin/SettingsTab';

const TABS = [
  { id: 'tiers', label: 'Tiers', Icon: Coins },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'settings', label: 'Settings', Icon: Settings },
] as const;

type TabId = (typeof TABS)[number]['id'];

function getInitialTab(): TabId {
  const hash = window.location.hash.replace('#', '');
  if (TABS.some((t) => t.id === hash)) return hash as TabId;
  return 'tiers';
}

export default function SubscriptionAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ndp-text">Subscriptions</h1>
          <p className="text-xs text-ndp-text-dim">Tiers, user assignments, automatic role changes and notifications.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ' +
              (activeTab === id
                ? 'bg-ndp-accent text-white'
                : 'bg-ndp-surface text-ndp-text-muted hover:bg-ndp-surface-light')
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'tiers' && <TiersTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
