
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/pharmacy';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PharmacyContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('pharmacyAuth');
    const savedAdmin = localStorage.getItem('pharmacyAdmin');
    
    if (savedAuth && savedAdmin) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password) // In production, use proper password hashing
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
        return false;
      }

      setAdmin(data);
      setIsAuthenticated(true);
      localStorage.setItem('pharmacyAuth', 'true');
      localStorage.setItem('pharmacyAdmin', JSON.stringify(data));
      
      toast({
        title: "Login Successful",
        description: "Welcome to the Pharmacy Management System"
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pharmacyAuth');
    localStorage.removeItem('pharmacyAdmin');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
  };

  const value: PharmacyContextType = {
    admin,
    isAuthenticated,
    login,
    logout
  };

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};
