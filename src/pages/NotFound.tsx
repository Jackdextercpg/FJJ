import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <AlertTriangle className="w-20 h-20 text-secondary mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl mb-6">Página não encontrada</p>
      <Link to="/" className="btn btn-primary flex items-center">
        <Home className="w-4 h-4 mr-2" />
        Voltar para o início
      </Link>
    </div>
  );
};

export default NotFound;