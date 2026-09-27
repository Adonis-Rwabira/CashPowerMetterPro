import React from 'react';
import { Zap, Info, Database, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './notifications/NotificationBell';
import DropdownMenu from './DropdownMenu';
import { useTranslation } from 'react-i18next';

interface TopAppBarProps {
  pageTitle?: string;
  backLink?: string;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ pageTitle, backLink }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-background/80 backdrop-blur-xl border-b border-outline-variant">
      <div className="h-14 px-4 flex items-center justify-between">
        {pageTitle ? (
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-on-surface">{pageTitle}</h1>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap size={18} strokeWidth={2.5}/>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-on-surface">CashPowerMetterPro</h1>
          </div>
        )}

        <div className="flex items-center gap-2">
          <NotificationBell /> 
          
          <DropdownMenu items={[
            {
              label: t('topAppBar.importExport'),
              action: () => navigate('/data-management'),
              icon: <Database size={16} />
            },
            {
              label: t('topAppBar.about'),
              action: () => navigate('/about'),
              icon: <Info size={16} />
            }
          ]} />
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
