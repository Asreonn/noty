import React, { useState } from 'react';
import { Bold, Italic, Underline, Palette, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const EditorToolbar = ({ onFormat, onColor, onSize, onAlign, activeFormats = {} }) => {
  const [activeMenu, setActiveMenu] = useState(null); // 'color', 'size', 'font', or null
  const [fontSize, setFontSize] = useState(100); // Percentage

  const colors = [
    '#2d2a2e', // Default Dark
    '#e06c75', // Red
    '#98c379', // Green
    '#e5c07b', // Yellow
    '#61afef', // Blue
    '#c678dd', // Purple
  ];

  const fontSizes = [
    { label: 'Tiny', value: '0.7em', letter: 'T', step: 0 },
    { label: 'Small', value: '0.85em', letter: 'S', step: 1 },
    { label: 'Medium', value: '1em', letter: 'M', step: 2 },
    { label: 'Large', value: '1.2em', letter: 'L', step: 3 },
    { label: 'Huge', value: '1.5em', letter: 'H', step: 4 }
  ];

  const fonts = [
    { name: 'Sans', value: 'Inter, sans-serif', label: 'Sans' },
    { name: 'Serif', value: 'Georgia, serif', label: 'Serif' },
    { name: 'Mono', value: 'monospace', label: 'Mono' },
    { name: 'Hand', value: '"Patrick Hand", cursive', label: 'Hand' },
    { name: 'Rounded', value: '"Quicksand", sans-serif', label: 'Round' },
  ];

  const [sliderValue, setSliderValue] = useState(2); // Default Medium

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    const size = fontSizes.find(s => s.step === val);
    if (size) {
        onSize(size.value);
    }
  };

  return (
    <div className="editor-toolbar" onMouseDown={(e) => e.preventDefault()}>
      {/* Formatting Group */}
      <div className="toolbar-group">
        <button 
            onClick={() => onFormat('bold')} 
            title="Bold"
            className={activeFormats.bold ? 'active' : ''}
        >
          <Bold size={16} />
        </button>
        <button 
            onClick={() => onFormat('italic')} 
            title="Italic"
            className={activeFormats.italic ? 'active' : ''}
        >
          <Italic size={16} />
        </button>
        <button 
            onClick={() => onFormat('underline')} 
            title="Underline"
            className={activeFormats.underline ? 'active' : ''}
        >
          <Underline size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Alignment Group */}
      <div className="toolbar-group">
        <button onClick={() => onAlign('justifyLeft')} title="Align Left">
            <AlignLeft size={16} />
        </button>
        <button onClick={() => onAlign('justifyCenter')} title="Align Center">
            <AlignCenter size={16} />
        </button>
        <button onClick={() => onAlign('justifyRight')} title="Align Right">
            <AlignRight size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Font Size Trigger */}
      <div className="toolbar-group relative">
        <button 
            onClick={() => setActiveMenu(activeMenu === 'size' ? null : 'size')}
            className={`size-trigger ${activeMenu === 'size' ? 'active' : ''}`}
            title="Text Size"
        >
            <Type size={16} />
        </button>

        {activeMenu === 'size' && (
            <div className="size-popover context-dock-style">
                <div className="vertical-slider-container">
                    <input 
                        type="range" 
                        min="0" 
                        max="4" 
                        step="1"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="vertical-slider"
                    />
                    <div className="vertical-slider-labels">
                        {fontSizes.map((size) => (
                            <span 
                                key={size.step} 
                                style={{ 
                                    fontSize: '0.7rem', 
                                    opacity: sliderValue === size.step ? 1 : 0.5,
                                    fontWeight: '600'
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

      <div className="toolbar-divider" />

      {/* Color Picker Trigger */}
      <div className="toolbar-group relative">
        <button 
            onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')} 
            className={`color-trigger ${activeMenu === 'color' ? 'active' : ''}`}
            title="Text Color"
        >
          <Palette size={16} />
        </button>

        {activeMenu === 'color' && (
            <div className="color-popover">
                {colors.map((color) => (
                <button
                    key={color}
                    className="color-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                        onColor(color);
                        setActiveMenu(null);
                    }}
                />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;
