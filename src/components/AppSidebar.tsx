import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Truck,
  FileText,
  Settings,
  LogOut,
  Activity,
  Bell,
  Building2,
  Moon,
  Sun,
  Undo2,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainNav = [
  { title: 'Dashboard', value: 'overview', icon: LayoutDashboard },
  { title: 'Point of Sale', value: 'pos', icon: ShoppingCart },
  { title: 'Inventory', value: 'inventory', icon: Package },
  { title: 'Sales History', value: 'sales', icon: BarChart3 },
];

const managementNav = [
  { title: 'Customers', value: 'customers', icon: Users },
  { title: 'Suppliers', value: 'suppliers', icon: Truck },
  { title: 'Prescriptions', value: 'prescriptions', icon: FileText },
  { title: 'Returns', value: 'returns', icon: Undo2 },
];

const systemNav = [
  { title: 'Reports', value: 'reports', icon: BarChart3 },
  { title: 'Activity Log', value: 'activity', icon: Activity },
  { title: 'Notifications', value: 'notifications', icon: Bell },
  { title: 'Branches', value: 'branches', icon: Building2 },
  { title: 'Settings', value: 'settings', icon: Settings },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { logout, admin, theme, toggleTheme } = usePharmacy();

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-3 mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <SidebarMenuItem key={item.value}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => onTabChange(item.value)}
                  className={`h-9 px-3 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  const initials = admin?.full_name
    ? admin.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : admin?.username?.[0]?.toUpperCase() || 'A';

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">PharmFlow</h1>
            <p className="text-[11px] text-muted-foreground">Pharmacy Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {renderGroup('Main', mainNav)}
        {renderGroup('Management', managementNav)}
        {renderGroup('System', systemNav)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{admin?.full_name || admin?.username}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{admin?.role || 'admin'}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
