import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedPage from './components/ProtectedPage';
import HomeRedirect from './components/HomeRedirect';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedPage />} />
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;