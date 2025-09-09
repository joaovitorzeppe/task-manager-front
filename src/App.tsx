import { Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { RealtimeProvider } from './contexts/RealtimeContext.tsx';
import routes, { type AppRoute } from './routes/routes.tsx';

const queryClient = new QueryClient();

const ProtectedRoute = ({ roles, children }: { roles?: Array<'admin' | 'manager' | 'developer'>; children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard/tasks" replace />;
  return <>{children}</>;
};

const renderRoutes = (routesList: AppRoute[]) =>
  routesList.map((route) => {
    const element = route.roles ? (
      <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute>
    ) : (
      route.element
    );
    return (
      <Route key={route.path} path={route.path} element={element}>
        {route.children ? renderRoutes(route.children) : null}
      </Route>
    );
  });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RealtimeProvider>
            <Routes>
              {renderRoutes([
                { path: '/dashboard', element: <Navigate to="/dashboard/tasks" replace /> },
                ...routes,
              ])}
            </Routes>
          </RealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;