import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Percent as Soccer } from 'lucide-react';
import { useChampionship } from '../../contexts/ChampionshipContext';

const Layout: React.FC = () => {
  const { loading } = useChampionship();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Soccer className="w-16 h-16 text-primary mx-auto animate-bounce" />
          <p className="mt-4 text-xl font-semibold">Carregando FJJ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;