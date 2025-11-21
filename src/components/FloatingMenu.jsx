import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import './FloatingMenu.css';

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
        className={`floating-menu-container ${isOpen ? 'open' : ''}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
    >
        <div className="menu-content">
            <div className="menu-section">
                <div className="menu-label-header">Guide</div>
                <ul className="usage-guide">
                    <li>Double click to add note</li>
                    <li>Drag tape to move</li>
                    <li>Scroll to zoom</li>
                    <li>Shift+Drag to connect</li>
                    <li>Ctrl+Drag to snap to grid</li>
                </ul>
            </div>
        </div>

        <div className="menu-trigger">
            <HelpCircle size={24} className="sparkle-icon" />
        </div>
    </div>
  );
};

export default FloatingMenu;
