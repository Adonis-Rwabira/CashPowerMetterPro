import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import DiagnosticPage from './pages/DiagnosticPage';
import DataManagementPage from './pages/DataManagementPage';
import RechargePage from './pages/RechargePage';
import ReadingPage from './pages/ReadingPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import MeterSettingsPage from './pages/MeterSettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import HistoryPage from './pages/HistoryPage';

// Les routes principales, telles que définies dans la NavigationBar
const MAIN_ROUTES = ['/dashboard', '/history', '/diagnostic', '/settings'];

// Un composant qui détermine les props du Layout en fonction de la route
const PageLayoutWrapper: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;

  // Est-ce une page principale ?
  const isMainPage = MAIN_ROUTES.includes(pathname) || pathname.startsWith('/history/');

  // Logique pour les titres des sous-pages
  const getPageInfo = () => {
    // if (pathname.startsWith('/history/')) return { title: 'subPage.history'};
    if (pathname.startsWith('/settings/meter/')) return { title: 'subPage.meterSettings'};
    if (pathname.startsWith('/recharge/')) return { title: 'subPage.rechargeCredit'};
    if (pathname.startsWith('/reading/')) return { title: 'subPage.newReading'};
    if (pathname === '/notifications') return { title: 'subPage.notifications'};
    if (pathname === '/data-management') return { title: 'subPage.dataManagement'};
    if (pathname === '/about') return { title: 'subPage.about'};
    return { title: undefined, backTo: undefined }; // Pas de titre pour les pages principales
  };

  const { title, backTo } = getPageInfo();

  return (
    <Layout pageTitle={isMainPage ? undefined : title} backTo={isMainPage ? undefined : backTo}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Pages principales */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:meterId" element={<HistoryPage />} />
        
        {/* Sous-pages */}
        <Route path="/settings/meter/:meterId" element={<MeterSettingsPage />} />
        <Route path="/reading/:meterId" element={<ReadingPage />} /> 
        <Route path="/recharge/:meterId" element={<RechargePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/data-management" element={<DataManagementPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

const AppRouter: React.FC = () => {
  return <PageLayoutWrapper />;
};

export default AppRouter;
