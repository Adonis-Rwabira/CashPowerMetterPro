import { useSettings, Language, BaseTheme, AccentTheme, DialStyle, MeterFont } from '../contexts/SettingsContext';
import { Sun, Moon, Laptop, Languages, Paintbrush } from 'lucide-react';
import MeterCard from '../components/MeterCard';
import { MeterEntity } from '../db/database';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { t } = useTranslation();
  const { settings, saveSetting, isLoading } = useSettings();

  const dummySubMeter: MeterEntity = {
    id: 'preview-sub-meter',
    type: 'SUB_METER',
    label: t('settings.preview.label'),
    tenant_name: t('settings.preview.tenantName'),
    module_number: 'PREVIEW-01',
    unit_type: 'kWh',
    initial_index: 0,
    current_cached_index: 14520750, 
    current_cached_balance: 42500, 
    status: 'ACTIVE',
    theme_color: '#00E5FF',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleBaseThemeChange = (theme: BaseTheme) => {
    saveSetting('baseTheme', theme);
  };

  const handleAccentThemeChange = (theme: AccentTheme) => {
    saveSetting('accentTheme', theme);
  };

  const handleDialStyleChange = (dialStyle: DialStyle) => {
    saveSetting('dialStyle', dialStyle);
  };

  const handleMeterFontChange = (meterFont: MeterFont) => {
    saveSetting('meterFont', meterFont);
  };

  const changeLanguage = (lng: Language) => {
    saveSetting('language', lng);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">{t('loading')}</div>;
  }

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      <div className="space-y-8">

        {/* --- Sélection de la langue --- */}
        <div>
          <h2 className="text-lg font-semibold text-on-surface-variant mb-3 flex items-center gap-2"><Languages size={20}/> {t('settings.language.title')}</h2>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => changeLanguage('fr')} className={`flex items-center justify-center p-3 rounded-lg border-2 ${settings.language === 'fr' ? 'border-primary bg-primary/10' : 'border-outline'}`}>
              Français
            </button>
            <button onClick={() => changeLanguage('en')} className={`flex items-center justify-center p-3 rounded-lg border-2 ${settings.language === 'en' ? 'border-primary bg-primary/10' : 'border-outline'}`}>
              English
            </button>
            <button onClick={() => changeLanguage('sw')} className={`flex items-center justify-center p-3 rounded-lg border-2 ${settings.language === 'sw' ? 'border-primary bg-primary/10' : 'border-outline'}`}>
              Kiswahili
            </button>
          </div>
        </div>
        
        {/* --- Thème de Base --- */}
        <div>
          <h2 className="text-lg font-semibold text-on-surface-variant mb-3">{t('settings.displayMode')}</h2>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleBaseThemeChange('light')} className={`flex flex-col items-center p-3 rounded-lg border-2 ${settings.baseTheme === 'light' ? 'border-primary bg-primary/10' : 'border-outline'}`}>
              <Sun className="mb-1"/>{t('settings.light')}
            </button>
            <button onClick={() => handleBaseThemeChange('dark')} className={`flex flex-col items-center p-3 rounded-lg border-2 ${settings.baseTheme === 'dark' ? 'border-primary bg-primary/10' : 'border-outline'}`}>
              <Moon className="mb-1"/>{t('settings.dark')}
            </button>
            <button onClick={() => handleBaseThemeChange('system')} className={`flex flex-col items-center p-3 rounded-lg border-2 ${settings.baseTheme === 'system' ? 'border-primary bg-primary/10' : 'border-outline'}`}>
              <Laptop className="mb-1"/>{t('settings.system')}
            </button>
          </div>
        </div>

        {/* --- Thème d'accentuation --- */}
        <div>
          <h2 className="text-lg font-semibold text-on-surface-variant mb-3 flex items-center gap-2"><Paintbrush size={20} />{t('settings.accentTheme.title')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            <button onClick={() => handleAccentThemeChange('industrial')} className={`p-3 rounded-lg border-2 ${settings.accentTheme === 'industrial' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('themes.industrial')}</button>
            <button onClick={() => handleAccentThemeChange('neon')} className={`p-3 rounded-lg border-2 ${settings.accentTheme === 'neon' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('themes.neon')}</button>
            <button onClick={() => handleAccentThemeChange('retro')} className={`p-3 rounded-lg border-2 ${settings.accentTheme === 'retro' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('themes.retro')}</button>
            <button onClick={() => handleAccentThemeChange('lab')} className={`p-3 rounded-lg border-2 ${settings.accentTheme === 'lab' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('themes.lab')}</button>
            <button onClick={() => handleAccentThemeChange('contrast')} className={`p-3 rounded-lg border-2 ${settings.accentTheme === 'contrast' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('themes.contrast')}</button>
          </div>
        </div>

        {/* --- Style des Cadrans --- */}
        <div>
          <h2 className="text-lg font-semibold text-on-surface-variant mb-3">{t('settings.dialStyle')}</h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => handleDialStyleChange('SKEUO_3D_REALISTIC')} className={`p-3 rounded-lg border-2 ${settings.dialStyle === 'SKEUO_3D_REALISTIC' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('settings.dialStyles.realistic')}</button>
            <button onClick={() => handleDialStyleChange('FLAT_MODERN')} className={`p-3 rounded-lg border-2 ${settings.dialStyle === 'FLAT_MODERN' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('settings.dialStyles.flat')}</button>
          </div>
        </div>

        {/* --- Police des Afficheurs --- */}
        <div>
          <h2 className="text-lg font-semibold text-on-surface-variant mb-3">{t('settings.font')}</h2>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button onClick={() => handleMeterFontChange('DIGITAL_7SEG')} className={`font-digital-7seg p-3 rounded-lg border-2 ${settings.meterFont === 'DIGITAL_7SEG' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('settings.fonts.digital')}</button>
            <button onClick={() => handleMeterFontChange('TECH_MONO')} className={`font-tech-mono p-3 rounded-lg border-2 ${settings.meterFont === 'TECH_MONO' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('settings.fonts.mono')}</button>
            <button onClick={() => handleMeterFontChange('CLEAN_SANS')} className={`font-clean-sans p-3 rounded-lg border-2 ${settings.meterFont === 'CLEAN_SANS' ? 'border-primary bg-primary/10' : 'border-outline'}`}>{t('settings.fonts.sans')}</button>
          </div>
        </div>

        {/* --- Aperçu en Direct --- */}
        <div>
            <h2 className="text-lg font-semibold text-on-surface-variant mb-3">{t('settings.preview.title')}</h2>
            <div className='pointer-events-none opacity-75'>
                <MeterCard meter={dummySubMeter} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
