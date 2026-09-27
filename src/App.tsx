import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AppRouter from './AppRouter';
import { db } from './db/database';

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
        <AppStartupNotification />
        <AppRouter />
    </>
  );
}

export default App;
