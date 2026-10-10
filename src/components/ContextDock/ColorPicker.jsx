import React, { useState, useRef, useEffect } from 'react';

const ColorPicker = ({ selectedColor, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  const presetColors = ['yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'cyan', 'green'];

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

  return (
    <div className="mini-menu-container" ref={pickerRef}>
      <button
        className={`mini-trigger-btn ${!selectedColor.startsWith('#') ? `swatch-${selectedColor}` : ''} ${isOpen ? 'active' : ''}`}
        style={selectedColor.startsWith('#') ? { backgroundColor: selectedColor } : {}}
        onClick={() => setIsOpen(!isOpen)}
        title="Change Color"
      />

      {isOpen && (
        <div className="mini-menu-popover">
          <div className="mini-menu-grid">
            {presetColors.map(colorType => (
              <button
                key={colorType}
                className={`color-swatch swatch-${colorType} ${selectedColor === colorType ? 'active' : ''}`}
                onClick={() => {
                  onSelect(colorType);
                  setIsOpen(false);
                }}
                title={colorType}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
