import React, { useState } from "react";
import { PharmacyProvider, usePharmacy } from "../context/PharmacyContext";
import LoginPage from "../components/LoginPage";
import Dashboard from "../components/Dashboard";

const AppContent: React.FC = () => {
  const { isAuthenticated } = usePharmacy();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar showing the current tab */}
      <header className="bg-white shadow border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-teal-800">
          Active Tab: <span className="capitalize">{activeTab}</span>
        </h1>
      </header>

      {/* Dashboard with tab control */}
      <main className="flex-1">
        <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <PharmacyProvider>
      <AppContent />
    </PharmacyProvider>
  );
};

export default Index;
