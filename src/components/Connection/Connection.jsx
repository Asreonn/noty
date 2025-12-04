import React from 'react';
import './Connection.css';
import { createStringPath } from '../../utils/pathUtils';

const Connection = ({ 
  connection, 
  fromNote, 
  toNote,
  isSelected = false,
  isHovered = false,
  onSelect,
  onHover,
  onHoverEnd
}) => {
  if (!fromNote || !toNote) return null;

  // Dinamik pin koordinatlarını hesapla
  const fromX = fromNote.x + (connection.fromPinX || 110);
  const fromY = fromNote.y + (connection.fromPinY || 110);
  const toX = toNote.x + (connection.toPinX || 110);
  const toY = toNote.y + (connection.toPinY || 110);

  // Bezier path oluştur (gravity efektli)
  const pathD = createStringPath(fromX, fromY, toX, toY);

  // Stil özellikleri
  const strokeColor = connection.style?.color || 'rgba(139, 69, 19, 0.6)';
  const strokeWidth = connection.style?.thickness || 2;

  return (
    <>
      {/* Görünmez geniş hover alanı */}
      <path
        className="connection-hover-area"
        d={pathD}
        onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect(connection);
        }}
        onMouseEnter={() => {
          onHover && onHover(connection);
          const hoverEvent = new CustomEvent('connectionHover', { 
            detail: { connectionId: connection.id } 
          });
          document.dispatchEvent(hoverEvent);
        }}
        onMouseLeave={() => {
          onHoverEnd && onHoverEnd();
          const hoverEndEvent = new CustomEvent('connectionHoverEnd');
          document.dispatchEvent(hoverEndEvent);
        }}
      />
      
      {/* Görünür ince ip - Hover'ı yukarıdaki path alıyor */}
      <path
        className={`connection-string ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        d={pathD}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
};

export default Connection;
