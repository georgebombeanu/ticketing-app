import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Tickets from './pages/tickets/Tickets';
import TicketDetail from './pages/tickets/TicketDetail';
import CreateTicket from './pages/tickets/CreateTicket';
import EditTicket from './pages/tickets/EditTicket';
import Users from './pages/users/Users';
import Departments from './pages/departments/Departments';
import Teams from './pages/teams/Teams';
import FAQ from './pages/faq/FAQ';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Tickets */}
                  <Route path="tickets" element={<Tickets />} />
                  <Route path="tickets/create" element={<CreateTicket />} />
                  <Route path="tickets/:id" element={<TicketDetail />} />
                  <Route path="tickets/:id/edit" element={<EditTicket />} />
                  
                  {/* Users - Admin/Manager only */}
                  <Route 
                    path="users" 
                    element={
                      <ProtectedRoute requireRole={['Admin', 'Manager']}>
                        <Users />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Departments - Admin/Manager only */}
                  <Route 
                    path="departments" 
                    element={
                      <ProtectedRoute requireRole={['Admin', 'Manager']}>
                        <Departments />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Teams - Admin/Manager only */}
                  <Route 
                    path="teams" 
                    element={
                      <ProtectedRoute requireRole={['Admin', 'Manager']}>
                        <Teams />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* FAQ */}
                  <Route path="faq" element={<FAQ />} />
                  
                  {/* Profile */}
                  <Route path="profile" element={<Profile />} />
                </Route>
                
                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;