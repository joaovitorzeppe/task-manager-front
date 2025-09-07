import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import navigation from '../routes/navigation';

const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-64 flex-col bg-white p-4 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>
            <div className="truncate text-xs text-gray-500">{user?.email}</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navigation.map((group) => {
            const items = group.items.filter((item) => !item.roles || item.roles.includes(user?.role as any));
            if (items.length === 0) return null;
            return (
              <div key={group.label} className="mb-4 flex flex-col">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{group.label}</div>
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `rounded px-3 py-2 text-sm ${isActive ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}

          <div className="flex-1" />

          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="mt-4 rounded bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200"
          >
            Sair
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-scroll">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;


