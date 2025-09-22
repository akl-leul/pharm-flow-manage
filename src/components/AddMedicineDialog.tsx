
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddMedicine } from '../hooks/useMedicines';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AddMedicineDialog: React.FC = () => {
  const addMedicine = useAddMedicine();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    price: '',
    category: '',
    expiry_date: '',
    min_stock: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stock || !formData.price || !formData.category || !formData.expiry_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const medicineData = {
        name: formData.name,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        category: formData.category,
        expiry_date: formData.expiry_date,
        min_stock: parseInt(formData.min_stock) || 0
      };

      await addMedicine.mutateAsync(medicineData);
      
      // Reset form
      setFormData({
        name: '',
        stock: '',
        price: '',
        category: '',
        expiry_date: '',
        min_stock: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
          <DialogDescription>
            Add a new medicine to the inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medicine Name</Label>
            <Input
              id="name"
              placeholder="Enter medicine name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="Enter stock"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (ETB)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
                
              </SelectTrigger>
             <SelectContent>
  <SelectItem value="Allergy">Allergy</SelectItem>
  <SelectItem value="Anesthetics">Anesthetics</SelectItem>
  <SelectItem value="Anti-inflammatory">Anti-inflammatory</SelectItem>
  <SelectItem value="Antibiotic">Antibiotic</SelectItem>
  <SelectItem value="Antifungal">Antifungal</SelectItem>
  <SelectItem value="Antiviral">Antiviral</SelectItem>
  <SelectItem value="Cancer">Cancer</SelectItem>
  <SelectItem value="Cholesterol">Cholesterol</SelectItem>
  <SelectItem value="Diabetes">Diabetes</SelectItem>
  <SelectItem value="Digestive">Digestive</SelectItem>
  <SelectItem value="Ear">Ear</SelectItem>
  <SelectItem value="Eye">Eye</SelectItem>
  <SelectItem value="Gastrointestinal">Gastrointestinal</SelectItem>
  <SelectItem value="Geriatric">Geriatric</SelectItem>
  <SelectItem value="Heart">Heart</SelectItem>
  <SelectItem value="Hormonal">Hormonal</SelectItem>
  <SelectItem value="Hypertension">Hypertension</SelectItem>
  <SelectItem value="Immunosuppressants">Immunosuppressants</SelectItem>
  <SelectItem value="Infectious Disease">Infectious Disease</SelectItem>
  <SelectItem value="Neurological">Neurological</SelectItem>
 
  <SelectItem value="Pain Management">Pain Management</SelectItem>
  <SelectItem value="Pain Relief">Pain Relief</SelectItem>
  <SelectItem value="Pediatric">Pediatric</SelectItem>
  <SelectItem value="Psychiatric">Psychiatric</SelectItem>
  <SelectItem value="Reproductive Health">Reproductive Health</SelectItem>
  <SelectItem value="Respiratory">Respiratory</SelectItem>
  <SelectItem value="Skin">Skin</SelectItem>
  <SelectItem value="Urinary">Urinary</SelectItem>
  <SelectItem value="Vitamins & Supplements">Vitamins & Supplements</SelectItem>
   <SelectItem value="Other">Other</SelectItem>
</SelectContent>

            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Min Stock</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                placeholder="Min stock level"
                value={formData.min_stock}
                onChange={(e) => handleInputChange('min_stock', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={addMedicine.isPending}
            >
              {addMedicine.isPending ? 'Adding...' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicineDialog;
