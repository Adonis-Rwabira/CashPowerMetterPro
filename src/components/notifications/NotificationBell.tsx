
import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bell } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { db } from '../../db/database';

const NotificationBell: React.FC = () => {
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = useLiveQuery(() => db.notifications.where('is_read').equals(0).count(), [], 0);

  const handleMouseEnter = () => setIsHoverOpen(true);
  const handleMouseLeave = () => setIsHoverOpen(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(prev => !prev);
  };

  useEffect(() => {
    if (!isPinned) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPinned]);

  const shouldShow = isHoverOpen || isPinned;

  return (
    <div 
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        onClick={handleClick}
        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50`}
        aria-label={`Notifications (${unreadCount} non lues)}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-background"></span>
        )}
      </button>

      {shouldShow && (
        <div className="absolute top-full left-2 right-2 mt-2 z-50 animate-enter-dropdown">
          <NotificationsDropdown />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
