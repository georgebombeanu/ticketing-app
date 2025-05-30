import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import AdminOverview from './pages/admin/AdminOverview';

// Auth Pages
import Login from './pages/auth/Login';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/NotFound';

// Ticket Pages
import Tickets from './pages/tickets/Tickets';
import TicketDetail from './pages/tickets/TicketDetail';
import CreateTicket from './pages/tickets/CreateTicket';
import EditTicket from './pages/tickets/EditTicket';
import KanbanView from './pages/tickets/KanbanView';

// Management Pages (Admin/Manager only)
import Users from './pages/users/Users';
import Departments from './pages/departments/Departments';
import Teams from './pages/teams/Teams';

// Admin Pages (Admin only)
import TicketCategories from './pages/admin/TicketCategories';
import TicketPriorities from './pages/admin/TicketPriorities';
import TicketStatuses from './pages/admin/TicketStatuses';

// Other Pages
import FAQ from './pages/faq/FAQ';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ToastProvider>
          <NotificationProvider>
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
                    {/* Default redirect to dashboard */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Dashboard */}
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Tickets - Available to all authenticated users */}
                    <Route path="tickets">
                      <Route index element={<Tickets />} />
                      <Route path="create" element={<CreateTicket />} />
                      <Route path="kanban" element={<KanbanView />} />
                      <Route path=":id" element={<TicketDetail />} />
                      <Route path=":id/edit" element={<EditTicket />} />
                    </Route>
                    
                    {/* User Management - Admin/Manager only */}
                    <Route 
                      path="users" 
                      element={
                        <ProtectedRoute requireRole={['Admin', 'Manager']}>
                          <Users />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Department Management - Admin/Manager only */}
                    <Route 
                      path="departments" 
                      element={
                        <ProtectedRoute requireRole={['Admin', 'Manager']}>
                          <Departments />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Team Management - Admin/Manager only */}
                    <Route 
                      path="teams" 
                      element={
                        <ProtectedRoute requireRole={['Admin', 'Manager']}>
                          <Teams />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin Management - Admin only */}
                    <Route path="admin">
                      <Route 
                        index
                        element={
                          <ProtectedRoute requireRole={['Admin']}>
                            <AdminOverview />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="categories" 
                        element={
                          <ProtectedRoute requireRole={['Admin']}>
                            <TicketCategories />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="priorities" 
                        element={
                          <ProtectedRoute requireRole={['Admin']}>
                            <TicketPriorities />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="statuses" 
                        element={
                          <ProtectedRoute requireRole={['Admin']}>
                            <TicketStatuses />
                          </ProtectedRoute>
                        } 
                      />
                    </Route>
                    
                    {/* FAQ - Available to all authenticated users */}
                    <Route path="faq" element={<FAQ />} />
                    
                    {/* Profile - Available to all authenticated users */}
                    <Route path="profile" element={<Profile />} />
                    
                    {/* Settings - Available to all authenticated users */}
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  
                  {/* Catch all - 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </AuthProvider>
          </NotificationProvider>
        </ToastProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;