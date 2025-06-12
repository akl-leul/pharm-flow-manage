
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePharmacy } from '../context/PharmacyContext';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AddSaleForm: React.FC = () => {
  const { medicines, addSale } = usePharmacy();
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMedicineData = medicines.find(m => m.id === selectedMedicine);
  const totalAmount = selectedMedicineData ? selectedMedicineData.price * parseInt(quantity || '0') : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine || !quantity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const medicine = medicines.find(m => m.id === selectedMedicine);
    if (!medicine) return;

    const quantityNum = parseInt(quantity);
    if (quantityNum > medicine.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${medicine.stock} units available`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const saleData = {
      medicineId: selectedMedicine,
      medicineName: medicine.name,
      quantity: quantityNum,
      price: medicine.price,
      totalAmount,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0]
    };

    setTimeout(() => {
      addSale(saleData);
      setSelectedMedicine('');
      setQuantity('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Sale
        </CardTitle>
        <CardDescription>
          Record a new medicine sale and update inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicine">Medicine</Label>
            <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
              <SelectTrigger>
                <SelectValue placeholder="Select a medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map(medicine => (
                  <SelectItem key={medicine.id} value={medicine.id}>
                    {medicine.name} - ${medicine.price} (Stock: {medicine.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedMedicineData?.stock || 0}
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {selectedMedicineData && (
              <p className="text-xs text-gray-500">
                Available stock: {selectedMedicineData.stock} units
              </p>
            )}
          </div>

          {selectedMedicineData && quantity && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">Sale Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Medicine:</span>
                  <span className="font-medium">{selectedMedicineData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per unit:</span>
                  <span>${selectedMedicineData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium text-blue-900">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !selectedMedicine || !quantity}
          >
            {isSubmitting ? 'Recording Sale...' : 'Record Sale'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSaleForm;
