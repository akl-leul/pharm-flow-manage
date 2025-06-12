
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, Sale, Admin } from '../types/pharmacy';
import { toast } from '@/hooks/use-toast';

interface PharmacyContextType {
  admin: Admin | null;
  medicines: Medicine[];
  sales: Sale[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  editSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicineStock: (id: string, newStock: number) => void;
  searchSales: (query: string) => Sale[];
  filterSalesByDate: (startDate: string, endDate: string) => Sale[];
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: '1',
      name: 'Paracetamol 500mg',
      stock: 100,
      price: 2.50,
      category: 'Pain Relief',
      expiryDate: '2025-12-31',
      minStock: 20
    },
    {
      id: '2',
      name: 'Amoxicillin 250mg',
      stock: 50,
      price: 8.75,
      category: 'Antibiotic',
      expiryDate: '2025-08-15',
      minStock: 10
    },
    {
      id: '3',
      name: 'Ibuprofen 400mg',
      stock: 75,
      price: 3.20,
      category: 'Pain Relief',
      expiryDate: '2025-10-20',
      minStock: 15
    }
  ]);
  const [sales, setSales] = useState<Sale[]>([]);

  const defaultAdmin: Admin = {
    id: '1',
    username: 'admin',
    password: 'pharmacy123'
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('pharmacyAuth');
    if (savedAuth) {
      setIsAuthenticated(true);
      setAdmin(defaultAdmin);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === defaultAdmin.username && password === defaultAdmin.password) {
      setAdmin(defaultAdmin);
      setIsAuthenticated(true);
      localStorage.setItem('pharmacyAuth', 'true');
      toast({
        title: "Login Successful",
        description: "Welcome to the Pharmacy Management System"
      });
      return true;
    }
    toast({
      title: "Login Failed",
      description: "Invalid username or password",
      variant: "destructive"
    });
    return false;
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pharmacyAuth');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
  };

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString()
    };
    
    setSales(prev => [newSale, ...prev]);
    
    // Update medicine stock
    setMedicines(prev => prev.map(medicine => 
      medicine.id === saleData.medicineId 
        ? { ...medicine, stock: medicine.stock - saleData.quantity }
        : medicine
    ));

    toast({
      title: "Sale Added",
      description: `Sale of ${saleData.medicineName} recorded successfully`
    });
  };

  const editSale = (id: string, updatedSale: Partial<Sale>) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, ...updatedSale } : sale
    ));
    toast({
      title: "Sale Updated",
      description: "Sale record has been updated successfully"
    });
  };

  const deleteSale = (id: string) => {
    const saleToDelete = sales.find(sale => sale.id === id);
    if (saleToDelete) {
      // Restore stock
      setMedicines(prev => prev.map(medicine => 
        medicine.id === saleToDelete.medicineId 
          ? { ...medicine, stock: medicine.stock + saleToDelete.quantity }
          : medicine
      ));
      
      setSales(prev => prev.filter(sale => sale.id !== id));
      toast({
        title: "Sale Deleted",
        description: "Sale record has been deleted and stock restored"
      });
    }
  };

  const addMedicine = (medicineData: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: Date.now().toString()
    };
    setMedicines(prev => [...prev, newMedicine]);
    toast({
      title: "Medicine Added",
      description: `${medicineData.name} has been added to inventory`
    });
  };

  const updateMedicineStock = (id: string, newStock: number) => {
    setMedicines(prev => prev.map(medicine => 
      medicine.id === id ? { ...medicine, stock: newStock } : medicine
    ));
  };

  const searchSales = (query: string): Sale[] => {
    return sales.filter(sale => 
      sale.medicineName.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterSalesByDate = (startDate: string, endDate: string): Sale[] => {
    return sales.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    );
  };

  const value: PharmacyContextType = {
    admin,
    medicines,
    sales,
    isAuthenticated,
    login,
    logout,
    addSale,
    editSale,
    deleteSale,
    addMedicine,
    updateMedicineStock,
    searchSales,
    filterSalesByDate
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};
