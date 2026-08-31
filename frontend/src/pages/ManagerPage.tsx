import { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { useTranslation } from 'react-i18next';

const ManagerPage = () => {
  const { t } = useTranslation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="relative z-10 min-h-screen bg-background font-sans">
      <SidebarNav
        variant="manager"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={isSidebarOpen}
        onMobileOpenChange={setIsSidebarOpen}
      />

      <div
        className={`flex min-h-screen flex-col transition-[margin] duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <DashboardHeader
          title={t('manager.dashboard_title')}
          showSearch={false}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
};

export default ManagerPage;
