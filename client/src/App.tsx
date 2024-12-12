import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
const LoadingScreen = (): JSX.Element => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Componente para proteger rotas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <BaseLayout>{children}</BaseLayout>;
};

// Componente para rotas públicas
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return <Navigate to="/compare" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes(): JSX.Element {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
              // Atualizar ranking ou fazer outras ações necessárias
              console.log('Comparação completada');
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
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 