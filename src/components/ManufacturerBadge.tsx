import { Mail, MessageCircle, Code, Dna } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ManufacturerBadge = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-surface-container p-5 rounded-2xl border border-outline/20 shadow-xl shadow-black/20 w-full max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Dna size={32} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-primary">{t('manufacturerBadge.author')}</h3>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <a href="https://wa.me/243999794391" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface transition-colors">
          <MessageCircle size={18} className="text-primary" />
          <span>+243 999 794 391</span>
        </a>
        <a href="mailto:adonisbitigaywa@gmail.com" className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface transition-colors">
          <Mail size={18} className="text-primary" />
          <span>adonisbitigaywa@gmail.com</span>
        </a>
        <p className="flex items-center gap-3 text-on-surface-variant">
          <Code size={18} className="text-primary" />
          <span>{t('manufacturerBadge.location')}</span>
        </p>
      </div>

      <div className="text-center mt-5 pt-4 border-t border-outline/10">
        <p className="text-xs text-on-surface-variant/50">{t('manufacturerBadge.copyright', { year: currentYear })}</p>
      </div>
    </div>
  );
};

export default ManufacturerBadge;
