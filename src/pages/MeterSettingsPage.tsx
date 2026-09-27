import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getMeterById, updateMeterDetails, deleteMeterAndAssociatedData } from '../db/repositories';
import { MeterEntity } from '../db/database';
import { Save, Trash2, AlertTriangle, User, Tag, Hash } from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';

const MeterSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { meterId } = useParams<{ meterId: string }>();
  const navigate = useNavigate();

  const meter = useLiveQuery(() => getMeterById(meterId!), [meterId]);

  const [formData, setFormData] = useState<Partial<MeterEntity>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (meter) {
      setFormData({
        label: meter.label,
        tenant_name: meter.tenant_name,
        module_number: meter.module_number,
      });
    }
  }, [meter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!meterId) return;
    try {
      await updateMeterDetails(meterId, {
        label: formData.label,
        tenant_name: formData.tenant_name,
        module_number: formData.module_number,
      });
      toast.success(t('meterSettingsPage.toast.updateSuccess'));
      navigate('/dashboard');
    } catch (error) {
        console.error(error);
        toast.error(t('meterSettingsPage.toast.updateError'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!meterId) return;
    try {
      await deleteMeterAndAssociatedData(meterId);
      toast.success(t('meterSettingsPage.toast.deleteSuccess'));
      setIsDeleteModalOpen(false);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(t('meterSettingsPage.toast.deleteError'));
    }
  };

  if (!meter) {
    return <div className="p-4 text-center">{t('meterSettingsPage.loading')}</div>;
  }

  return (
    <>
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('meterSettingsPage.deleteModal.title', { meterName: meter.label })}
        message={t('meterSettingsPage.deleteModal.message')}
        confirmWord={t('meterSettingsPage.deleteModal.confirmWord')}
        confirmButtonText={t('meterSettingsPage.deleteModal.confirmButton')}
        icon={<Trash2 size={32} className="text-on-error-container" />}
      />

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-on-surface mb-4">{t('meterSettingsPage.pageTitle')}</h2>
          
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-on-surface-variant flex items-center gap-2"><Tag size={14}/> {t('meterSettingsPage.meterLabel')}</span>
            <input
              type="text"
              name="label"
              value={formData.label || ''}
              onChange={handleInputChange}
              className="bg-surface-container-high border border-outline/50 rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-on-surface-variant flex items-center gap-2"><User size={14}/> {t('meterSettingsPage.tenantNameLabel')}</span>
            <input
              type="text"
              name="tenant_name"
              value={formData.tenant_name || ''}
              onChange={handleInputChange}
              className="bg-surface-container-high border border-outline/50 rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-on-surface-variant flex items-center gap-2"><Hash size={14}/> {t('meterSettingsPage.moduleNumberLabel')}</span>
            <input
              type="text"
              name="module_number"
              value={formData.module_number || ''}
              onChange={handleInputChange}
              className="bg-surface-container-high border border-outline/50 rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </label>
        </div>

        <button
          onClick={handleSave}
          className="w-full h-12 bg-primary text-on-primary rounded-xl font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-md text-sm"
        >
          <Save size={20}/>
          {t('meterSettingsPage.saveButton')}
        </button>

        <div className="border-t border-error/20 mt-8 pt-6 space-y-3">
          <h3 className="text-lg font-bold text-error flex items-center gap-2">
            <AlertTriangle size={20}/>
            {t('meterSettingsPage.dangerZoneTitle')}
          </h3>
          <p className="text-sm text-on-surface-variant">
            {t('meterSettingsPage.dangerZoneDescription')}
          </p>
          
          <button onClick={() => setIsDeleteModalOpen(true)} className="w-full h-12 bg-error text-on-error rounded-xl font-semibold flex items-center justify-center gap-2">
            <Trash2 size={20}/> {t('meterSettingsPage.deleteButton')}
          </button>
        </div>

      </div>
    </>
  );
};

export default MeterSettingsPage;
