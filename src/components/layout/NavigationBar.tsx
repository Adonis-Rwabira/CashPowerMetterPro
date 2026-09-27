import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, BarChart, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: Home, labelKey: 'navigation.home' },
  { to: '/diagnostic', icon: BarChart, labelKey: 'navigation.diagnostics' },
  { to: '/history', icon: History, labelKey: 'navigation.history' },
  { to: '/settings', icon: Settings, labelKey: 'navigation.settings' },
];

const NavigationBar: React.FC = () => {
  const { t } = useTranslation();
  const showLabels = false;

  return (
    <nav className="fixed bottom-0 left-1 right-1 h-14 bg-surface-container-low/80 backdrop-blur-md border border-white/10 flex items-center justify-around z-50 rounded-full">
      {navItems.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
          }
        >
          <Icon size={22} />
          {showLabels && <span className="text-xs mt-1">{t(labelKey)}</span>}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavigationBar;
