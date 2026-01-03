import React from 'react';
import { Sale } from '../types/pharmacy';
import SalesReceipt from './SalesReceipt';

interface PrintReceiptProps {
  sale: Sale;
  onClose: () => void;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

    // Get the HTML content
    const contentHTML = printContent.innerHTML;
    
    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Receipt - ${sale.id}</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                font-family: monospace;
              }
              @page {
                size: 80mm 200mm;
                margin: 5mm;
              }
              .no-print {
                display: none !important;
              }
            }
            @media screen {
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: #f5f5f5; 
                margin: 0; 
                padding: 20px;
              }
              .receipt-preview {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-preview">
            ${contentHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    // This would require a PDF library like jsPDF or html2canvas
    // For now, we'll use the print functionality
    handlePrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sales Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content">
          <SalesReceipt sale={sale} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 justify-center no-print">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            📄 Save as PDF
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;
