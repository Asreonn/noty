import React, { useState, useEffect } from 'react';
import { Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import './ContextDock.css';
import ColorPicker from './ColorPicker';
import FontStylePicker from './FontStylePicker';
import FontSizePicker from './FontSizePicker';
import BoardColorPicker from './BoardColorPicker';

const ContextDock = ({ selectedObject, onUpdate, onBoardUpdate }) => {
  const [isHiding, setIsHiding] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [currentObject, setCurrentObject] = useState(null);

  useEffect(() => {
    if (selectedObject) {
      // Show the dock
      setCurrentObject(selectedObject);
      setShouldRender(true);
      setIsHiding(false);
    } else if (currentObject) {
      // Hide the dock with animation
      setIsHiding(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setCurrentObject(null);
      }, 400); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [selectedObject, currentObject]);

  if (!shouldRender) return null;

  const { type, data } = currentObject;

  return (
    <div className={`context-dock ${isHiding ? 'hiding' : ''}`}>
      {type === 'note' && (
        <>
          {/* Style Group */}
          <div className="dock-group">
            <ColorPicker
                selectedColor={data.type}
                onSelect={(newColor) => onUpdate(data.id, { type: newColor })}
            />
            <FontStylePicker
              selectedStyle={data.fontStyle || 'sans'}
              onSelect={(newStyle) => onUpdate(data.id, { fontStyle: newStyle })}
            />
            <FontSizePicker
              selectedSize={data.fontSize || 'medium'}
              onSelect={(newSize) => onUpdate(data.id, { fontSize: newSize })}
            />
          </div>

          {/* Divider */}
          <div className="dock-divider" />

          {/* Actions Group */}
          <div className="dock-group">
            <button
                className="icon-btn"
                onClick={() => onUpdate(data.id, { _duplicate: true })}
                title="Duplicate Note"
            >
                <Copy size={18} />
            </button>

            <div className="layer-controls">
                <button
                    className="icon-btn"
                    onClick={() => onUpdate(data.id, { _bringToFront: true })}
                    title="Bring to Front"
                >
                    <ArrowUp size={18} />
                </button>
                <button
                    className="icon-btn"
                    onClick={() => onUpdate(data.id, { _sendToBack: true })}
                    title="Send to Back"
                >
                    <ArrowDown size={18} />
                </button>
            </div>

            <button
              className="icon-btn delete-btn-dock"
              onClick={() => onUpdate(data.id, { _delete: true })}
              title="Delete Note"
            >
                <Trash2 size={18} />
            </button>
          </div>
        </>
      )}

      {type === 'connector' && (
        <>
          <div className="dock-group">
            <button
              className="icon-btn"
              onClick={() => onUpdate(data.id, { _bringToFront: true })}
              title="Bring Forward"
            >
              <ArrowUp size={18} />
            </button>
            <button
              className="icon-btn delete-btn-dock"
              onClick={() => onUpdate(data.id, { _delete: true })}
              title="Delete Connection"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </>
      )}

      {type === 'board' && (
        <>
          {/* Style Group */}
          <div className="dock-group">
            <BoardColorPicker
              selectedColor={data.backgroundColor || 'cork'}
              onSelect={(newColor) => onBoardUpdate(data.id, { backgroundColor: newColor })}
            />
            <FontStylePicker
              selectedStyle={data.titleFontStyle || 'hand'}
              onSelect={(newStyle) => onBoardUpdate(data.id, { titleFontStyle: newStyle })}
            />
            <FontSizePicker
              selectedSize={data.titleFontSize || 'medium'}
              onSelect={(newSize) => onBoardUpdate(data.id, { titleFontSize: newSize })}
            />
          </div>

          {/* Divider */}
          <div className="dock-divider" />

          {/* Actions Group */}
	          <div className="dock-group">
	            <button
	              className="icon-btn delete-btn-dock"
	              onClick={() => onBoardUpdate(data.id, { _delete: true })}
	              title="Delete Board"
	            >
	              <Trash2 size={18} />
	            </button>
	          </div>
        </>
      )}

      {type === 'line' && (
        <div className="dock-group">
           <span className="dock-label">Style</span>
           <div className="style-toggles">
                <button
                    className={`icon-btn ${(!data.strokeStyle || data.strokeStyle === 'solid') ? 'active' : ''}`}
                    onClick={() => onUpdate(data.id, { strokeStyle: 'solid' })}
                    title="Solid"
                >
                    <div style={{ width: 20, height: 2, background: 'currentColor' }} />
                </button>
                <button
                    className={`icon-btn ${data.strokeStyle === 'dashed' ? 'active' : ''}`}
                    onClick={() => onUpdate(data.id, { strokeStyle: 'dashed' })}
                    title="Dashed"
                >
                    <div style={{ width: 20, height: 2, background: 'currentColor', borderTop: '2px dashed currentColor' }} />
                </button>
                <button 
                    className={`icon-btn ${data.strokeStyle === 'dotted' ? 'active' : ''}`}
                    onClick={() => onUpdate(data.id, { strokeStyle: 'dotted' })}
                    title="Dotted"
                >
                    <div style={{ width: 20, height: 2, background: 'currentColor', borderTop: '2px dotted currentColor' }} />
                </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ContextDock;
