import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownMenuItem {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  isSeparator?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-container rounded-xl shadow-lg z-20 animate-enter-dropdown">
          <ul className="p-2">
            {items.map((item, index) => (
              item.isSeparator ? (
                <li key={`separator-${index}`} className="border-b border-outline my-2" />
              ) : (
                <li 
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors"
                  onClick={() => handleItemClick(item.action)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
