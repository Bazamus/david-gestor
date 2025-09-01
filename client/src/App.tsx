// React import removed as it's not needed in modern React
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import MainLayout from '@/components/layout/MainLayout';

// Page components
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import CreateProject from '@/pages/CreateProject';
import EditProject from '@/pages/EditProject';
import Tasks from '@/pages/Tasks';
import TaskDetail from '@/pages/TaskDetail';
import Kanban from '@/pages/Kanban';
import OverdueTasks from '@/pages/OverdueTasks';
import UpcomingTasks from '@/pages/UpcomingTasks';
import Reportes from '@/pages/Reportes';

import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import CreateTask from '@/pages/CreateTask';
import EditTask from '@/pages/EditTask';
import Timeline from '@/pages/Timeline';
import Times from '@/pages/Times';

// Context providers
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { CommandPaletteProvider } from '@/contexts/CommandPaletteContext';
import { AuthProvider } from '@/contexts/AuthContext';

// PWA Components
import { OfflineBanner, InstallPrompt, UpdatePrompt } from '@/pwa';

// Protected routes
import { ProtectedRoute, AdminRoute } from '@/components/common/ProtectedRoute';

// Error boundary
import ErrorBoundary from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <CommandPaletteProvider>
              <div className="min-h-screen bg-background text-foreground">
                {/* PWA Components */}
                <OfflineBanner />
                <InstallPrompt />
                <UpdatePrompt />
                
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Redirect root based on user role */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Main application routes with layout and protection */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
                    {/* Dashboard - Admin only */}
                    <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                    
                    {/* Projects - Admin only */}
                    <Route path="projects" element={<AdminRoute><Projects /></AdminRoute>} />
                    <Route path="projects/new" element={<AdminRoute><CreateProject /></AdminRoute>} />
                    <Route path="projects/:id" element={<AdminRoute><ProjectDetail /></AdminRoute>} />
                    <Route path="projects/:id/edit" element={<AdminRoute><EditProject /></AdminRoute>} />
                    <Route path="projects/:id/kanban" element={<AdminRoute><Kanban /></AdminRoute>} />
                    
                    {/* Tasks - Admin only */}
                    <Route path="tasks" element={<AdminRoute><Tasks /></AdminRoute>} />
                    <Route path="tasks/new" element={<AdminRoute><CreateTask /></AdminRoute>} />
                    <Route path="tasks/:id" element={<AdminRoute><TaskDetail /></AdminRoute>} />
                    <Route path="projects/:projectId/tasks/new" element={<AdminRoute><CreateTask /></AdminRoute>} />
                    <Route path="tasks/:id/edit" element={<AdminRoute><EditTask /></AdminRoute>} />
                    
                    {/* Task Lists - Admin only */}
                    <Route path="overdue-tasks" element={<AdminRoute><OverdueTasks /></AdminRoute>} />
                    <Route path="upcoming-tasks" element={<AdminRoute><UpcomingTasks /></AdminRoute>} />
                    
                    {/* Kanban Global - Admin only */}
                    <Route path="kanban" element={<AdminRoute><Kanban /></AdminRoute>} />
                    
                    {/* Reportes - Available for both admin and cliente */}
                    <Route path="reportes" element={<Reportes />} />
                    
                    {/* Timeline - Admin only */}
                    <Route path="timeline" element={<AdminRoute><Timeline /></AdminRoute>} />
                    
                    {/* Times - Admin only */}
                    <Route path="times" element={<AdminRoute><Times /></AdminRoute>} />
                    
                    {/* Settings - Admin only */}
                    <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
                  </Route>
                  
                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </CommandPaletteProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;