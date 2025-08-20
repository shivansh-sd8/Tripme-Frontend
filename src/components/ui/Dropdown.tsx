import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right', className }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Keyboard accessibility: close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div className={`relative inline-block ${className || ''}`} ref={dropdownRef}>
      <span
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(v => !v); }}
        className="focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
      >
        {trigger}
      </span>
      <div
        className={`absolute mt-2 min-w-[12rem] w-max ${align === 'right' ? 'right-0' : 'left-0'} z-50
          bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden
          transition-all duration-300 ease-out transform origin-top-right
          ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
        role="menu"
        aria-hidden={!open}
      >
        {children}
      </div>
    </div>
  );
};

export default Dropdown; 