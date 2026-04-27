import React, { useState } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { usePharmacy } from '../context/PharmacyContext';
import { useMedicines } from '../hooks/useMedicines';
import { useSales } from '../hooks/useSales';
import { AppSidebar } from './AppSidebar';
import { PageLoadingSpinner } from './LoadingSpinner';
import OverviewSection from './sections/OverviewSection';
import POSSection from './sections/POSSection';
import InventorySection from './sections/InventorySection';
import SalesSection from './sections/SalesSection';
import CustomersSection from './sections/CustomersSection';
import SuppliersSection from './sections/SuppliersSection';
import PrescriptionsSection from './sections/PrescriptionsSection';
import ReturnsSection from './sections/ReturnsSection';
import ReportsSection from './ReportsSection';
import ActivitySection from './sections/ActivitySection';
import NotificationsSection from './sections/NotificationsSection';
import BranchesSection from './sections/BranchesSection';
import SettingsSection from './sections/SettingsSection';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageHeaders: Record<string, { title: string; description: string }> = {
  overview: { title: 'Dashboard', description: 'Overview of your pharmacy' },
  pos: { title: 'Point of Sale', description: 'Create new transactions' },
  inventory: { title: 'Inventory', description: 'Manage medicine stock' },
  sales: { title: 'Sales History', description: 'View past transactions' },
  customers: { title: 'Customers', description: 'Manage customer profiles' },
  suppliers: { title: 'Suppliers', description: 'Manage supplier relationships' },
  prescriptions: { title: 'Prescriptions', description: 'Track prescriptions' },
  returns: { title: 'Returns', description: 'Process returns and refunds' },
  reports: { title: 'Reports', description: 'Analytics and insights' },
  activity: { title: 'Activity Log', description: 'System activity history' },
  notifications: { title: 'Notifications', description: 'Alerts and updates' },
  branches: { title: 'Branches', description: 'Multi-location management' },
  settings: { title: 'Settings', description: 'System configuration' },
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { admin } = usePharmacy();

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const header = pageHeaders[activeTab] || { title: activeTab, description: '' };

  const renderContent = () => {
    if (isTransitioning) return <PageLoadingSpinner />;

    switch (activeTab) {
      case 'overview': return <OverviewSection onNavigate={handleTabChange} />;
      case 'pos': return <POSSection />;
      case 'inventory': return <InventorySection />;
      case 'sales': return <SalesSection />;
      case 'customers': return <CustomersSection />;
      case 'suppliers': return <SuppliersSection />;
      case 'prescriptions': return <PrescriptionsSection />;
      case 'returns': return <ReturnsSection />;
      case 'reports': return <ReportsSection />;
      case 'activity': return <ActivitySection />;
      case 'notifications': return <NotificationsSection />;
      case 'branches': return <BranchesSection />;
      case 'settings': return <SettingsSection />;
      default: return <OverviewSection onNavigate={handleTabChange} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between h-14 px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                <div className="border-l border-border pl-3">
                  <h2 className="text-sm font-semibold text-foreground">{header.title}</h2>
                  <p className="text-[11px] text-muted-foreground">{header.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleTabChange('notifications')}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
