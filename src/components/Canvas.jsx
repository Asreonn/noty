import React from 'react';
import './Canvas.css';

const Canvas = ({ children, transform, handlers }) => {
  return (
    <div 
      className="canvas-container"
      {...handlers}
    >
      <div 
        className="canvas-content"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
        }}
      >
        {children}
        <div className="canvas-grid-pattern" />
      </div>
    </div>
  );
};

export default Canvas;
