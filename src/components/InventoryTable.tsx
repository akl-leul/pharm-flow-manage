import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMedicines } from '../hooks/useMedicines';
import {
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash,
  Download,
} from 'lucide-react';
import AddMedicineDialog from './AddMedicineDialog';
import { PageLoadingSpinner } from './LoadingSpinner';
import { supabase } from '../integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import * as XLSX from 'xlsx';

const PAGE_SIZE = 15;

const InventoryTable: React.FC = () => {
  const { data: medicines = [], isLoading, mutate } = useMedicines();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);

  // State for delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<any | null>(null);

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / PAGE_SIZE);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getStockStatus = (medicine: any) => {
    if (medicine.stock === 0)
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (medicine.stock <= medicine.min_stock)
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
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

  // Show confirmation dialog on delete click
  const confirmDelete = (medicine: any) => {
    setMedicineToDelete(medicine);
    setDeleteConfirmOpen(true);
  };

  // Actual delete after confirmation
  const handleDelete = async () => {
    if (!medicineToDelete) return;

    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', medicineToDelete.id);
    if (error) {
      alert('Failed to delete: ' + error.message);
    } else {
     await mutate(); // refresh data
      setDeleteConfirmOpen(false);
      setMedicineToDelete(null);
    }
  };

  // Update medicine
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;

    const { error } = await supabase
      .from('medicines')
      .update({
        name: editingMedicine.name,
        category: editingMedicine.category,
        stock: editingMedicine.stock,
        min_stock: editingMedicine.min_stock,
        price: editingMedicine.price,
        expiry_date: editingMedicine.expiry_date,
      })
      .eq('id', editingMedicine.id);

    if (error) {
      alert('Failed to update: ' + error.message);
    } else {
      setEditingMedicine(null);
      mutate(); // refresh data
    }
  };

  // Export filtered medicines to Excel
  const handleExportExcel = () => {
    const exportData = filteredMedicines.map((m) => ({
      'Medicine Name': m.name,
      Category: m.category,
      'Current Stock': m.stock,
      'Min Stock': m.min_stock,
      Price: m.price,
      'Expiry Date': m.expiry_date,
      Status: getStockStatus(m).label,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines');

    XLSX.writeFile(workbook, 'MedicinesInventory.xlsx');
  };

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3 mb-2">
        <div>{showAddDialog && <AddMedicineDialog onClose={() => setShowAddDialog(false)} />}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export as Excel
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>Monitor medicine stock levels and manage inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <p className="text-sm text-gray-600">{filteredMedicines.length} medicines</p>
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
                  <TableHead>Statuses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody >
                {paginatedMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine);
                  const expiringSoon = isExpiringSoon(medicine.expiry_date);
                  const expired = isExpired(medicine.expiry_date);

                  return (
                    <TableRow key={medicine.id} className="even:bg-gray-300 hover:bg-gray-100"
 >
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              medicine.stock <= medicine.min_stock ? 'text-red-600 font-semibold' : ''
                            }
                          >
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
                          <span
                            className={
                              expired
                                ? 'text-red-600 font-semibold'
                                : expiringSoon
                                ? 'text-yellow-600'
                                : ''
                            }
                          >
                            {medicine.expiry_date}
                          </span>
                          {(expired || expiringSoon) && (
                            <AlertTriangle
                              className={`h-4 w-4 ${expired ? 'text-red-500' : 'text-yellow-500'}`}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingMedicine(medicine)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => confirmDelete(medicine)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
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

      {/* Edit Medicine Dialog */}
      {editingMedicine && (
        <Dialog open={true} onOpenChange={() => setEditingMedicine(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Medicine</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingMedicine.name}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={editingMedicine.category}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, category: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={editingMedicine.stock}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, stock: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Min Stock</Label>
                <Input
                  type="number"
                  value={editingMedicine.min_stock}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, min_stock: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingMedicine.price}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={editingMedicine.expiry_date}
                  onChange={(e) =>
                    setEditingMedicine({ ...editingMedicine, expiry_date: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingMedicine(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
     <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{' '}
            <strong>{medicineToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTable;
