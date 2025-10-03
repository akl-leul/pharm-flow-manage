import React, { useState, useEffect } from 'react';
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

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'category' | 'stock' | 'price' | 'expiry_date'>('name');
  const [sortOrderAsc, setSortOrderAsc] = useState(true);

  // Single delete
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<any | null>(null);

  // Multi-select delete
  const [selectedMedicines, setSelectedMedicines] = useState<any[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'stock' || sortField === 'price') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }

    if (sortField === 'expiry_date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortOrderAsc ? -1 : 1;
    if (aVal > bVal) return sortOrderAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMedicines.length / PAGE_SIZE);
  const paginatedMedicines = sortedMedicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortOrderAsc]);

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
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays > 0;
  };

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  const toggleSelectAll = () => {
    if (selectedMedicines.length === paginatedMedicines.length) {
      setSelectedMedicines([]);
    } else {
      setSelectedMedicines(paginatedMedicines);
    }
  };

  const toggleSelectMedicine = (medicine: any) => {
    setSelectedMedicines((prev) =>
      prev.some((m) => m.id === medicine.id)
        ? prev.filter((m) => m.id !== medicine.id)
        : [...prev, medicine]
    );
  };

  const confirmDelete = (medicine: any) => {
    setMedicineToDelete(medicine);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!medicineToDelete) return;

    const { error } = await supabase.from('medicines').delete().eq('id', medicineToDelete.id);
    if (!error) {
      await mutate();
      setDeleteConfirmOpen(false);
      setMedicineToDelete(null);
    } else {
      alert('Failed to delete: ' + error.message);
    }
  };

  const handleBulkDelete = async () => {
    const ids = selectedMedicines.map((m) => m.id);
    const { error } = await supabase.from('medicines').delete().in('id', ids);
    if (!error) {
      await mutate();
      setSelectedMedicines([]);
      setBulkDeleteOpen(false);
    } else {
      alert('Failed to delete: ' + error.message);
    }
  };

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

  if (isLoading) return <PageLoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          {showAddDialog && <AddMedicineDialog onClose={() => setShowAddDialog(false)} />}
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
        {selectedMedicines.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setBulkDeleteOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Delete Selected ({selectedMedicines.length})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Management
          </CardTitle>
          <CardDescription>Monitor medicine stock levels and manage inventory</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <Input
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md"
            />

            <div className="flex gap-2 items-center">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="stock">Current Stock</option>
                <option value="price">Price</option>
                <option value="expiry_date">Expiry Date</option>
              </select>
              <Button onClick={() => setSortOrderAsc(!sortOrderAsc)} variant="outline" size="sm">
                {sortOrderAsc ? '↑' : '↓'}
              </Button>
              <span className="text-sm">{filteredMedicines.length} medicines</span>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={
                        selectedMedicines.length === paginatedMedicines.length &&
                        paginatedMedicines.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMedicines.map((medicine) => {
                  const isSelected = selectedMedicines.some((m) => m.id === medicine.id);
                  const stockStatus = getStockStatus(medicine);
                  const expired = isExpired(medicine.expiry_date);
                  const expiringSoon = isExpiringSoon(medicine.expiry_date);

                  return (
                    <TableRow key={medicine.id} className="even:bg-gray-100">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectMedicine(medicine)}
                        />
                      </TableCell>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>{medicine.stock}</TableCell>
                      <TableCell>{medicine.min_stock}</TableCell>
                      <TableCell>ETB {medicine.price.toFixed(2)}</TableCell>
                      <TableCell className={expired ? 'text-red-600' : expiringSoon ? 'text-yellow-600' : ''}>
                        {medicine.expiry_date}
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

          {/* Pagination */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
          </DialogHeader>
          <p>The following medicines will be deleted:</p>
          <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
            {selectedMedicines.map((med) => (
              <li key={med.id}>{med.name}</li>
            ))}
          </ul>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Delete Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete <strong>{medicineToDelete?.name}</strong>? This action cannot be undone.
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
