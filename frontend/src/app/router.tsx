import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../shared/auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { HealthPage } from '../features/health/HealthPage';

export const router = createBrowserRouter([
  {
    path: '/health',
    element: <HealthPage />,
  },
  {
    path: '/login',
    element: (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary font-body">
          Login — implementado en el change <code>auth</code>
        </p>
      </div>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
