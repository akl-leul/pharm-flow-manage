import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMedicines } from '@/hooks/useMedicines';
import { useSales } from '@/hooks/useSales';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { PageLoadingSpinner } from '../LoadingSpinner';

interface Props {
  onNavigate: (tab: string) => void;
}

const OverviewSection: React.FC<Props> = ({ onNavigate }) => {
  const { data: medicines = [], isLoading: medLoading } = useMedicines();
  const { data: sales = [], isLoading: salesLoading } = useSales();

  if (medLoading || salesLoading) return <PageLoadingSpinner />;

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => s.created_at?.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const lowStock = medicines.filter((m) => m.quantity <= m.min_stock);
  const expiringSoon = medicines.filter((m) => {
    if (!m.expiry_date) return false;
    const diff = new Date(m.expiry_date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: `ETB ${totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`,
      sub: `${sales.length} transactions`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400',
    },
    {
      label: 'Today',
      value: `ETB ${todayRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`,
      sub: `${todaySales.length} sales today`,
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      label: 'Medicines',
      value: medicines.length.toString(),
      sub: 'In inventory',
      icon: Package,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400',
    },
    {
      label: 'Low Stock',
      value: lowStock.length.toString(),
      sub: 'Need restocking',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-border shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'New Sale', tab: 'pos', icon: ShoppingCart },
              { label: 'Inventory', tab: 'inventory', icon: Package },
              { label: 'Reports', tab: 'reports', icon: TrendingUp },
              { label: 'Customers', tab: 'customers', icon: TrendingUp },
            ].map((action) => (
              <Button
                key={action.tab}
                variant="outline"
                className="h-16 flex flex-col gap-1.5 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => onNavigate(action.tab)}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-card-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onNavigate('inventory')}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All stock levels are healthy</p>
            ) : (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{m.quantity} left</p>
                      <p className="text-xs text-muted-foreground">Min: {m.min_stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-card-foreground">
              <Clock className="h-4 w-4 text-red-500" />
              Expiring Soon
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => onNavigate('inventory')}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No medicines expiring soon</p>
            ) : (
              <div className="space-y-2">
                {expiringSoon.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {m.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{m.expiry_date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;
