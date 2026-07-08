interface SidebarButtonProps {
  tab: {
    id: string;
    icon: string;
    label: string;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SidebarButton({ tab, activeTab, setActiveTab }: SidebarButtonProps) {
  return (
    <button 
      onClick={() => setActiveTab(tab.id)} 
      className={`sidebar-link ${activeTab === tab.id ? 'active-link' : ''}`}
    >
      {tab.icon} - {tab.label}
    </button>
  )
}