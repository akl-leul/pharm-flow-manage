import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types/pharmacy';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PharmacyContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  logActivity: (action: string, entityType?: string, entityId?: string, details?: Record<string, unknown>) => Promise<void>;
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedAuth = localStorage.getItem('pharmacyAuth');
    const savedAdmin = localStorage.getItem('pharmacyAdmin');
    const savedTheme = localStorage.getItem('pharmacyTheme') as 'light' | 'dark' | null;
    
    if (savedAuth && savedAdmin) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(savedAdmin));
    }
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('pharmacyTheme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const logActivity = useCallback(async (
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Record<string, unknown>
  ) => {
    if (!admin) return;
    try {
      await supabase.from('activity_logs').insert({
        user_id: admin.id,
        user_name: admin.full_name || admin.username,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, [admin]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        toast({ title: "Login Failed", description: `Database error: ${error.message}`, variant: "destructive" });
        return false;
      }

      if (!data) {
        toast({ title: "Login Failed", description: "Invalid username or password", variant: "destructive" });
        return false;
      }

      const adminData = data as AdminUser;
      setAdmin(adminData);
      setIsAuthenticated(true);
      localStorage.setItem('pharmacyAuth', 'true');
      localStorage.setItem('pharmacyAdmin', JSON.stringify(adminData));

      // Update last login
      await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', adminData.id);
      
      toast({ title: "Welcome back", description: `Signed in as ${adminData.full_name || adminData.username}` });
      return true;
    } catch (error) {
      toast({ title: "Login Failed", description: "An error occurred during login", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    if (admin) {
      logActivity('logout', 'auth', admin.id);
    }
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pharmacyAuth');
    localStorage.removeItem('pharmacyAdmin');
    toast({ title: "Signed out", description: "You have been logged out" });
  };

  return (
    <PharmacyContext.Provider value={{ admin, isAuthenticated, login, logout, theme, toggleTheme, logActivity }}>
      {children}
    </PharmacyContext.Provider>
  );
};
