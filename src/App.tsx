import { Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import HomeRedirect from './components/HomeRedirect';
import Login from './pages/Login.tsx';
import DashboardLayout from './layouts/DashboardLayout';
import Users from './pages/Users';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/users" replace />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/users" element={<Users />} />
              <Route path="/dashboard/projects" element={<Projects />} />
              <Route path="/dashboard/tasks" element={<Tasks />} />
            </Route>
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;