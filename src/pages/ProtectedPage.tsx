import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-6 text-4xl font-bold text-gray-900">Bem-vindo(a), {user?.name}!</h1>
      <p className="text-xl text-gray-700">Esta é uma página protegida.</p>
      <p className="mt-2 text-sm text-gray-500">Seu papel: {user?.role}</p>
      <button
        onClick={() => navigate('/')}
        className="mt-8 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Ir para a Página Inicial
      </button>
    </div>
  );
};

export default ProtectedPage;