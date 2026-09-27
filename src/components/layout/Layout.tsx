import React from 'react';
import TopAppBar from '../TopAppBar';
import NavigationBar from './NavigationBar';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  backTo?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle, backTo }) => {
  const { t } = useTranslation();
  const isSubPage = !!pageTitle;

  const translatedTitle = pageTitle ? t(pageTitle) : undefined;

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-sans antialiased">
      <TopAppBar pageTitle={translatedTitle} backLink={backTo} />

      <main className={`flex-1 w-full pt-20 max-w-lg mx-auto flex flex-col gap-5 px-4 ${isSubPage ? 'pb-8' : 'pb-24'}`}>
        {children}
      </main>

      {!isSubPage && <NavigationBar />}
    </div>
  );
};

export default Layout;
