import React from 'react';
import Connection from './Connection/Connection';
import { createStringPath } from '../utils/pathUtils';

const ConnectionsLayer = ({ 
  connections, 
  notes,
  connectingSource,
  mousePos,
  transform,
  selectedConnectionId,
  hoveredConnectionId,
  onSelectConnection,
  onHoverConnection,
  onHoverEndConnection
}) => {
  return (
    <svg 
      className="connections-layer" 
      style={{ 
        position: 'absolute',  // Canvas içinde absolute
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 50  // Notların (1) üstünde, pinlerin (200) altında
      }}
    >
      {/* Mevcut Bağlantılar */}
      <g style={{ pointerEvents: 'stroke' }}>
        {connections.map(conn => {
          const fromNote = notes.find(n => n.id === conn.from);
          const toNote = notes.find(n => n.id === conn.to);
          
          return (
            <Connection
              key={conn.id}
              connection={conn}
              fromNote={fromNote}
              toNote={toNote}
              isSelected={selectedConnectionId === conn.id}
              isHovered={hoveredConnectionId === conn.id}
              onSelect={onSelectConnection}
              onHover={onHoverConnection}
              onHoverEnd={onHoverEndConnection}
            />
          );
        })}
      </g>

      {/* Geçici Bağlantı Çizgisi (oluşturulurken) */}
      {connectingSource && (() => {
        const fromNote = notes.find(n => n.id === connectingSource.noteId);
        if (!fromNote) return null;

        // Başlangıç pozisyonu (dinamik pin)
        const fromX = fromNote.x + connectingSource.pinX;
        const fromY = fromNote.y + connectingSource.pinY;
        
        // Mouse pozisyonu canvas koordinatlarında
        const canvasMouseX = (mousePos.x - transform.x) / transform.scale;
        const canvasMouseY = (mousePos.y - transform.y) / transform.scale;
        
        const pathD = createStringPath(fromX, fromY, canvasMouseX, canvasMouseY);

        return (
          <path
            className="connection-string temporary"
            d={pathD}
            style={{ pointerEvents: 'none' }}
          />
        );
      })()}
    </svg>
  );
};

export default ConnectionsLayer;
