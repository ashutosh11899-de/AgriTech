import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthPage from '@/pages/AuthPage';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import FarmsPage from '@/pages/FarmsPage';
import CropsPage from '@/pages/CropsPage';
import WeatherPestsPage from '@/pages/WeatherPestsPage';
import MarketplacePage from '@/pages/MarketplacePage';
import OrdersPage from '@/pages/OrdersPage';
import ExpertsPage from '@/pages/ExpertsPage';
import AdminPage from '@/pages/AdminPage';
import ProfilePage from '@/pages/ProfilePage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-300 border-t-transparent mx-auto" />
          <p className="text-green-100 text-sm mt-4">Loading AgriTech...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  function renderPage() {
    switch (currentPage) {
      case 'farms': return <FarmsPage />;
      case 'crops': return <CropsPage />;
      case 'weather': return <WeatherPestsPage />;
      case 'marketplace': return <MarketplacePage />;
      case 'orders': return <OrdersPage />;
      case 'experts': return <ExpertsPage />;
      case 'admin': return <AdminPage />;
      case 'profile': return <ProfilePage />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
