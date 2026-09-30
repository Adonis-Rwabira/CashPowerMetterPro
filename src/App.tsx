import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AppRouter from './AppRouter';
import { db } from './db/database';
import { getGlobalMeter, createMeter } from './db/repositories';

const NotificationToast = ({ count, onDismiss }: { count: number, onDismiss: () => void }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    db.notifications.where('is_read').equals(0).modify({ is_read: 1 });
    navigate('/notifications');
    onDismiss();
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-primary text-on-primary p-4 pr-10 rounded-lg shadow-2xl cursor-pointer flex items-center gap-4 animate-fade-in-up"
    >
        <Bell className="w-6 h-6" />
        <div>
            <p className="font-bold">Vous avez {count} nouvelle(s) alerte(s)</p>
            <p className="text-sm">Cliquez pour consulter.</p>
        </div>
    </div>
  );
};

const AppStartupNotification: React.FC = () => {
    useEffect(() => {
        const checkNotifications = async () => {
            const unreadCount = await db.notifications.where('is_read').equals(0).count();

            if (unreadCount > 0) {
                toast.custom(
                    (t) => (
                        <div
                            className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}>
                            <NotificationToast 
                                count={unreadCount} 
                                onDismiss={() => toast.dismiss(t.id)} 
                            />
                        </div>
                    ),
                    { 
                        duration: 6000, 
                        position: 'top-right',
                    }
                );
            }
        };

        setTimeout(checkNotifications, 1500);

    }, []);

    return null;
}

const EnsureGlobalMeterExists: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const checkAndCreateGlobalMeter = async () => {
      try {
        const existingGlobalMeter = await getGlobalMeter();
        if (!existingGlobalMeter) {
          console.log("No global meter found. Creating a default one.");
          await createMeter({
            type: 'GLOBAL',
            label: t('meter.defaultOwner'),
            module_number: 'GLOBAL',
            initial_index: 0,
            current_cached_index: 0,
            current_cached_balance: 0,
            unit_type: 'kWh',
            status: 'ACTIVE',
            theme_color: '#FFB300',
          });
          console.log("Default global meter created successfully.");
        } else {
          console.log("Global meter already exists.");
        }
      } catch (error) {
        console.error("Error checking or creating global meter:", error);
        toast.error("Failed to initialize the main meter.");
      }
    };

    const timer = setTimeout(checkAndCreateGlobalMeter, 50);
    
    return () => clearTimeout(timer);
  }, [t]);

  return null;
};

function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('app-loaded');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
        <Toaster />
        <EnsureGlobalMeterExists />
        <AppStartupNotification />
        <AppRouter />
    </>
  );
}

export default App;
