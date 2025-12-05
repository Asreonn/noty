import React from 'react';
import { StickyNote, CheckSquare, Image, Link2, Circle, Columns } from 'lucide-react';
import './CreateMenu.css';

const CreateMenu = ({ position, onSelect, onClose }) => {
  if (!position) return null;

  const menuItems = [
    {
      id: 'note',
      label: 'Note',
      icon: StickyNote,
      description: 'Sticky note',
      color: '#FFE9A0'
    },
    {
      id: 'board',
      label: 'Board',
      icon: Columns,
      description: 'Kanban board',
      color: '#FAF7F2'
    },
    // Gelecekte eklenecekler:
    // {
    //   id: 'image',
    //   label: 'Image',
    //   icon: Image,
    //   description: 'Add an image',
    //   color: '#B8E0FF',
    //   disabled: true
    // },
    // {
    //   id: 'link',
    //   label: 'Link',
    //   icon: Link2,
    //   description: 'Create a connector',
    //   color: '#FFB8E8',
    //   disabled: true
    // },
    // {
    //   id: 'shape',
    //   label: 'Shape',
    //   icon: Circle,
    //   description: 'Draw a shape',
    //   color: '#C8FFB8',
    //   disabled: true
    // }
  ];

  return (
    <>
      {/* Backdrop to close menu */}
      <div className="create-menu-backdrop" onClick={onClose} />

      <div
        className="create-menu"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
        <div className="create-menu-header">
          <span className="create-menu-title">Create</span>
        </div>

        <div className="create-menu-items">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`create-menu-item ${item.disabled ? 'disabled' : ''}`}
                onClick={() => !item.disabled && onSelect(item.id)}
                disabled={item.disabled}
              >
                <div
                  className="create-menu-item-icon"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon size={16} strokeWidth={2.5} />
                </div>
                <div className="create-menu-item-text">
                  <span className="create-menu-item-label">{item.label}</span>
                  <span className="create-menu-item-description">{item.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="create-menu-footer">
          <span className="create-menu-hint">More types coming soon...</span>
        </div>
      </div>
    </>
  );
};

export default CreateMenu;
