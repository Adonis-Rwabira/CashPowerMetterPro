import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { resetDatabase, exportData, importData } from '../db/repositories';
import { Download, Upload, PowerOff, AlertTriangle } from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';

const DataManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashpowermetterpro_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('dataManagementPage.toast.exportSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('dataManagementPage.toast.exportError'));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await importData(content);
        toast.success(t('dataManagementPage.toast.importSuccess'));
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : t('dataManagementPage.toast.invalidFile');
        toast.error(t('dataManagementPage.toast.importError', { error: errorMessage }));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    try {
        await resetDatabase();
        toast.success(t('dataManagementPage.toast.resetSuccess'));
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        console.error(error);
        toast.error(t('dataManagementPage.toast.resetError'));
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleFactoryReset}
        title={t('dataManagementPage.resetModalTitle')}
        message={t('dataManagementPage.resetModalMessage')}
        confirmWord="RESET"
        confirmButtonText={t('dataManagementPage.resetModalConfirmButton')}
        icon={<PowerOff size={32} className="text-on-error-container" />}
      />

      <div className="space-y-8 max-w-lg mx-auto">
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2"><Download size={20} /> {t('dataManagementPage.exportTitle')}</h2>
          <p className="text-sm text-on-surface-variant">
            {t('dataManagementPage.exportDescription')}
          </p>
          <button onClick={handleExport} className="w-full h-12 bg-secondary text-on-secondary rounded-xl font-semibold flex items-center justify-center gap-2">
            {t('dataManagementPage.exportButton')}
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2"><Upload size={20} /> {t('dataManagementPage.importTitle')}</h2>
          <p className="text-sm text-on-surface-variant">
            {t('dataManagementPage.importDescription')}
          </p>
          <input type="file" id="import-file" accept=".json" onChange={handleImport} className="hidden" />
          <label htmlFor="import-file" className={`w-full h-12 bg-secondary text-on-secondary rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer ${isImporting ? 'opacity-50' : ''}`}>
            {isImporting ? t('dataManagementPage.importingButton') : t('dataManagementPage.importButton')}
          </label>
        </div>

        <div className="border-t border-error/20 mt-8 pt-6 space-y-3">
          <h3 className="text-lg font-bold text-error flex items-center gap-2">
            <AlertTriangle size={20}/> {t('dataManagementPage.dangerZoneTitle')}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {t('dataManagementPage.dangerZoneDescription')}
          </p>
          <button onClick={() => setIsResetModalOpen(true)} className="w-full h-12 bg-error text-on-error rounded-xl font-semibold flex items-center justify-center gap-2">
            <PowerOff size={20}/> {t('dataManagementPage.factoryResetButton')}
          </button>
        </div>

      </div>
    </>
  );
};

export default DataManagementPage;
