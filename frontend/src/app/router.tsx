import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../shared/auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { HealthPage } from '../features/health/HealthPage';
import { LoginPage } from '../features/auth/LoginPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { ProductsPage } from '../features/productos/ProductsPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ComprasPage } from '../features/compras/ComprasPage';
import { CajaPage } from '../features/caja/CajaPage';
import { POSPage } from '../features/ventas/POSPage';

export const router = createBrowserRouter([
  {
    path: '/health',
    element: <HealthPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
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
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'productos',
        element: <ProductsPage />,
      },
      {
        path: 'compras',
        element: <ComprasPage />,
      },
      {
        path: 'ventas',
        element: <POSPage />,
      },
      {
        path: 'caja',
        element: <CajaPage />,
      },
    ],
  },
]);
