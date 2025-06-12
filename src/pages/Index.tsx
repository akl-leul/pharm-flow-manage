
import React from 'react';
import { PharmacyProvider, usePharmacy } from '../context/PharmacyContext';
import LoginPage from '../components/LoginPage';
import Dashboard from '../components/Dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated } = usePharmacy();

  return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

const Index = () => {
  return (
    <PharmacyProvider>
      <AppContent />
    </PharmacyProvider>
  );
};

export default Index;
