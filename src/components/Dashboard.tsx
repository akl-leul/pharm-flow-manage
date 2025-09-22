import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { usePharmacy } from '../context/PharmacyContext';
import { useMedicines } from '../hooks/useMedicines';
import { useSales } from '../hooks/useSales';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Plus,
  AlertTriangle
} from 'lucide-react';
import SalesTable from './SalesTable';
import AddSaleForm from './AddSaleForm';
import InventoryTable from './InventoryTable';
import ReportsSection from './ReportsSection';
import { AppSidebar } from './AppSidebar';
import { PageLoadingSpinner } from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const { logout } = usePharmacy();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const { data: medicines = [], isLoading: medicinesLoading } = useMedicines();
  const { data: sales = [], isLoading: salesLoading } = useSales();

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.sale_date === today);
  const lowStockMedicines = medicines.filter(medicine => medicine.stock <= medicine.min_stock);

  const handleTabChange = (tab: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 300);
  };

  const renderContent = () => {
    if (isLoading || medicinesLoading || salesLoading) {
      return <PageLoadingSpinner />;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 border border-teal-200 bg-teal-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Sales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">ETB {totalSales.toFixed(2)}</div>
                  <p className="text-xs text-white">
                    {sales.length} transactions
                  </p>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 border border-cyan-200 bg-cyan-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Today's Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{todaySales.length}</div>
                  <p className="text-xs text-white">
                    ETB {todaySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0).toFixed(2)} revenue
                  </p>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 border border-blue-200 bg-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Medicines</CardTitle>
                  <Package className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{medicines.length}</div>
                  <p className="text-xs text-white">
                    In inventory
                  </p>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 border border-rose-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-rose-700">Low Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-700">{lowStockMedicines.length}</div>
                  <p className="text-xs text-rose-500">
                    Need restocking
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="transition-all duration-200 hover:shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-teal-800">Quick Actions</CardTitle>
                <CardDescription className="text-teal-600">Frequently used actions for daily operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="h-20 flex flex-col gap-2 bg-teal-600 hover:bg-teal-700 transition-all duration-200 hover:scale-105"
                    onClick={() => handleTabChange('sales')}
                  >
                    <Plus className="h-6 w-6 text-white" />
                    <span className="text-white">Add New Sale</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2 border-teal-600 text-teal-600 hover:bg-teal-100 hover:text-teal-800 transition-all duration-200 hover:scale-105"
                    onClick={() => handleTabChange('inventory')}
                  >
                    <Package className="h-6 w-6" />
                    Manage Inventory
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2 border-teal-600 text-teal-600 hover:bg-teal-100 hover:text-teal-800 transition-all duration-200 hover:scale-105"
                    onClick={() => handleTabChange('reports')}
                  >
                    <TrendingUp className="h-6 w-6" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            {lowStockMedicines.length > 0 && (
              <Card className="border-rose-300 bg-rose-50 transition-all duration-200 hover:shadow-lg animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-700" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription className="text-rose-600">
                    The following medicines are running low and need restocking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lowStockMedicines.map(medicine => (
                      <div key={medicine.id} className="flex justify-between items-center p-2 bg-white rounded border border-rose-200 transition-all duration-200 hover:shadow-sm">
                        <span className="font-medium text-rose-800">{medicine.name}</span>
                        <span className="text-rose-700 font-semibold">
                          {medicine.stock} remaining (Min: {medicine.min_stock})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case 'sales':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AddSaleForm />
              </div>
              <div className="lg:col-span-2">
                <SalesTable />
              </div>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="animate-fade-in">
            <InventoryTable />
          </div>
        );
      case 'reports':
        return (
          <div className="animate-fade-in">
            <ReportsSection />
          </div>
        );
      default:
        return <PageLoadingSpinner />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-teal-50">
        <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-teal-200 sticky top-0 z-10">
            <div className="flex items-center gap-4 h-16 px-6">
              <SidebarTrigger className="transition-all duration-200 hover:scale-110 text-teal-600" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold capitalize text-teal-900">{activeTab}</h2>
                <p className="text-sm text-teal-700">
                  {activeTab === 'overview' && 'Dashboard overview and quick actions'}
                  {activeTab === 'sales' && 'Manage sales transactions'}
                  {activeTab === 'inventory' && 'Manage medicine inventory'}
                  {activeTab === 'reports' && 'View analytics and reports'}
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
