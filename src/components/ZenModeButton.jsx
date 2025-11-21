import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import './ZenModeButton.css';

const ZenModeButton = ({ zenMode, onToggle }) => {
  return (
    <button 
      className="zen-mode-button"
      onClick={onToggle}
      title={zenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
    >
      {zenMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
    </button>
  );
};

export default ZenModeButton;
