import { useState, useEffect } from 'react'
import Canvas from './components/Canvas'
import Note from './components/Note/Note'
import Board from './components/Board/Board'
import Sidebar from './components/Sidebar'
import BreathIntro from './components/BreathIntro'
import LofiPlayer from './components/LofiPlayer'
import ContextDock from './components/ContextDock/ContextDock'
import { useCanvas } from './hooks/useCanvas'
import { saveToStorage, loadFromStorage, getWorkspaces, saveWorkspaces } from './utils/storage'
import FloatingMenu from './components/FloatingMenu'
import ZenModeButton from './components/ZenModeButton'
import Toast from './components/Toast'
import ConnectionsLayer from './components/ConnectionsLayer'
import CreateMenu from './components/CreateMenu'

function App() {
  const { transform, handlers } = useCanvas();
  const [showIntro, setShowIntro] = useState(true);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // Workspace State
  const [workspaces, setWorkspaces] = useState(getWorkspaces());
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  // Note State
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [boards, setBoards] = useState([]);

  // Board Item Drag State
  const [draggingBoardItem, setDraggingBoardItem] = useState(null);
  const [boardItemDragPos, setBoardItemDragPos] = useState({ x: 0, y: 0 });
  const [dropPreview, setDropPreview] = useState(null); // { boardId, columnId, index }

  // Load data when workspace changes
  useEffect(() => {
      const saved = loadFromStorage(currentWorkspace);
      if (saved) {
          // Data Migration: Convert old color types to new ones
          const migratedNotes = (saved.notes || []).map(note => ({
              ...note,
              type: note.type === 'note' ? 'yellow' : 
                    note.type === 'not-to-do' ? 'red' : 
                    note.type,
              createdAt: note.createdAt || Date.now(),
              updatedAt: note.updatedAt || Date.now()
          }));
          setNotes(migratedNotes);
          setConnections(saved.connections || []);
          setBoards(saved.boards || []);
      } else {
          // Default for new/empty workspace
          setNotes([
            { id: 1, x: 100, y: 100, content: 'Welcome to your new workspace!', type: 'yellow' }
          ]);
          setConnections([]);
          setBoards([]);
      }
  }, [currentWorkspace]);

  // Shift key detection - body class ekle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift' && !e.repeat) {
        document.body.classList.add('shift-pressed');
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        document.body.classList.remove('shift-pressed');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.body.classList.remove('shift-pressed');
    };
  }, []);

  // Prevent text selection across multiple notes
  useEffect(() => {
      const handleSelectionChange = () => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;

          const range = selection.getRangeAt(0);
          const startContainer = range.startContainer;
          const endContainer = range.endContainer;

          // Find parent note elements
          const startNote = startContainer.nodeType === Node.TEXT_NODE 
              ? startContainer.parentElement?.closest('.note')
              : startContainer instanceof Element ? startContainer.closest('.note') : null;
          
          const endNote = endContainer.nodeType === Node.TEXT_NODE
              ? endContainer.parentElement?.closest('.note')
              : endContainer instanceof Element ? endContainer.closest('.note') : null;

          // If selection spans different notes, clear it
          if (startNote && endNote && startNote !== endNote) {
              selection.removeAllRanges();
          }
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
          document.removeEventListener('selectionchange', handleSelectionChange);
      };
  }, []);

  // Browser zoom'u engelle (Ctrl+Scroll)
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('wheel', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', preventZoom);
    };
  }, []);

  // Global connection hover handling
  useEffect(() => {
    const handleConnectionHover = (e) => {
      setHoveredConnectionId(e.detail.connectionId);
    };

    const handleConnectionHoverEnd = () => {
      setHoveredConnectionId(null);
    };

    document.addEventListener('connectionHover', handleConnectionHover);
    document.addEventListener('connectionHoverEnd', handleConnectionHoverEnd);

    return () => {
      document.removeEventListener('connectionHover', handleConnectionHover);
      document.removeEventListener('connectionHoverEnd', handleConnectionHoverEnd);
    };
  }, []);

  // Delete key to remove selected note
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't delete if typing in an input/textarea or in edit mode
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || editingNoteId) {
        return;
      }

      // Delete or Backspace key pressed with a selected note
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject?.type === 'note') {
        e.preventDefault();
        handleDeleteNote(selectedObject.data.id);
        setSelectedObject(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedObject, editingNoteId]);

  // Save data when notes/connections/boards change
  useEffect(() => {
      saveToStorage(currentWorkspace, { notes, connections, boards });
  }, [notes, connections, boards, currentWorkspace]);

  const handleAddWorkspace = (name) => {
      if (!workspaces.includes(name)) {
          const newWorkspaces = [...workspaces, name];
          setWorkspaces(newWorkspaces);
          saveWorkspaces(newWorkspaces);
          setCurrentWorkspace(name);
      }
  };

  const [connectingSource, setConnectingSource] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState(null);
  const [draggingPin, setDraggingPin] = useState(null); // { connectionId, isFrom, noteId, startX, startY }
  const [createMenuPos, setCreateMenuPos] = useState(null); // { x, y, canvasX, canvasY }

  const handleUpdateNote = (id, newData) => {
    // Handle connection deletion
    if (newData._delete && typeof id === 'number' && !notes.find(n => n.id === id)) {
        // This is a connection deletion
        setConnections(prev => prev.filter(c => c.id !== id));
        setSelectedObject(null);
        setSelectedConnectionId(null);
        return;
    }
    
    if (newData._delete) {
        handleDeleteNote(id);
        setSelectedObject(null);
        return;
    }
    if (newData._duplicate) {
        const noteToDuplicate = notes.find(n => n.id === id);
        if (noteToDuplicate) {
            const newNote = {
                ...noteToDuplicate,
                id: Date.now(),
                x: noteToDuplicate.x + 40,
                y: noteToDuplicate.y + 40,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            setNotes(prev => [...prev, newNote]);
        }
        return;
    }
    if (newData._bringToFront) {
        setNotes(prev => {
            const note = prev.find(n => n.id === id);
            const others = prev.filter(n => n.id !== id);
            return [...others, note];
        });
        return;
    }
    if (newData._sendToBack) {
        setNotes(prev => {
            const note = prev.find(n => n.id === id);
            const others = prev.filter(n => n.id !== id);
            return [note, ...others];
        });
        return;
    }
    const updatedNote = { ...newData, updatedAt: Date.now() };
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedNote } : n));
    // Update selected object if it's the one being modified
    if (selectedObject && selectedObject.data.id === id) {
        setSelectedObject(prev => ({ ...prev, data: { ...prev.data, ...updatedNote } }));
    }
  };

  const handleNoteDrag = (id, pos) => {
      // Close edit mode when dragging starts
      if (editingNoteId !== null) {
        setEditingNoteId(null);
      }

      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...pos } : n));
      // Force connection re-render by updating state
      // Bu sayede ipler smooth takip eder
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const handleUpdateBoard = (id, newData) => {
    // Handle board deletion
    if (newData._delete) {
      setBoards(prev => prev.filter(b => b.id !== id));
      if (selectedObject?.type === 'board' && selectedObject?.data.id === id) {
        setSelectedObject(null);
      }
      return;
    }

    setBoards(prev => prev.map(b => b.id === id ? { ...b, ...newData, updatedAt: Date.now() } : b));
    
    // Update selected object if it's the one being modified
    if (selectedObject?.type === 'board' && selectedObject?.data.id === id) {
      setSelectedObject(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
    }
  };

  const handleBoardDrag = (id, pos) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, ...pos } : b));
  };

  const handleSelectBoard = (board) => {
    setSelectedObject({ type: 'board', data: board });
  };

  // Board Item Drag Start
  const handleBoardItemDragStart = (boardId, columnId, item, clientX, clientY) => {
    setDraggingBoardItem({ boardId, columnId, item });
    setBoardItemDragPos({ x: clientX, y: clientY });
  };

  // Global mouse events for board item drag
  useEffect(() => {
    if (!draggingBoardItem) return;

    const handleMouseMove = (e) => {
      setBoardItemDragPos({ x: e.clientX, y: e.clientY });

      // Calculate drop preview position
      const columnElements = document.querySelectorAll('.board-column-content');
      let foundPreview = null;

      columnElements.forEach((colEl) => {
        const rect = colEl.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const boardId = parseFloat(colEl.dataset.boardId);
          const columnId = parseFloat(colEl.dataset.columnId);
          
          let insertIndex = 0;
          const items = colEl.querySelectorAll('.board-item:not(.dragging)');
          items.forEach((itemEl, index) => {
            const itemRect = itemEl.getBoundingClientRect();
            const itemMiddle = itemRect.top + itemRect.height / 2;
            if (e.clientY > itemMiddle) {
              insertIndex = index + 1;
            }
          });

          foundPreview = { boardId, columnId, index: insertIndex };
        }
      });

      setDropPreview(foundPreview);
    };

    const handleMouseUp = (e) => {
      // Find target column under mouse
      const columnElements = document.querySelectorAll('.board-column-content');
      let targetBoardId = null;
      let targetColumnId = null;
      let insertIndex = -1;

      columnElements.forEach((colEl) => {
        const rect = colEl.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          // Use parseFloat because IDs are Date.now() + Math.random() (floats)
          targetBoardId = parseFloat(colEl.dataset.boardId);
          targetColumnId = parseFloat(colEl.dataset.columnId);
          
          // Find insert position based on Y
          const items = colEl.querySelectorAll('.board-item:not(.dragging)');
          items.forEach((itemEl, index) => {
            const itemRect = itemEl.getBoundingClientRect();
            const itemMiddle = itemRect.top + itemRect.height / 2;
            if (e.clientY < itemMiddle && insertIndex === -1) {
              insertIndex = index;
            }
          });
          if (insertIndex === -1) {
            insertIndex = items.length;
          }
        }
      });

      const { boardId: fromBoardId, columnId: fromColumnId, item } = draggingBoardItem;

      // If dropped on a valid column, move the item
      if (targetBoardId && targetColumnId) {
        setBoards(prevBoards => {
          // First, remove item from source column
          let updatedBoards = prevBoards.map(board => {
            if (board.id === fromBoardId) {
              return {
                ...board,
                columns: board.columns.map(col => {
                  if (col.id === fromColumnId) {
                    return { ...col, items: col.items.filter(i => i.id !== item.id) };
                  }
                  return col;
                })
              };
            }
            return board;
          });

          // Then, add item to target column at the correct position
          updatedBoards = updatedBoards.map(board => {
            if (board.id === targetBoardId) {
              return {
                ...board,
                columns: board.columns.map(col => {
                  if (col.id === targetColumnId) {
                    const newItems = [...col.items];
                    newItems.splice(insertIndex, 0, item);
                    return { ...col, items: newItems };
                  }
                  return col;
                })
              };
            }
            return board;
          });

          return updatedBoards;
        });
      }
      // If NOT dropped on a valid column, item stays where it was (no change)

      setDraggingBoardItem(null);
      setDropPreview(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingBoardItem]);

  const handleAddNote = (e) => {
      if (connectingSource) return; // Don't add note if connecting

      // Calculate canvas coordinates
      const canvasX = (e.clientX - transform.x) / transform.scale;
      const canvasY = (e.clientY - transform.y) / transform.scale;

      // Open create menu at click position
      setCreateMenuPos({
        x: e.clientX,
        y: e.clientY,
        canvasX,
        canvasY
      });
  };

  const handleCreateMenuSelect = (itemType) => {
    if (!createMenuPos) return;

    const colors = ['yellow', 'orange', 'red', 'pink', 'purple', 'blue', 'cyan', 'green'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    if (itemType === 'note') {
      const newNote = {
        id: Date.now() + Math.random(),
        x: createMenuPos.canvasX,
        y: createMenuPos.canvasY,
        content: '',
        type: randomColor,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setNotes(prev => [...prev, newNote]);

      // Auto-focus new note for editing
      setTimeout(() => {
        setEditingNoteId(newNote.id);
      }, 100);
    } else if (itemType === 'board') {
      const newBoard = {
        id: Date.now() + Math.random(),
        x: createMenuPos.canvasX,
        y: createMenuPos.canvasY,
        name: 'Board',
        columns: [
          { id: Date.now(), name: 'To Do', items: [] }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setBoards(prev => [...prev, newBoard]);
    }

    // Close menu
    setCreateMenuPos(null);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuPos(null);
  };

  // Pin'e tıklama ile bağlantı oluşturma - DİNAMİK PİN SİSTEMİ
  const handleNoteMouseDown = (noteId, e) => {
    // Shift basılıysa bağlantı modu
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      
      // Tıklanan pozisyonu not koordinatlarına göre hesapla
      const canvasX = (e.clientX - transform.x) / transform.scale;
      const canvasY = (e.clientY - transform.y) / transform.scale;
      
      // Nota göre relative pozisyon
      const relativeX = canvasX - note.x;
      const relativeY = canvasY - note.y;
      
      setConnectingSource({
        noteId,
        pinX: relativeX,
        pinY: relativeY,
        absoluteX: canvasX,
        absoluteY: canvasY
      });
    }
  };

  const handleNoteMouseUp = (noteId, e) => {
    if (connectingSource && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      if (connectingSource.noteId !== noteId) {
        const toNote = notes.find(n => n.id === noteId);
        if (!toNote) return;
        
        // Tıklanan pozisyonu hesapla
        const canvasX = (e.clientX - transform.x) / transform.scale;
        const canvasY = (e.clientY - transform.y) / transform.scale;
        
        // Hedef nota göre relative
        const relativeX = canvasX - toNote.x;
        const relativeY = canvasY - toNote.y;
        
        // İKI NOTA BİRDEN FAZLA BAĞLANTI - Çift kontrol kaldırıldı!
        const newConnection = {
          id: Date.now() + Math.random(), // Unique ID
          from: connectingSource.noteId,
          to: noteId,
          fromPinX: connectingSource.pinX,
          fromPinY: connectingSource.pinY,
          toPinX: relativeX,
          toPinY: relativeY,
          style: {
            color: 'rgba(139, 69, 19, 0.6)',
            thickness: 2
          }
        };
        setConnections(prev => [...prev, newConnection]);
      }
      setConnectingSource(null);
    }
  };

  // Eski handlePinClick - kaldırıldı
  // Eski handleConnectStart ve handleConnectEnd - kaldırıldı

  // Pin Drag Handlers
  const handlePinMouseDown = (connectionId, isFrom, noteId, e) => {
    e.stopPropagation();
    e.preventDefault();

    const canvasX = (e.clientX - transform.x) / transform.scale;
    const canvasY = (e.clientY - transform.y) / transform.scale;

    setDraggingPin({
      connectionId,
      isFrom,
      noteId,
      startX: canvasX,
      startY: canvasY
    });
  };

  const handlePinDrag = (e) => {
    if (!draggingPin) return;

    const canvasX = (e.clientX - transform.x) / transform.scale;
    const canvasY = (e.clientY - transform.y) / transform.scale;

    const note = notes.find(n => n.id === draggingPin.noteId);
    if (!note) return;

    // Calculate relative position to note
    const relativeX = canvasX - note.x;
    const relativeY = canvasY - note.y;

    // Update connection position
    setConnections(prev => prev.map(conn => {
      if (conn.id === draggingPin.connectionId) {
        if (draggingPin.isFrom) {
          return { ...conn, fromPinX: relativeX, fromPinY: relativeY };
        } else {
          return { ...conn, toPinX: relativeX, toPinY: relativeY };
        }
      }
      return conn;
    }));
  };

  const handlePinMouseUp = () => {
    if (draggingPin) {
      setDraggingPin(null);
    }
  };

  // Global mouse move for temp line and pin dragging
  const handleMouseMove = (e) => {
    if (connectingSource) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
    if (draggingPin) {
      handlePinDrag(e);
    }
  };

  // Attach global mouse up to cancel connection if dropped on empty space
  const handleGlobalMouseUp = () => {
    if (connectingSource) {
      setConnectingSource(null);
    }
    if (draggingPin) {
      handlePinMouseUp();
    }
  };

  // Bağlantı seçimi
  const handleSelectConnection = (connection) => {
    setSelectedObject({ type: 'connection', data: connection });
    setSelectedConnectionId(connection.id);
  };

  const handleHoverConnection = (connection) => {
    setHoveredConnectionId(connection.id);
  };

  const handleHoverEndConnection = () => {
    setHoveredConnectionId(null);
  };

  const handleSelectNote = (note) => {
      setSelectedObject({ type: 'note', data: note });
  };

  const handleDeselect = () => {
      setSelectedObject(null);
  };

  const handleCopyAllNotes = async () => {
      const allText = notes.map(note => note.content).filter(content => content.trim()).join('\n\n');
      if (allText) {
          try {
              await navigator.clipboard.writeText(allText);
              setShowToast(true);
          } catch (err) {
              console.error('Failed to copy:', err);
          }
      }
  };

  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState(null);

  const handleCanvasClick = (e) => {
      // Don't interfere with textareas, buttons, or other interactive elements
      const isInteractive = e.target.tagName === 'TEXTAREA' || 
                           e.target.tagName === 'BUTTON' || 
                           e.target.tagName === 'INPUT' ||
                           e.target.closest('button') ||
                           e.target.closest('.editor-toolbar') ||
                           e.target.closest('.note');
      
      if (isInteractive) {
          return;
      }

      // Only handle clicks on background
      if (e.target.classList.contains('canvas-content') || e.target.classList.contains('app-container')) {
          handleDeselect();
      }
  };

  const handleCanvasDoubleClick = (e) => {
      // Don't interfere with interactive elements
      const isInteractive = e.target.tagName === 'TEXTAREA' || 
                           e.target.tagName === 'BUTTON' || 
                           e.target.tagName === 'INPUT' ||
                           e.target.closest('button') ||
                           e.target.closest('.editor-toolbar') ||
                           e.target.closest('.note');
      
      if (isInteractive) {
          return;
      }

      // Only create note on background double-click
      if (e.target.classList.contains('canvas-content') || e.target.classList.contains('app-container')) {
          handleAddNote(e);
      }
  };

  const handleCopyNote = async (content) => {
      if (content) {
          try {
              await navigator.clipboard.writeText(content);
              setShowToast(true);
          } catch (err) {
              console.error('Failed to copy:', err);
          }
      }
  };

  return (
    <div 
        className="app-container" 
        onMouseMove={handleMouseMove}
        onMouseUp={handleGlobalMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
    >
      {showIntro && <BreathIntro onComplete={() => { 
        setShowIntro(false); 
        setAnimationsReady(true); 
      }} />}
      
      <ContextDock selectedObject={selectedObject} onUpdate={handleUpdateNote} onBoardUpdate={handleUpdateBoard} />

      <div className={`ui-elements animated ${zenMode ? 'zen-hidden' : ''} ${animationsReady ? 'show-animation' : ''}`}>
        <Sidebar 
            workspaces={workspaces} 
            currentWorkspace={currentWorkspace} 
            onSwitchWorkspace={setCurrentWorkspace}
            onAddWorkspace={handleAddWorkspace}
        />
        
        <LofiPlayer />

        <FloatingMenu />
      </div>

      <ZenModeButton zenMode={zenMode} onToggle={() => setZenMode(!zenMode)} />

      <Canvas transform={transform} handlers={handlers}>
        {/* ConnectionsLayer - Canvas içinde ilk eleman, notların altında */}
        <ConnectionsLayer
          connections={connections}
          notes={notes}
          connectingSource={connectingSource}
          mousePos={mousePos}
          transform={transform}
          selectedConnectionId={selectedConnectionId}
          hoveredConnectionId={hoveredConnectionId}
          onSelectConnection={handleSelectConnection}
          onHoverConnection={handleHoverConnection}
          onHoverEndConnection={handleHoverEndConnection}
        />

        {notes.map(note => (
              <Note
                key={note.id}
                id={note.id}
                content={note.content}
                x={note.x}
                y={note.y}
                type={note.type}
                fontStyle={note.fontStyle}
                fontSize={note.fontSize}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onNoteMouseDown={handleNoteMouseDown}
                onNoteMouseUp={handleNoteMouseUp}
                onDrag={handleNoteDrag}
                onSelect={() => handleSelectNote(note)}
                onCopy={() => handleCopyNote(note.content)}
                isSelected={selectedObject?.data.id === note.id}
                editingNoteId={editingNoteId}
                setEditingNoteId={setEditingNoteId}
                scale={transform.scale}
                transform={transform}
                connections={connections}
                connectingSource={connectingSource}
                hoveredConnectionId={hoveredConnectionId}
                renderPins={false}
              />
        ))}

        {/* Boards */}
        {boards.map(board => (
          <Board
            key={board.id}
            id={board.id}
            x={board.x}
            y={board.y}
            name={board.name}
            columns={board.columns}
            titleFontStyle={board.titleFontStyle}
            titleFontSize={board.titleFontSize}
            backgroundColor={board.backgroundColor}
            onUpdate={handleUpdateBoard}
            onDrag={handleBoardDrag}
            onSelect={() => handleSelectBoard(board)}
            isSelected={selectedObject?.type === 'board' && selectedObject?.data.id === board.id}
            scale={transform.scale}
            onItemDragStart={handleBoardItemDragStart}
            draggingItem={draggingBoardItem?.item}
            dropPreview={dropPreview?.boardId === board.id ? dropPreview : null}
          />
        ))}

        {/* Pinler - Notlardan ayrı, en üstte render et */}
        {notes.map(note =>
          connections.filter(c => c.from === note.id || c.to === note.id).map(conn => {
            const isFrom = conn.from === note.id;
            const pinX = note.x + (isFrom ? conn.fromPinX : conn.toPinX);
            const pinY = note.y + (isFrom ? conn.fromPinY : conn.toPinY);
            const isConnectionHovered = hoveredConnectionId === conn.id;
            const isDragging = draggingPin?.connectionId === conn.id && draggingPin?.isFrom === isFrom;

            return (
              <div
                key={`pin-${conn.id}-${note.id}-${isFrom ? 'from' : 'to'}`}
                className={`note-pushpin ${isConnectionHovered ? 'hovered' : ''} ${isDragging ? 'dragging' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${pinX}px`,
                  top: `${pinY}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  pointerEvents: 'auto'
                }}
                onMouseEnter={() => {
                  const hoverEvent = new CustomEvent('connectionHover', { 
                    detail: { connectionId: conn.id } 
                  });
                  document.dispatchEvent(hoverEvent);
                }}
                onMouseLeave={() => {
                  const hoverEndEvent = new CustomEvent('connectionHoverEnd');
                  document.dispatchEvent(hoverEndEvent);
                }}
                onMouseDown={(e) => {
                  if (e.shiftKey && e.button === 0) {
                    // Shift+click on pin = drag pin to reposition
                    handlePinMouseDown(conn.id, isFrom, note.id, e);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.shiftKey) {
                    handleUpdateNote(conn.id, { _delete: true });
                  }
                }}
              >
                <div className="pushpin-head" />
                <div className="pushpin-needle" />
              </div>
            );
          })
        )}

        {/* Aktif bağlantı göstergesi */}
        {connectingSource && (() => {
          const sourceNote = notes.find(n => n.id === connectingSource.noteId);
          if (!sourceNote) return null;
          
          return (
            <div
              className="note-pin-indicator active-connecting"
              style={{
                position: 'absolute',
                left: `${sourceNote.x + connectingSource.pinX}px`,
                top: `${sourceNote.y + connectingSource.pinY}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 1001
              }}
            >
              <div className="pushpin-head pulsing" />
              <div className="pushpin-needle" />
            </div>
          );
        })()}
      </Canvas>

      <CreateMenu
        position={createMenuPos}
        onSelect={handleCreateMenuSelect}
        onClose={handleCreateMenuClose}
      />

      {showToast && <Toast message="Copied!" onClose={() => setShowToast(false)} />}

      {/* Board Item Drag Ghost */}
	      {draggingBoardItem && (
	        <div
	          className={`board-item-ghost ${draggingBoardItem.item.color} ${draggingBoardItem.item.isExpanded ? 'expanded' : ''}`}
	          style={{
	            position: 'fixed',
	            left: boardItemDragPos.x - 90,
	            top: boardItemDragPos.y - 20,
	            pointerEvents: 'none',
	            zIndex: 9999,
	            opacity: 0.85,
	            width: 180,
	            minHeight: draggingBoardItem.item.isExpanded ? 260 : 120,
	            display: 'flex',
	            flexDirection: 'column',
	            background: `var(--note-${draggingBoardItem.item.color})`,
	            paddingTop: 12,
	            boxShadow: '4px 4px 15px rgba(0,0,0,0.3)',
            borderRadius: 2
          }}
        >
          <div className="board-item-pin" style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)' }}>
            <div className="pushpin-head" style={{
              width: 14, height: 14, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, #FFB8B8, #FFA0A0 50%, #FF8888)',
              border: '2px solid rgba(255,255,255,0.9)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.18)'
            }} />
          </div>
	          <div style={{
	            padding: '8px 12px 12px 12px',
	            fontFamily: 'Patrick Hand, cursive',
	            fontSize: '1rem',
	            color: '#2c241b',
	            minHeight: draggingBoardItem.item.isExpanded ? 220 : 88,
	            height: draggingBoardItem.item.isExpanded ? 220 : 88,
	            overflow: 'hidden',
	            whiteSpace: 'pre-wrap',
	            wordBreak: 'break-word',
            lineHeight: 1.4
          }}>
            {draggingBoardItem.item.content || 'New task'}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
