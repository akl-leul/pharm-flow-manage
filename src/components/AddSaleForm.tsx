import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMedicines, useUpdateMedicineStock } from '../hooks/useMedicines';
import { useAddSale } from '../hooks/useSales';
import { createTelebirrPayment, TelebirrPaymentResponse, generateEthiopianTelebirrQRCode } from '../integrations/telebirr/api';
import { Plus, Check, ChevronsUpDown, Share2, Download, Copy, MessageSquare, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QRCodeSVG } from 'qrcode.react';

interface TelebirrQRCodeData {
  qrValue: string;
  amount: number;
  reference: string;
  saleId: string;
  medicineName: string;
  paymentId?: string;
  expireTime?: number;
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  // Phone number for sending QR code
  const targetPhoneNumber = '+251963889227'; // 0963889227 with country code

  // Timer for QR code expiry
  useEffect(() => {
    if (!qrData || !qrData.expireTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((qrData.expireTime! - now) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert QR code to data URL for sharing
  const getQRCodeDataUrl = async (): Promise<string> => {
    return new Promise((resolve) => {
      const svg = document.getElementById('qrcode-svg');
      if (!svg) {
        resolve('');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });
  };

  // Share functions
  const sendViaSMS = async () => {
    if (!qrData) return;

    const message = `PharmaFlow Payment Request\n\nAmount: ETB ${qrData.amount.toFixed(2)}\nMedicine: ${qrData.medicineName}\nReference: ${qrData.reference}\n\nPlease scan the QR code in the attachment or use this link: ${qrData.qrValue}`;
    
    // Create SMS link
    const smsUrl = `sms:${targetPhoneNumber}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');

    toast({
      title: "SMS Opened",
      description: "SMS app opened with QR code details"
    });
  };

  const sendViaWhatsApp = async () => {
    if (!qrData) return;

    const message = `🏥 *PharmaFlow Payment Request*\n\n💰 *Amount:* ETB ${qrData.amount.toFixed(2)}\n💊 *Medicine:* ${qrData.medicineName}\n📋 *Reference:* ${qrData.reference}\n\n📱 *Please scan the QR code or use:* ${qrData.qrValue}`;
    
    const whatsappUrl = `https://wa.me/${targetPhoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "WhatsApp Opened",
      description: "WhatsApp opened with payment details"
    });
  };

  const copyQRCode = async () => {
    if (!qrData) return;

    const textToCopy = `PharmaFlow Payment Request\nAmount: ETB ${qrData.amount.toFixed(2)}\nMedicine: ${qrData.medicineName}\nReference: ${qrData.reference}\nQR Code: ${qrData.qrValue}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to Clipboard",
        description: "Payment details copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const selectedMedicineData = medicines.find(m => m.id === selectedMedicine);
  const quantityNum = parseInt(quantity || '0');
  const totalAmount = selectedMedicineData ? selectedMedicineData.price * quantityNum : 0;

  const downloadQRCode = async () => {
    if (!qrData) return;

    try {
      const dataUrl = await getQRCodeDataUrl();
      const link = document.createElement('a');
      link.download = `pharmaflow-payment-${qrData.reference}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "QR Code Downloaded",
        description: "QR code saved as image"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download QR code",
        variant: "destructive"
      });
    }
  };

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
      console.log('Starting sale submission:', { selectedMedicine, quantityNum, selectedMedicineData });
      
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

      console.log('Sale data prepared:', saleData);

      // Add sale record
      const result = await addSale.mutateAsync(saleData);
      console.log('Sale recorded successfully:', result);
      
      // Update stock
      const stockUpdateResult = await updateStock.mutateAsync({
        id: selectedMedicine,
        stock: selectedMedicineData.stock - quantityNum
      });
      console.log('Stock updated successfully:', stockUpdateResult);

      // Create Telebirr payment order
      console.log('Creating Telebirr payment order...');
      const telebirrResponse = await createTelebirrPayment(
        result.id,
        totalAmount,
        selectedMedicineData.name
      );
      console.log('Telebirr payment created:', telebirrResponse);

      if (!telebirrResponse.data) {
        throw new Error('Failed to create Telebirr payment order');
      }

      // Calculate expiry time
      const expireTime = Date.now() + (15 * 60 * 1000); // 15 minutes

      setQrData({
        qrValue: telebirrResponse.data ? generateEthiopianTelebirrQRCode(telebirrResponse.data.payId, totalAmount, '192321') : '',
        amount: totalAmount,
        reference: telebirrResponse.data?.payId || result.id,
        saleId: result.id,
        medicineName: selectedMedicineData.name,
        paymentId: telebirrResponse.data?.payId,
        expireTime: expireTime
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
      console.error('Error details:', {
        error: err,
        selectedMedicine,
        quantityNum,
        selectedMedicineData,
        totalAmount
      });
      toast({
        title: "Error",
        description: `Could not record sale / generate QR: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
            
            {/* Expiry Timer */}
            <div className={`w-full p-3 rounded-lg border ${
              isExpired 
                ? 'bg-red-50 border-red-200' 
                : timeRemaining < 60 
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isExpired ? 'bg-red-500' : timeRemaining < 60 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                }`} />
                <span className={`text-sm font-medium ${
                  isExpired ? 'text-red-700' : timeRemaining < 60 ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {isExpired ? 'QR Code Expired' : `Expires in: ${formatTimeRemaining(timeRemaining)}`}
                </span>
              </div>
            </div>
            
            <div className={`p-4 bg-white rounded-lg border ${isExpired ? 'opacity-50' : ''}`}>
              <QRCodeSVG
                id="qrcode-svg"
                value={qrData.qrValue}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-700">
                Scan with Telebirr app to pay <strong>ETB {qrData.amount.toFixed(2)}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Payment ID: {qrData.paymentId} | Medicine: {qrData.medicineName}
              </p>
              {import.meta.env.DEV && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <p className="font-medium text-green-800">Development Mode:</p>
                  <p className="text-green-700">Using Vite proxy to handle CORS</p>
                  <p className="text-green-700">API calls routed through proxy server</p>
                </div>
              )}
              {!import.meta.env.DEV && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <p className="font-medium text-blue-800">Production Mode:</p>
                  <p className="text-blue-700">QR contains real Telebirr H5 payment URL</p>
                  <p className="text-blue-700">Requires proper network access to Telebirr</p>
                </div>
              )}
              {isExpired && (
                <p className="text-xs text-red-600 font-medium">
                  Please generate a new QR code to continue
                </p>
              )}
            </div>

            {/* Sharing Options */}
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Share2 className="h-4 w-4" />
                <span>Send to +251963889227</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={sendViaSMS}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isExpired}
                >
                  <MessageSquare className="h-4 w-4" />
                  Send SMS
                </Button>
                
                <Button
                  onClick={sendViaWhatsApp}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  disabled={isExpired}
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={copyQRCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isExpired}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isExpired}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
              
              {isExpired && (
                <Button
                  onClick={() => {
                    setQrData(null);
                    setIsExpired(false);
                    setTimeRemaining(0);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Generate New QR Code
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddSaleForm;
