import { useTranslation } from 'react-i18next';
import ManufacturerBadge from '../components/ManufacturerBadge';

const AboutPage = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="p-4 flex flex-col items-center w-full max-w-2xl mx-auto">
      
      {/* En-tête de l'application */}
      <div className="text-center mb-6 mt-2">
        <h1 className="text-2xl font-bold text-on-surface tracking-wider">CashPowerMetterPro</h1>
        <p className="text-sm text-on-surface-variant">{t('aboutPage.version')}</p>
      </div>

      {/* Plaque Constructeur Principale */}
      <ManufacturerBadge />

      {/* Pied de page Copyright */}
      <div className="mt-8 text-center text-xs text-on-surface-variant/50">
        <p>{t('aboutPage.copyright', { year: currentYear })}</p>
      </div>

    </div>
  );
};

export default AboutPage;
