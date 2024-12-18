import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { SetupBGGPage } from './pages/SetupBGGPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { RankingPage } from './pages/RankingPage';
import { DimensionsPage } from './pages/DimensionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { BaseLayout } from './components/layout/BaseLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/auth-hooks';
import './styles/globals.css';

// Componente de loading
const LoadingScreen = (): JSX.Element => {
  console.log('Rendering LoadingScreen');
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

// Componente para proteger rotas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { user, isLoading } = useAuth();
  console.log('PrivateRoute:', { user, isLoading });
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <BaseLayout>{children}</BaseLayout>;
};

// Componente para rotas públicas
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { user, isLoading } = useAuth();
  console.log('PublicRoute:', { user, isLoading });
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    console.log('User found, redirecting to compare');
    return <Navigate to="/compare" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes(): JSX.Element {
  const { isLoading } = useAuth();
  console.log('AppRoutes:', { isLoading });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={
        <PublicRoute>
          <WelcomePage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      
      {/* Rotas protegidas */}
      <Route path="/setup-bgg" element={
        <PrivateRoute>
          <SetupBGGPage />
        </PrivateRoute>
      } />
      
      <Route path="/compare" element={
        <PrivateRoute>
          <ComparisonPage 
            dimensionId="default"
            dimensionName="Geral"
            onComparisonComplete={() => {
              console.log('Comparison completed');
            }}
          />
        </PrivateRoute>
      } />

      <Route path="/ranking" element={
        <PrivateRoute>
          <RankingPage />
        </PrivateRoute>
      } />

      <Route path="/dimensions" element={
        <PrivateRoute>
          <DimensionsPage />
        </PrivateRoute>
      } />

      <Route path="/profile" element={
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      } />

      {/* Página 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App(): JSX.Element {
  console.log('Rendering App');
  return (
    <AppRoutes />
  );
}

export default App; 