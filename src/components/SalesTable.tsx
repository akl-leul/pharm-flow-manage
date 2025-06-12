
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSales, useDeleteSale } from '../hooks/useSales';
import { Search, Edit, Trash2, Calendar } from 'lucide-react';
import EditSaleDialog from './EditSaleDialog';
import { PageLoadingSpinner } from './LoadingSpinner';

const SalesTable: React.FC = () => {
  const { data: sales = [], isLoading } = useSales();
  const deleteSaleMutation = useDeleteSale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [editingSale, setEditingSale] = useState<string | null>(null);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.medicine_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || sale.sale_date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale? Stock will be restored.')) {
      deleteSaleMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Records</CardTitle>
        <CardDescription>
          View and manage all pharmacy sales transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by medicine name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate('')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredSales.length} of {sales.length} sales
          </p>
          {filteredSales.length > 0 && (
            <Badge variant="secondary">
              Total: ${filteredSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0).toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {sales.length === 0 ? 'No sales recorded yet' : 'No sales match your search criteria'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.medicine_name}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>${Number(sale.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        ${Number(sale.total_amount).toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>{sale.sale_date}</TableCell>
                    <TableCell>{sale.sale_time}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSale(sale.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={deleteSaleMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {editingSale && (
          <EditSaleDialog
            saleId={editingSale}
            onClose={() => setEditingSale(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SalesTable;
