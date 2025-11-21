import React, { useState, useRef, useEffect } from 'react';

const FontSizePicker = ({ selectedSize, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const fontSizes = [
    { value: 'tiny', label: 'Tiny', letter: 'T', scale: 0.7, numValue: 0 },
    { value: 'small', label: 'Small', letter: 'S', scale: 0.85, numValue: 1 },
    { value: 'medium', label: 'Medium', letter: 'M', scale: 1.0, numValue: 2 },
    { value: 'large', label: 'Large', letter: 'L', scale: 1.2, numValue: 3 },
    { value: 'huge', label: 'Huge', letter: 'H', scale: 1.5, numValue: 4 }
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

  const currentSize = fontSizes.find(s => s.value === selectedSize) || fontSizes[2];

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    const size = fontSizes[value];
    if (size) {
      onSelect(size.value);
    }
  };

  return (
    <div className="mini-menu-container" ref={pickerRef}>
      <button
        className={`mini-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Font Size"
      >
        <span style={{ fontSize: `${currentSize.scale}rem`, fontWeight: '600', lineHeight: '1' }}>
          {currentSize.letter}
        </span>
      </button>

      {isOpen && (
        <div className="mini-menu-popover font-size-popover">
          <div className="font-size-slider-container">
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={currentSize.numValue}
              onChange={handleSliderChange}
              className="font-size-slider"
            />
            <div className="slider-labels">
              {fontSizes.map((size, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    fontSize: `${size.scale * 0.75}rem`, 
                    fontWeight: '600',
                    opacity: selectedSize === size.value ? 1 : 0.5
                  }}
                >
                  {size.letter}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FontSizePicker;
