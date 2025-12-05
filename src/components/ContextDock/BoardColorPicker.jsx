import React, { useState, useRef, useEffect } from 'react';

const BoardColorPicker = ({ selectedColor, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Cork/paper background colors
  const boardColors = [
    { value: 'cork', label: 'Cork', color: '#dcc5a6' },
    { value: 'cream', label: 'Cream', color: '#f5ebe0' },
    { value: 'sage', label: 'Sage', color: '#c8d5bb' },
    { value: 'sky', label: 'Sky', color: '#b8d4e3' },
    { value: 'lavender', label: 'Lavender', color: '#d8c5e4' },
    { value: 'rose', label: 'Rose', color: '#e8c8c8' },
    { value: 'sand', label: 'Sand', color: '#e6ddc4' },
    { value: 'slate', label: 'Slate', color: '#b8c4c8' },
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

  const currentColor = boardColors.find(c => c.value === selectedColor) || boardColors[0];

  return (
    <div className="mini-menu-container" ref={pickerRef}>
      <button
        className={`mini-trigger-btn board-color-trigger ${isOpen ? 'active' : ''}`}
        style={{ backgroundColor: currentColor.color }}
        onClick={() => setIsOpen(!isOpen)}
        title="Board Background Color"
      />

      {isOpen && (
        <div className="mini-menu-popover">
          <div className="mini-menu-grid">
            {boardColors.map(boardColor => (
              <button
                key={boardColor.value}
                className={`board-color-swatch ${selectedColor === boardColor.value ? 'active' : ''}`}
                style={{ backgroundColor: boardColor.color }}
                onClick={() => {
                  onSelect(boardColor.value);
                  setIsOpen(false);
                }}
                title={boardColor.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardColorPicker;
