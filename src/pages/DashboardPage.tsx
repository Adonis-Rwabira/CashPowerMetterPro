import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import MeterCard from '../components/MeterCard';
import AddMeterModal from '../components/modals/AddMeterModal';
import { getAllMeters } from '../db/repositories';
import { MeterType } from '../db/database';
import { Plus, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const meters = useLiveQuery(() => getAllMeters(), []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMeterType, setModalMeterType] = useState<MeterType>('SUB_METER');

  const openModal = (type: MeterType) => {
    setModalMeterType(type);
    setIsModalOpen(true);
  };

  const globalMeter = meters?.find(m => m.type === 'GLOBAL');
  const subMeters = meters?.filter(m => m.type === 'SUB_METER') || [];

  return (
    <>
      <AddMeterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        meterType={modalMeterType} 
      />

      <div className="flex flex-col gap-5">
        {globalMeter ? (
          <MeterCard meter={globalMeter} />
        ) : (
          <div className="text-center p-4 bg-surface-container-low rounded-xl border border-outline/50">
            <p className="text-on-surface-variant">{t('dashboard.noGlobalMeter')}</p>
            <button onClick={() => openModal('GLOBAL')} className="mt-2 w-full py-3.5 px-4 rounded-xl border border-dashed border-primary/40 hover:border-primary/80 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-primary hover:text-primary/90 text-xs font-medium">
              <Plus size={16} />
              {t('dashboard.configureGlobalMeter')}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-on-surface">{t('dashboard.subMeters')}</h2>
            {subMeters && <span className="text-xs font-mono text-on-surface-variant">{t('dashboard.active', { count: subMeters.length })}</span>}
          </div>
          <button className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-mono transition-colors">
            <Filter size={15} />
            {t('dashboard.all')}
          </button>
        </div>

        <div className="space-y-3">
          {subMeters.map(meter => (
            <MeterCard key={meter.id} meter={meter} />
          ))}
          {globalMeter && (
            <button onClick={() => openModal('SUB_METER')} className="w-full py-3.5 px-4 rounded-xl border border-dashed border-primary/40 hover:border-primary/80 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-primary hover:text-primary/90 text-xs font-medium">
              <Plus size={16} />
              {t('dashboard.addSubMeter')}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
