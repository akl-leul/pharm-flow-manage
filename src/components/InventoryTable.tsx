import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMedicines } from '../hooks/useMedicines';
import { Package, AlertTriangle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import AddMedicineDialog from './AddMedicineDialog';
import { PageLoadingSpinner } from './LoadingSpinner';

const PAGE_SIZE = 5;

const InventoryTable: React.FC = () => {
  const { data: medicines = [], isLoading } = useMedicines();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMedicines = medicines.filter(medicine => 
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredMedicines.length / PAGE_SIZE);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to first page on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getStockStatus = (medicine: any) => {
    if (medicine.stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (medicine.stock <= medicine.min_stock) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0;
  };

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    
    <div className="space-y-6">
      
      {/* Add Medicine Button at the top right */}
      <div className="flex justify-end mb-2">
        
         {showAddDialog && (
        <AddMedicineDialog onClose={() => setShowAddDialog(false)} />
      )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Monitor medicine stock levels and manage inventory
              </CardDescription>
            </div>
            {/* Removed Add Medicine button from here */}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <p className="text-sm text-gray-600">
              {filteredMedicines.length} medicines
            </p>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine);
                  const expiringSoon = isExpiringSoon(medicine.expiry_date);
                  const expired = isExpired(medicine.expiry_date);
                  
                  return (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={medicine.stock <= medicine.min_stock ? 'text-red-600 font-semibold' : ''}>
                            {medicine.stock}
                          </span>
                          {medicine.stock <= medicine.min_stock && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{medicine.min_stock}</TableCell>
                      <TableCell>${Number(medicine.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={expired ? 'text-red-600 font-semibold' : expiringSoon ? 'text-yellow-600' : ''}>
                            {medicine.expiry_date}
                          </span>
                          {(expired || expiringSoon) && (
                            <AlertTriangle className={`h-4 w-4 ${expired ? 'text-red-500' : 'text-yellow-500'}`} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

     
    </div>
  );
};

export default InventoryTable;