import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Note.css';
import EditorToolbar from './EditorToolbar';
import RichTextEditor from './RichTextEditor';

const Note = ({
  id,
  x,
  y,
  content,
  type,
  onUpdate,
  onDelete,
  onNoteMouseDown,
  onNoteMouseUp,
  onDrag,
  onSelect,
  onCopy,
  isSelected,
  isDragging: isExternalDragging,
  editingNoteId,
  setEditingNoteId,
  scale = 1,
  fontStyle = 'sans',
  fontSize = 'medium',
  connections = [],
  connectingSource = null,
  hoveredConnectionId = null,
  renderPins = true,  // Pinleri render et mi?
  transform = { x: 0, y: 0, scale: 1 }  // Canvas transform for toolbar positioning
}) => {
  const isEditing = editingNoteId === id;
  const [noteContent, setNoteContent] = useState(content);
  const [isDragging, setIsDragging] = useState(false);

  // Drag state - use refs for smooth dragging
  const dragStateRef = useRef({
    isDragging: false,
    startX: x,
    startY: y
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragStateRef.current.isDragging) return;

      const deltaX = e.movementX / scale;
      const deltaY = e.movementY / scale;

      // Update current drag position
      dragStateRef.current.currentX += deltaX;
      dragStateRef.current.currentY += deltaY;

      let newX = dragStateRef.current.currentX;
      let newY = dragStateRef.current.currentY;

      // Optional grid snap (ONLY when Ctrl held)
      if (e.ctrlKey) {
        const gridSize = 40;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Use RAF for smooth updates - ipler düzgün takip eder
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

      // Final snap if Ctrl held
      if (e.ctrlKey) {
        const gridSize = 40;
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
      }

      // Save final position
      onUpdate(id, { x: finalX, y: finalY, content });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, content, onUpdate, onDrag, scale]);

  // Handle auto-close of editor when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && !e.target.closest('.note')) {
        setEditingNoteId(null);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleTapeMouseDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    onSelect && onSelect();

    if (e.shiftKey) {
        // Shift ile bağlantı modu - burada handle etme, parent'a bırak
        return;
    } else {
        e.preventDefault();
        // Initialize drag with current position from props
        dragStateRef.current.isDragging = true;
        dragStateRef.current.currentX = x;
        dragStateRef.current.currentY = y;
        setIsDragging(true);
    }
  };

  const handleNoteMouseUp = (e) => {
    // Shift ile bağlantı modu
    if (e.shiftKey && onNoteMouseUp) {
      onNoteMouseUp(id, e);
    }
  };

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  });

  const lastRangeRef = useRef(null);

  const checkFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline')
    });
  };

  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      lastRangeRef.current = sel.getRangeAt(0);
    }
    checkFormats();
  };

  const handleFormat = (command) => {
    // Restore selection if needed
    if (lastRangeRef.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(lastRangeRef.current);
    }
    document.execCommand(command, false, null);
    handleSelectionChange(); // Update saved range
  };

  const handleColor = (color) => {
    if (lastRangeRef.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(lastRangeRef.current);
    }
    document.execCommand('foreColor', false, color);
  };

  const handleSize = (size) => {
    let range = lastRangeRef.current;
    
    // Fallback to current selection if no saved range
    if (!range) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) range = sel.getRangeAt(0);
    }

    if (!range || range.collapsed) return;

    // Create a document fragment to manipulate the selection
    const fragment = range.extractContents();
    
    // Helper to apply size to a node
    const applySizeToNode = (node) => {
        if (node.nodeType === 3) { // Text node
            if (node.textContent.trim() === '') return node; // Skip empty text
            const span = document.createElement('span');
            span.style.fontSize = size;
            span.textContent = node.textContent;
            return span;
        } else if (node.nodeType === 1) { // Element node
            if (node.tagName === 'SPAN' && node.style.fontSize) {
                node.style.fontSize = size;
            } else {
                // Recursively handle children
                const children = Array.from(node.childNodes);
                node.innerHTML = ''; // Clear content
                children.forEach(child => {
                    node.appendChild(applySizeToNode(child));
                });
                
                // If it's a span without font size, we might want to apply it here too
                // but for now let's stick to modifying existing font-size spans or text nodes
                if (node.tagName === 'SPAN' && !node.style.fontSize) {
                     node.style.fontSize = size;
                }
            }
            return node;
        }
        return node;
    };

    // Process the fragment
    const processedFragment = document.createDocumentFragment();
    Array.from(fragment.childNodes).forEach(child => {
        processedFragment.appendChild(applySizeToNode(child));
    });

    // Insert back into range
    range.insertNode(processedFragment);
    
    // Update selection to cover the new content
    const newRange = document.createRange();
    newRange.selectNodeContents(processedFragment); // This might not work perfectly if fragment is empty, but it shouldn't be
    lastRangeRef.current = newRange;
    
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
  };

  const handleFont = (font) => {
      if (lastRangeRef.current) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(lastRangeRef.current);
      }
      // Using execCommand for fontName is often unreliable or deprecated, 
      // but for simple cases it might work if we map value to a name.
      // However, a robust way is similar to handleSize or using span wrapping.
      // Let's try a simple span wrapping approach for now.
      
      let range = lastRangeRef.current;
      if (!range) return;

      if (!range.collapsed) {
          const span = document.createElement('span');
          span.style.fontFamily = font;
          try {
              const content = range.extractContents();
              span.appendChild(content);
              range.insertNode(span);
              
              const newRange = document.createRange();
              newRange.selectNodeContents(span);
              lastRangeRef.current = newRange;
              
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(newRange);
          } catch (e) {
              console.error("Font selection error", e);
          }
      }
  };

  const handleAlign = (alignment) => {
      if (lastRangeRef.current) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(lastRangeRef.current);
      }
      document.execCommand(alignment, false, null);
  };

  const isHexColor = type.startsWith('#');

  // Bağlantı modu aktif mi?
  const isInConnectingMode = connectingSource && connectingSource.noteId === id;
  
  // Dinamik pin pozisyonu göster (shift basılıyken)
  const showPinIndicator = isInConnectingMode && connectingSource.pinX && connectingSource.pinY;

  return (
    <div
      className={`note ${!isHexColor ? type : ''} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
      style={{
          '--note-x': `${x}px`,
          '--note-y': `${y}px`,
          left: `${x}px`,
          top: `${y}px`,
          fontFamily: 
            fontStyle === 'mono' ? 'monospace' : 
            fontStyle === 'serif' ? 'Georgia, serif' : 
            fontStyle === 'hand' ? '"Patrick Hand", cursive' :
            fontStyle === 'rounded' ? '"Quicksand", sans-serif' :
            fontStyle === 'elegant' ? '"Playfair Display", serif' :
            'Inter, sans-serif',
          fontSize: fontSize === 'tiny' ? '0.9rem' : fontSize === 'small' ? '1rem' : fontSize === 'large' ? '1.6rem' : fontSize === 'huge' ? '2rem' : '1.3rem',
          backgroundColor: isHexColor ? type : undefined,
          zIndex: 1
      }}
      onMouseUp={handleNoteMouseUp}
      onMouseDown={(e) => {
        if (e.shiftKey && onNoteMouseDown) {
          onNoteMouseDown(id, e);
        }
      }}
      onClick={(e) => {
          e.stopPropagation();
          onSelect && onSelect();
      }}
    >
      <div 
        className="note-tape" 
        onMouseDown={handleTapeMouseDown} 
        onDoubleClick={(e) => {
          e.stopPropagation();
          onCopy && onCopy();
        }}
      />

      {isEditing && createPortal(
        <div
          className="note-toolbar-portal"
          style={{
            position: 'fixed',
            left: `${x * transform.scale + transform.x - 70}px`,
            top: `${y * transform.scale + transform.y}px`,
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 5000
          }}
        >
          <EditorToolbar
            onFormat={handleFormat}
            onColor={handleColor}
            onSize={handleSize}
            onFont={handleFont}
            onAlign={handleAlign}
            activeFormats={activeFormats}
          />
        </div>,
        document.body
      )}

      <div
        className="note-content"
        onDoubleClick={(e) => { e.stopPropagation(); setEditingNoteId(id); }}
        onMouseDown={(e) => {
          // Shift basılıysa bağlantı moduna izin ver (bubble up)
          if (e.shiftKey) {
            // stopPropagation yapma, parent'a gitsin
            return;
          }
        }}
      >
        <RichTextEditor 
            content={content} 
            onChange={setNoteContent} 
            placeholder="Write something cozy..." 
            onSelectionChange={handleSelectionChange}
            isEditable={isEditing}
        />
      </div>

      {/* Pinler - renderPins=false ise render etme (App'te render edilecek) */}
      {renderPins && connections.filter(c => c.from === id || c.to === id).map(conn => {
        const isFrom = conn.from === id;
        const pinX = isFrom ? conn.fromPinX : conn.toPinX;
        const pinY = isFrom ? conn.fromPinY : conn.toPinY;
        
        // Hover state - bu bağlantı hover'da mı?
        const isConnectionHovered = hoveredConnectionId === conn.id;
        
        return (
          <div
            key={`pin-${conn.id}-${isFrom ? 'from' : 'to'}`}
            className={`note-pushpin ${isConnectionHovered ? 'hovered' : ''}`}
            style={{
              position: 'absolute',
              left: `${pinX}px`,
              top: `${pinY}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,  // SVG üzerinde
              pointerEvents: 'auto'
            }}
            onMouseEnter={() => {
              // Pin'e hover olunca tüm bağlantıyı hover yap
              if (onUpdate) {
                // Trigger hover through a custom event
                const hoverEvent = new CustomEvent('connectionHover', { 
                  detail: { connectionId: conn.id } 
                });
                document.dispatchEvent(hoverEvent);
              }
            }}
            onMouseLeave={() => {
              const hoverEndEvent = new CustomEvent('connectionHoverEnd');
              document.dispatchEvent(hoverEndEvent);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (e.shiftKey && e.button === 0) {
                if (onNoteMouseDown) {
                  onNoteMouseDown(id, e);
                }
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.shiftKey) {
                onUpdate(conn.id, { _delete: true });
              }
            }}
          >
            <div className="pushpin-head" />
            <div className="pushpin-needle" />
          </div>
        );
      })}

      {/* Aktif bağlantı göstergesi - Sadece bağlantı başlatıldığında */}
      {showPinIndicator && (
        <div
          className="note-pin-indicator active-connecting"
          style={{
            position: 'absolute',
            left: `${connectingSource.pinX}px`,
            top: `${connectingSource.pinY}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 1001  // En üstte
          }}
        >
          <div className="pushpin-head pulsing" />
          <div className="pushpin-needle" />
        </div>
      )}
    </div>
  );
};

export default Note;
