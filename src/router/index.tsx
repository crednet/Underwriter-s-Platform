import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { ProtectedRoute } from '../components/auth';
import { MainLayout } from '../components/layout';
import { ROUTES } from '../constants';
import {
  LoginPage,
  DashboardPage,
  BVNPage,
  SelfiePage,
  LocationPage,
  BankStatementPage,
  ApplicationsPage,
  ApplicationDetailsPage,
  AuditPage,
} from '../pages';

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LoginPage />
          }
        />
        
        {/* Protected Routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.APPLICATIONS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ApplicationsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.APPLICATION_DETAILS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ApplicationDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.BVN}
          element={
            <ProtectedRoute>
              <MainLayout>
                <BVNPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.SELFIE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <SelfiePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.LOCATION}
          element={
            <ProtectedRoute>
              <MainLayout>
                <LocationPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.BANK_STATEMENT}
          element={
            <ProtectedRoute>
              <MainLayout>
                <BankStatementPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path={ROUTES.AUDIT}
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'SENIOR_UNDERWRITER']}>
              <MainLayout>
                <AuditPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to dashboard or login */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

