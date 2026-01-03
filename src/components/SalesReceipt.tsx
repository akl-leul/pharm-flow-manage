import React from 'react';
import { Sale } from '../types/pharmacy';
import { format } from 'date-fns';

interface SalesReceiptProps {
  sale: Sale;
  pharmacyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    license: string;
  };
}

const SalesReceipt: React.FC<SalesReceiptProps> = ({ 
  sale, 
  pharmacyInfo = {
    name: 'PharmaFlow Pharmacy',
    address: '123 Main Street, Addis Ababa, Ethiopia',
    phone: '+251 911 234 567',
    email: 'info@pharmaflow.et',
    license: 'PH-2024-001234'
  }
}) => {
  const receiptDate = format(new Date(`${sale.sale_date} ${sale.sale_time}`), 'MMMM dd, yyyy HH:mm');
  const receiptNumber = `RCP-${sale.sale_date.replace(/-/g, '')}-${sale.id.slice(-6).toUpperCase()}`;

  return (
    <div className="receipt-container" style={{ 
      fontFamily: 'monospace', 
      maxWidth: '400px', 
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      color: 'black'
    }}>
      {/* Receipt Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
          {pharmacyInfo.name}
        </h1>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>{pharmacyInfo.address}</p>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>Tel: {pharmacyInfo.phone}</p>
        <p style={{ fontSize: '12px', margin: '2px 0' }}>Email: {pharmacyInfo.email}</p>
        <p style={{ fontSize: '10px', margin: '2px 0', fontStyle: 'italic' }}>
          License: {pharmacyInfo.license}
        </p>
      </div>

      {/* Receipt Details */}
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px' }}>Receipt No:</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{receiptNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px' }}>Date:</span>
          <span style={{ fontSize: '12px' }}>{receiptDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px' }}>Cashier:</span>
          <span style={{ fontSize: '12px' }}>Admin</span>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
          SALES RECEIPT
        </h3>
        
        {/* Item Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '5px' }}>
          <span style={{ fontSize: '11px', flex: 2 }}>Item</span>
          <span style={{ fontSize: '11px', textAlign: 'center', flex: 1 }}>Qty</span>
          <span style={{ fontSize: '11px', textAlign: 'right', flex: 1 }}>Price</span>
          <span style={{ fontSize: '11px', textAlign: 'right', flex: 1 }}>Total</span>
        </div>

        {/* Item Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '11px', flex: 2 }}>{sale.medicine_name}</span>
          <span style={{ fontSize: '11px', textAlign: 'center', flex: 1 }}>{sale.quantity}</span>
          <span style={{ fontSize: '11px', textAlign: 'right', flex: 1 }}>{Number(sale.price).toFixed(2)}</span>
          <span style={{ fontSize: '11px', textAlign: 'right', flex: 1 }}>{Number(sale.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '10px 0', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px' }}>Subtotal:</span>
          <span style={{ fontSize: '12px' }}>ETB {Number(sale.total_amount).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px' }}>VAT (0%):</span>
          <span style={{ fontSize: '12px' }}>ETB 0.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span style={{ fontSize: '14px' }}>TOTAL:</span>
          <span style={{ fontSize: '14px' }}>ETB {Number(sale.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px' }}>Payment Method:</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>CASH</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px' }}>Amount Paid:</span>
          <span style={{ fontSize: '12px' }}>ETB {Number(sale.total_amount).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px' }}>Change:</span>
          <span style={{ fontSize: '12px' }}>ETB 0.00</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '10px', margin: '5px 0', fontStyle: 'italic' }}>
          Thank you for your purchase!
        </p>
        <p style={{ fontSize: '10px', margin: '5px 0' }}>
          Please keep this receipt for warranty purposes
        </p>
        <p style={{ fontSize: '9px', margin: '10px 0 0 0', borderTop: '1px dashed #000', paddingTop: '10px' }}>
          {pharmacyInfo.name} | {pharmacyInfo.phone}
        </p>
      </div>
    </div>
  );
};

export default SalesReceipt;
