import React, { useState, useRef, useEffect } from 'react';

const FontStylePicker = ({ selectedStyle, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const fontStyles = [
    { value: 'sans', label: 'Sans', fontFamily: 'Inter, sans-serif' },
    { value: 'serif', label: 'Serif', fontFamily: 'Georgia, serif' },
    { value: 'mono', label: 'Mono', fontFamily: 'monospace' },
    { value: 'hand', label: 'Hand', fontFamily: '"Patrick Hand", cursive' },
    { value: 'rounded', label: 'Rounded', fontFamily: '"Quicksand", sans-serif' },
    { value: 'elegant', label: 'Elegant', fontFamily: '"Playfair Display", serif' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentStyle = fontStyles.find(s => s.value === selectedStyle) || fontStyles[0];

  return (
    <div className="mini-menu-container" ref={pickerRef}>
      <button
        className={`mini-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Font Style"
      >
        <span style={{ fontFamily: currentStyle.fontFamily, fontSize: '1rem', fontWeight: '500' }}>
          Ab
        </span>
      </button>

      {isOpen && (
        <div className="mini-menu-popover">
          <div className="mini-menu-list">
            {fontStyles.map(style => (
              <button
                key={style.value}
                className={`mini-menu-item ${selectedStyle === style.value ? 'active' : ''}`}
                onClick={() => {
                  onSelect(style.value);
                  setIsOpen(false);
                }}
              >
                <span style={{ fontFamily: style.fontFamily, fontSize: '1.2rem', fontWeight: '500' }}>
                  Ab
                </span>
                <span className="mini-menu-item-label">{style.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontStylePicker;
