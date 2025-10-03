import React, { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';

interface Medicine {
  id: number;
  name: string;
  category: string;
}

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  medicines: Medicine[];  // New prop
}

// Main menu tab items
const menuItems = [
  {
    title: "Overview",
    value: "overview",
    icon: BarChart3,
    description: "Dashboard overview",
  },
  {
    title: "Sales",
    value: "sales",
    icon: ShoppingCart,
    description: "Manage sales transactions",
  },
  {
    title: "Inventory",
    value: "inventory",
    icon: Package,
    description: "Manage medicine stock",
  },
  {
    title: "Reports",
    value: "reports",
    icon: TrendingUp,
    description: "View analytics & reports",
  },
];

export function AppSidebar({ activeTab, onTabChange, medicines }: AppSidebarProps) {
  const { logout } = usePharmacy();

  // Universal search input state
  const [searchTerm, setSearchTerm] = useState('');

  // Extended tabs including 'links' (if still needed)
  const allTabs = menuItems.map(item => ({ ...item, type: 'menu' }));

  // Filtered search results include menu items and medicines
  const filteredResults = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];

    const menuMatches = menuItems.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    ).map(item => ({ ...item, type: 'menu' }));

    const medicineMatches = medicines.filter(med =>
      med.name.toLowerCase().includes(term) ||
      med.category.toLowerCase().includes(term)
    ).map(med => ({ ...med, type: 'medicine' }));

    return [...menuMatches, ...medicineMatches];
  }, [searchTerm, medicines]);

  // Handle selecting a search result:
  // For medicines, switch to inventory tab and optionally trigger highlighting (not implemented here)
  const handleSelectSearchResult = (item: typeof menuItems[0] | Medicine & { type: string }) => {
    if (item.type === 'menu' && 'value' in item) {
      onTabChange(item.value);
    } else if (item.type === 'medicine') {
      onTabChange('inventory');
      // Optionally you might want to communicate the medicine ID to inventory component to scroll/highlight it.
    }
    setSearchTerm('');
  };

  return (
    <Sidebar className="border-r bg-sidebar flex flex-col" style={{ minHeight: '100vh' }}>
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

        {/* Universal Search Bar */}
        <div className="mt-4 relative">
          <Input
            placeholder="Search pages and medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            autoComplete="off"
          />
          {searchTerm && (
            <div className="bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto z-50 absolute left-0 right-0 shadow-lg text-sm">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => {
                  const isActiveMenu = item.type === 'menu' && activeTab === item.value;
                  return (
                    <button
                      key={item.type === 'medicine' ? `med-${item.id}` : item.title}
                      onClick={() => handleSelectSearchResult(item)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-200 transition ${
                        isActiveMenu ? 'font-semibold bg-gray-200' : ''
                      }`}
                    >
                      <div className="font-medium">
                        {item.type === 'medicine' ? item.name : item.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.type === 'medicine' ? `Medicine in ${item.Category}` : item.description}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-grow overflow-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {allTabs.map((item) => {
                const Icon = item.icon!;
                return (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      isActive={activeTab === item.value}
                      onClick={() => {
                        onTabChange(item.value);
                        setSearchTerm('');
                      }}
                      className="w-full justify-start gap-3 h-11 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent group"
                    >
                      <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {item.description}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

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
    </Sidebar>
  );
}
