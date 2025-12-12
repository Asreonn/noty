import React, { useState, useRef, useEffect } from 'react';
import './Board.css';

const Board = ({
  id,
  x,
  y,
  name = 'Board',
  columns = [{ id: 1, name: 'To Do', items: [] }],
  titleFontStyle = 'hand',
  titleFontSize = 'medium',
  backgroundColor = 'cork',
  onUpdate,
  onDrag,
  onSelect,
  isSelected,
  scale = 1,
  // Cross-board drag and drop
  onItemDragStart,
  draggingItem,
  dropPreview
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  
  const dragStateRef = useRef({
    isDragging: false,
    currentX: x,
    currentY: y
  });

  // Board drag handling
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragStateRef.current.isDragging) return;

      const deltaX = e.movementX / scale;
      const deltaY = e.movementY / scale;

      dragStateRef.current.currentX += deltaX;
      dragStateRef.current.currentY += deltaY;

      let newX = dragStateRef.current.currentX;
      let newY = dragStateRef.current.currentY;

      if (e.ctrlKey) {
        const gridSize = 40;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      requestAnimationFrame(() => {
        onDrag && onDrag(id, { x: newX, y: newY });
      });
    };

    const handleMouseUp = (e) => {
      if (!dragStateRef.current.isDragging) return;
      dragStateRef.current.isDragging = false;
      setIsDragging(false);

      let finalX = dragStateRef.current.currentX;
      let finalY = dragStateRef.current.currentY;

      if (e.ctrlKey) {
        const gridSize = 40;
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
      }

      onUpdate(id, { x: finalX, y: finalY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, onUpdate, onDrag, scale]);

  const handleDragStart = (e) => {
    if (e.button !== 0 || editingBoardName) return;
    e.preventDefault();
    onSelect && onSelect();
    dragStateRef.current.isDragging = true;
    dragStateRef.current.currentX = x;
    dragStateRef.current.currentY = y;
    setIsDragging(true);
  };

  const handleItemDragStart = (e, columnId, item) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (onItemDragStart) {
      onItemDragStart(id, columnId, item, e.clientX, e.clientY);
    }
  };

  const handleBoardNameChange = (newName) => {
    onUpdate(id, { name: newName });
  };

  const handleColumnNameChange = (columnId, newName) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, name: newName } : col
    );
    onUpdate(id, { columns: updatedColumns });
  };

  const handleAddItem = (columnId) => {
    const colors = ['yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'cyan', 'green'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newItem = {
      id: Date.now(),
      content: '',
      color: randomColor
    };
    
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, items: [...col.items, newItem] } : col
    );
    onUpdate(id, { columns: updatedColumns });
    
    setTimeout(() => setEditingItemId(newItem.id), 50);
  };

  const handleItemUpdate = (columnId, itemId, updates) => {
    const updatedColumns = columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          items: col.items.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return col;
    });
    onUpdate(id, { columns: updatedColumns });
  };

  const handleColumnDoubleClick = (e, columnId) => {
    if (e.target.classList.contains('board-column-content') || 
        e.target.classList.contains('board-column-add-zone')) {
      handleAddItem(columnId);
    }
  };

  // Font style mapping
  const fontFamilies = {
    sans: 'Inter, sans-serif',
    serif: 'Georgia, serif',
    mono: 'monospace',
    hand: '"Patrick Hand", cursive',
    rounded: '"Quicksand", sans-serif',
    elegant: '"Playfair Display", serif'
  };

  // Font size mapping
  const fontSizes = {
    tiny: '0.9rem',
    small: '1rem',
    medium: '1.3rem',
    large: '1.6rem',
    huge: '2rem'
  };

  // Board background color mapping
  const boardColors = {
    cork: { bg: '#dcc5a6', border: '#c4a484' },
    cream: { bg: '#f5ebe0', border: '#d4c4b0' },
    sage: { bg: '#c8d5bb', border: '#a8b8a0' },
    sky: { bg: '#b8d4e3', border: '#98b8c8' },
    lavender: { bg: '#d8c5e4', border: '#b8a8c8' },
    rose: { bg: '#e8c8c8', border: '#c8a8a8' },
    sand: { bg: '#e6ddc4', border: '#c8c0a8' },
    slate: { bg: '#b8c4c8', border: '#98a8b0' },
  };

  const currentBoardColor = boardColors[backgroundColor] || boardColors.cork;
  const currentFontFamily = fontFamilies[titleFontStyle] || fontFamilies.hand;
  const currentFontSize = fontSizes[titleFontSize] || fontSizes.medium;

  return (
    <div
      className={`board ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
      data-board-id={id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect();
      }}
    >
      {/* Screw at top center - drag handle */}
      <div className="board-screw" onMouseDown={handleDragStart}>
        <div className="screw-head" />
      </div>

      {/* Main Board Frame */}
      <div
        className="board-frame"
        style={{
          backgroundColor: currentBoardColor.bg,
          borderColor: currentBoardColor.border
        }}
      >
        {/* Header - double-clickable for rename */}
        <div 
          className="board-header" 
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditingBoardName(true);
          }}
        >
          {editingBoardName ? (
            <input
              type="text"
              className="board-title-input"
              style={{
                fontFamily: currentFontFamily,
                fontSize: currentFontSize,
                width: `${name.length + 4}ch`
              }}
              value={name}
              onChange={(e) => handleBoardNameChange(e.target.value)}
              onBlur={() => setEditingBoardName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingBoardName(false)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span
              className="board-title"
              style={{
                fontFamily: currentFontFamily,
                fontSize: currentFontSize,
                display: 'inline-block',
                width: `${name.length + 4}ch`
              }}
            >
              {name}
            </span>
          )}
        </div>

        <div className="board-content">
          {columns.map(column => (
            <div key={column.id} className="board-column">
              <div 
                className="board-column-header"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingColumnId(column.id);
                }}
              >
                {editingColumnId === column.id ? (
                  <input
                    type="text"
                    className="board-column-name-input"
                    style={{
                      fontFamily: currentFontFamily,
                      fontSize: currentFontSize,
                      width: `${column.name.length + 6}ch`
                    }}
                    value={column.name}
                    onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                    onBlur={() => setEditingColumnId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingColumnId(null)}
                    autoFocus
                  />
                ) : (
                  <span
                    className="board-column-name"
                    style={{
                      fontFamily: currentFontFamily,
                      fontSize: currentFontSize,
                      display: 'inline-block',
                      width: `${column.name.length + 6}ch`
                    }}
                  >
                    {column.name}
                  </span>
                )}
              </div>
              
              <div 
                className="board-column-content"
                data-board-id={id}
                data-column-id={column.id}
                onDoubleClick={(e) => handleColumnDoubleClick(e, column.id)}
              >
                {column.items.map((item, itemIndex) => (
                  <React.Fragment key={item.id}>
                    {/* Drop preview placeholder */}
                    {dropPreview?.columnId === column.id && dropPreview?.index === itemIndex && (
                      <div className={`board-item-placeholder ${draggingItem?.isExpanded ? 'expanded' : ''}`} />
                    )}
                    <div 
                      className={`board-item ${item.color} ${draggingItem?.id === item.id ? 'dragging' : ''} ${
                        item.isExpanded ? 'expanded' : ''
                      }`}
                      data-item-id={item.id}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingItemId(item.id);
                      }}
                    >
                      {/* Pushpin - drag handle for item */}
                      <div 
                        className="board-item-pin"
                        onMouseDown={(e) => handleItemDragStart(e, column.id, item)}
                      >
                        <div className="pushpin-head" />
                        <div className="pushpin-needle" />
                      </div>
                      
                      <div className="board-item-body">
                        {editingItemId === item.id ? (
                          <textarea
                            className="board-item-input"
                            value={item.content}
                            maxLength={165}
                            onChange={(e) => {
                              const target = e.target;
                              const content = target.value;

                              // Character-based expansion: >60 chars = expand, <=60 = shrink
                              const shouldExpand = content.length > 60;

                              // Update item with content and expansion state
                              handleItemUpdate(column.id, item.id, {
                                content,
                                isExpanded: shouldExpand
                              });

                              // Height is now controlled by CSS, no inline styles needed
                              // CSS handles both expanded (326px) and normal (150px) states
                            }}
                            onBlur={() => setEditingItemId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                setEditingItemId(null);
                              }
                            }}
                            placeholder="Enter task..."
                            autoFocus
                            onFocus={(e) => {
                              // Move cursor to end
                              const target = e.target;
                              const val = target.value;
                              target.value = '';
                              target.value = val;
                            }}
                          />
                        ) : (
                          <span className="board-item-content">
                            {item.content || 'New task'}
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
                
                {/* Drop preview at the end of the column */}
                {dropPreview?.columnId === column.id && dropPreview?.index === column.items.length && (
                  <div className={`board-item-placeholder ${draggingItem?.isExpanded ? 'expanded' : ''}`} />
                )}
                
                <div className="board-column-add-zone" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
