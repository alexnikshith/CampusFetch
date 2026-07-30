import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { MobileFrame } from './components/MobileFrame';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { OrderFormPage } from './pages/OrderFormPage';
import { RunnerPage } from './pages/RunnerPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPage } from './pages/AdminPage';
import { Store } from './types';

export const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-700 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#8c182b] flex items-center justify-center text-white font-black text-xl animate-bounce">
          CF
        </div>
        <p className="text-xs font-bold text-[#8c182b]">Loading CampusFetch Amrita Network...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveScreen = () => {
    // If order detail active
    if (selectedOrderId) {
      return (
        <OrderDetailPage
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      );
    }

    // If order form active
    if (selectedStore) {
      return (
        <OrderFormPage
          store={selectedStore}
          onBack={() => setSelectedStore(null)}
          onOrderSuccess={() => {
            setSelectedStore(null);
            setActiveTab('orders');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onSelectStore={(store) => setSelectedStore(store)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'stores':
        return (
          <HomePage
            onSelectStore={(store) => setSelectedStore(store)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'runner':
        return (
          <RunnerPage
            onOpenChat={(orderId) => setSelectedOrderId(orderId)}
          />
        );
      case 'orders':
        return (
          <OrdersPage
            onSelectOrder={(orderId) => setSelectedOrderId(orderId)}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return (
          <HomePage
            onSelectStore={(store) => setSelectedStore(store)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <Header />
      {renderActiveScreen()}
      <BottomNavigation activeTab={activeTab} setActiveTab={(tab) => {
        setSelectedStore(null);
        setSelectedOrderId(null);
        setActiveTab(tab);
      }} />
    </div>
  );
};

export function App() {
  return (
    <MobileFrame>
      <AppContent />
    </MobileFrame>
  );
}

export default App;
