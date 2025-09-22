import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMedicines, useUpdateMedicineStock } from '../hooks/useMedicines';
import { useAddSale } from '../hooks/useSales';
import { Plus, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import QRCode from 'qrcode.react';

interface TelebirrQRCodeData {
  qrValue: string;
  amount: number;
  reference: string;
}

const AddSaleForm: React.FC = () => {
  const { data: medicines = [], isLoading: medicinesLoading } = useMedicines();
  const addSale = useAddSale();
  const updateStock = useUpdateMedicineStock();
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const [qrData, setQrData] = useState<TelebirrQRCodeData | null>(null);

  const selectedMedicineData = medicines.find(m => m.id === selectedMedicine);
  const quantityNum = parseInt(quantity || '0');
  const totalAmount = selectedMedicineData ? selectedMedicineData.price * quantityNum : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedMedicine) {
      toast({
        title: "Validation Error",
        description: "Please select medicine",
        variant: "destructive"
      });
      return;
    }
    if (!quantity || quantityNum < 1) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    if (!selectedMedicineData) {
      toast({
        title: "Error",
        description: "Selected medicine not found",
        variant: "destructive"
      });
      return;
    }
    if (quantityNum > selectedMedicineData.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedMedicineData.stock} units available`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const saleData = {
        medicine_id: selectedMedicine,
        medicine_name: selectedMedicineData.name,
        quantity: quantityNum,
        price: selectedMedicineData.price,
        total_amount: totalAmount,
        sale_date: now.toISOString().split('T')[0],
        sale_time: now.toTimeString().split(' ')[0]
      };

      // Add sale record
      const result = await addSale.mutateAsync(saleData);
      // Update stock
      await updateStock.mutateAsync({
        medicine_id: selectedMedicine,
        new_stock: selectedMedicineData.stock - quantityNum
      });

      // Build QR code value according to NBE / Telebirr spec
      // Example: using interoperable QR standard format. You need to adapt:
      // For instance: tags for merchant ID, amount, currency, country, reference etc.
      // Here's a simplified version.

      const merchantId = "YOUR_MERCHANT_ID";  // replace
      const reference = result?.id?.toString() || `SALE-${Date.now()}`;

      // This is a dummy formatted string. Replace with actual required format.
      const qrValue = `ETQR|MID:${merchantId}|AMT:${totalAmount.toFixed(2)}|REF:${reference}`;

      setQrData({
        qrValue,
        amount: totalAmount,
        reference
      });

      // Reset form but keep QR visible
      setSelectedMedicine('');
      setQuantity('');
      toast({
        title: "Sale Recorded",
        description: `Sale recorded & QR generated for ETB ${totalAmount.toFixed(2)}`,
        variant: "default"
      });
    } catch (err) {
      console.error('Error recording sale or generating QR:', err);
      toast({
        title: "Error",
        description: "Could not record sale / generate QR",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (medicinesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Sale
        </CardTitle>
        <CardDescription>
          Record a medicine sale & generate Telebirr QR
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicine">Medicine</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedMedicine
                    ? selectedMedicineData?.name
                    : "Select medicine..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search medicines..." />
                  <CommandList>
                    <CommandEmpty>No medicine found.</CommandEmpty>
                    <CommandGroup>
                      {medicines.map((medicine) => (
                        <CommandItem
                          key={medicine.id}
                          value={medicine.name}
                          onSelect={() => {
                            setSelectedMedicine(medicine.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMedicine === medicine.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ETB {medicine.price.toFixed(2)} • Stock: {medicine.stock}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                Available: {selectedMedicineData.stock} units
              </p>
            )}
          </div>

          {selectedMedicineData && quantityNum >= 1 && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">Sale Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Medicine:</span>
                  <span className="font-medium">{selectedMedicineData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per unit:</span>
                  <span>ETB {selectedMedicineData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantityNum}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium text-blue-900">
                  <span>Total:</span>
                  <span>ETB {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !selectedMedicine || !quantity || addSale.isPending}
          >
            {isSubmitting || addSale.isPending ? 'Processing...' : 'Submit Sale'}
          </Button>
        </form>

        {qrData && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <h4 className="font-semibold">Telebirr Payment QR Code</h4>
            <QRCode
              value={qrData.qrValue}
              size={256}
              level="H"
              includeMargin={true}
            />
            <p className="text-sm text-gray-700">
              Scan with Telebirr app to pay <strong>ETB {qrData.amount.toFixed(2)}</strong><br/>
              Reference: {qrData.reference}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddSaleForm;
