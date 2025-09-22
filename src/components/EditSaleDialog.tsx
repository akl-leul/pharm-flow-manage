
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSales, useUpdateSale } from '../hooks/useSales';
import { toast } from '@/hooks/use-toast';

interface EditSaleDialogProps {
  saleId: string;
  onClose: () => void;
}

const EditSaleDialog: React.FC<EditSaleDialogProps> = ({ saleId, onClose }) => {
  const { data: sales = [] } = useSales();
  const updateSaleMutation = useUpdateSale();
  const [quantity, setQuantity] = useState('');

  const sale = sales.find(s => s.id === saleId);

  useEffect(() => {
    if (sale) {
      setQuantity(sale.quantity.toString());
    }
  }, [sale]);

  if (!sale) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newQuantity = parseInt(quantity);
    if (newQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const updatedSale = {
      quantity: newQuantity,
      total_amount: Number(sale.price) * newQuantity
    };

    updateSaleMutation.mutate(
      { id: saleId, updates: updatedSale },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>
            Update the sale details for {sale.medicine_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Medicine</Label>
            <Input value={sale.medicine_name} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Quantity</Label>
            <Input
              id="edit-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Unit Price</Label>
            <Input value={`ETB ${Number(sale.price).toFixed(2)}`} disabled />
          </div>

          <div className="space-y-2">
            <Label>Total Amount</Label>
            <Input 
              value={`ETB ${(Number(sale.price) * parseInt(quantity || '0')).toFixed(2)}`} 
              disabled 
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSaleMutation.isPending}>
              {updateSaleMutation.isPending ? 'Updating...' : 'Update Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSaleDialog;
