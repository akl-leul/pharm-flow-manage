import React, { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMedicines } from '../hooks/useMedicines';
import { useSales } from '../hooks/useSales';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#C9CBCF', '#8DD1E1', '#A4DE6C', '#D0ED57', '#FF9F40',
  '#FF6B6B', '#6B5B95', '#FFD700', '#2E8B57', '#40E0D0',
];

// Simple modal component for preview popup
const Modal: React.FC<{open: boolean, onClose: () => void, children: React.ReactNode}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ReportsSection: React.FC = () => {
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: medicines = [], isLoading: medicinesLoading } = useMedicines();

  const reportRef = useRef<HTMLDivElement>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  if (salesLoading || medicinesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const totalSales = sales.length;
  const lowStockItems = medicines.filter(med => med.stock <= med.min_stock);

  const categoryData = medicines.reduce((acc, medicine) => {
    const medicineSales = sales.filter(sale => sale.medicine_id === medicine.id);
    const categoryRevenue = medicineSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const existingCategory = acc.find(item => item.name === medicine.category);
    if (existingCategory) {
      existingCategory.value += categoryRevenue;
    } else {
      acc.push({ name: medicine.category, value: categoryRevenue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const medicinesSalesData = medicines
    .map(medicine => {
      const medicineSales = sales.filter(sale => sale.medicine_id === medicine.id);
      const totalQuantity = medicineSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const totalRevenue = medicineSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
      return {
        name: medicine.name,
        quantity: totalQuantity,
        revenue: totalRevenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySalesData = last7Days.map(date => {
    const daySales = sales.filter(sale => sale.sale_date === date);
    const revenue = daySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue: revenue,
      sales: daySales.length,
    };
  });

  // Create image preview for modal
  const handlePreviewExport = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    setPreviewImg(imgData);
    setPreviewOpen(true);
  };

  // Generate & save PDF after user confirms
  const handleDownloadPDF = () => {
    if (!previewImg) return;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(previewImg);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let position = 0;
    if (imgHeight < pdfHeight) {
      pdf.addImage(previewImg, 'PNG', 0, position, imgWidth, imgHeight);
    } else {
      let heightLeft = imgHeight;
      while (heightLeft > 0) {
        pdf.addImage(previewImg, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    }
    pdf.save('Report.pdf');
    setPreviewOpen(false);
    setPreviewImg(null);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePreviewExport}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <FileText className="w-5 h-5" />
         Preview and Export PDF
        </button>
      </div>

      <div ref={reportRef} className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-green-100 text-green-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ETB {totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-green-700">All time revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-100 text-blue-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs">Total transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-100 text-yellow-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Medicines</CardTitle>
              <Package className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medicines.length}</div>
              <p className="text-xs">In inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-red-100 text-red-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs">Items need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LineChart (Daily Sales) */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
              <CardDescription>Revenue and number of sales per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue (ETB)" />
                  <Line type="monotone" dataKey="sales" stroke="#10B981" name="Sales Count" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Category: PieChart + Bump Style */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across medicine categories</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => [`ETB ${Number(value).toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>

              {/* Simulated Bump Chart Below */}
              <div className="mt-6 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={categoryData.map((d, i) => ({ ...d, rank: i + 1 }))}
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis type="number" reversed domain={[1, categoryData.length]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rank"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ r: 6, fill: '#EF4444' }}
                      name="Revenue Rank"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Medicines: Bar + Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Medicines</CardTitle>
            <CardDescription>Best performing medicines by revenue</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={medicinesSalesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue (ETB)" />
              </BarChart>
            </ResponsiveContainer>

            {/* Pie Chart for same data */}
            <div className="mt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={medicinesSalesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {medicinesSalesData.map((entry, index) => (
                      <Cell key={`cell-med-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => [`ETB ${Number(value).toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
              <CardDescription className="text-red-600">
                The following medicines are running low and need restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map(medicine => (
                  <div
                    key={medicine.id}
                    className="flex justify-between items-center p-2 bg-white rounded border"
                  >
                    <span className="font-medium">{medicine.name}</span>
                    <span className="text-red-600 font-semibold">
                      {medicine.stock} remaining (Min: {medicine.min_stock})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">Report Preview</h2>
        {previewImg && (
          <img
            src={previewImg}
            alt="Report Preview"
            className="w-full h-auto border rounded"
          />
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => {
              setPreviewOpen(false);
              setPreviewImg(null);
            }}
            className="px-4 py-2 border rounded bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Download PDF
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ReportsSection;
