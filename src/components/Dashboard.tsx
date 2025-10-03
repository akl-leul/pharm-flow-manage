import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePharmacy } from "../context/PharmacyContext";
import { useMedicines } from "../hooks/useMedicines";
import { useSales } from "../hooks/useSales";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Plus,
  AlertTriangle,
  Activity,
  Clock,
  DollarSign,
  Bell,
  Search,
} from "lucide-react";
import SalesTable from "./SalesTable";
import AddSaleForm from "./AddSaleForm";
import InventoryTable from "./InventoryTable";
import ReportsSection from "./ReportsSection";
import { AppSidebar } from "./AppSidebar";
import { PageLoadingSpinner } from "./LoadingSpinner";

const Dashboard: React.FC = () => {
  const { logout } = usePharmacy();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const { data: medicines = [], isLoading: medicinesLoading } = useMedicines();
  const { data: sales = [], isLoading: salesLoading } = useSales();

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount),
    0
  );
  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((sale) => sale.sale_date === today);
  const lowStockMedicines = medicines.filter(
    (medicine) => medicine.stock <= medicine.min_stock
  );

  // Example activity log
  const activities = [
    {
      id: 1,
      type: "sale",
      message: `New sale recorded - ETB ${todaySales.reduce(
        (sum, s) => sum + Number(s.total_amount),
        0
      )}`,
      time: "Just now",
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
    },
    {
      id: 2,
      type: "inventory",
      message: `${lowStockMedicines.length} medicines are running low`,
      time: "10 mins ago",
      icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
    },
    {
      id: 3,
      type: "inventory",
      message: `Total medicines in stock: ${medicines.length}`,
      time: "1 hour ago",
      icon: <Package className="h-4 w-4 text-blue-600" />,
    },
    {
      id: 4,
      type: "report",
      message: `Generated daily report for ${today}`,
      time: "2 hours ago",
      icon: <TrendingUp className="h-4 w-4 text-teal-600" />,
    },
  ];

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
      case "overview":
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl shadow-md hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">ETB {totalSales.toFixed(2)}</div>
                  <p className="text-xs opacity-80">{sales.length} transactions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-700 text-white rounded-2xl shadow-md hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todaySales.length}</div>
                  <p className="text-xs opacity-80">
                    ETB{" "}
                    {todaySales
                      .reduce((sum, sale) => sum + Number(sale.total_amount), 0)
                      .toFixed(2)}{" "}
                    revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl shadow-md hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Medicines</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{medicines.length}</div>
                  <p className="text-xs opacity-80">In inventory</p>
                </CardContent>
              </Card>

              <Card className="border border-rose-300 rounded-2xl shadow-sm hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-rose-700">Low Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-700">
                    {lowStockMedicines.length}
                  </div>
                  <p className="text-xs text-rose-500">Need restocking</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-teal-800">Quick Actions</CardTitle>
                <CardDescription className="text-teal-600">
                  Frequently used shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    className="h-20 flex flex-col gap-2 bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md"
                    onClick={() => handleTabChange("sales")}
                  >
                    <Plus className="h-6 w-6 text-white" />
                    <span className="text-white text-sm">Add Sale</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 border-teal-600 text-teal-700 hover:bg-teal-50 rounded-xl"
                    onClick={() => handleTabChange("inventory")}
                  >
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Inventory</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 border-teal-600 text-teal-700 hover:bg-teal-50 rounded-xl"
                    onClick={() => handleTabChange("reports")}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activities + Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-800">
                    <Activity className="h-5 w-5 text-teal-600" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-white shadow-sm"
                      >
                        <div className="mt-1">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-indigo-800">Tasks</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Pending actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded text-indigo-600" />
                      <span className="text-sm text-gray-800">
                        Check medicines expiring this week
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded text-indigo-600" />
                      <span className="text-sm text-gray-800">Prepare daily sales report</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded text-indigo-600" />
                      <span className="text-sm text-gray-800">
                        Call supplier for Paracetamol stock
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Expiring Soon */}
            <Card className="rounded-2xl border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5 text-yellow-700" />
                  Expiring Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {medicines
                    .filter(
                      (m) =>
                        new Date(m.expiry_date) <
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between items-center p-2 bg-white rounded border border-yellow-200"
                      >
                        <span className="font-medium text-yellow-800">{m.name}</span>
                        <span className="text-yellow-700 font-semibold">
                          Exp: {m.expiry_date}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "sales":
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

      case "inventory":
        return (
          <div className="animate-fade-in">
            <InventoryTable />
          </div>
        );

      case "reports":
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-teal-50 to-white">
        <AppSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-20">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-teal-600 hover:scale-110 transition" />
                <div>
                  <h2 className="text-lg font-semibold capitalize text-teal-900">
                    {activeTab}
                  </h2>
                  <p className="text-xs text-teal-700">
                    {activeTab === "overview" && "Dashboard overview"}
                    {activeTab === "sales" && "Manage sales"}
                    {activeTab === "inventory" && "Manage inventory"}
                    {activeTab === "reports" && "View reports"}
                  </p>
                </div>
              </div>
               
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 p-4 sm:p-6">{renderContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
