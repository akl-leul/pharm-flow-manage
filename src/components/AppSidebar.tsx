
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
  Pill, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  LogOut,
  BarChart3
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  {
    title: "Overview",
    value: "overview",
    icon: BarChart3,
    description: "Dashboard overview"
  },
  {
    title: "Sales",
    value: "sales", 
    icon: ShoppingCart,
    description: "Manage sales transactions"
  },
  {
    title: "Inventory",
    value: "inventory",
    icon: Package,
    description: "Manage medicine stock"
  },
  {
    title: "Reports",
    value: "reports",
    icon: TrendingUp,
    description: "View analytics & reports"
  },
];

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { logout } = usePharmacy();

  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-300 p-2 rounded-lg">
            <Pill className="h-6 w-6 text-blue" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">PharmaFlow</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    className="w-full justify-start gap-3 h-11 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent group"
                  >
                    <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.description}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
             <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          onClick={logout}
          className="w-full justify-start gap-3 h-11 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

     
    </Sidebar>
  );
}
