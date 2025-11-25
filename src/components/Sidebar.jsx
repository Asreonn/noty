import React, { useState } from 'react';
import { Plus, Layout } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ workspaces, currentWorkspace, onSwitchWorkspace, onAddWorkspace }) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e) => {
      e.preventDefault();
      if (newWorkspaceName.trim()) {
          onAddWorkspace(newWorkspaceName.trim());
          setNewWorkspaceName('');
          setIsAdding(false);
      }
  };

  return (
    <div className="sidebar">
        <div className="sidebar-header">
            <h3>Workspaces</h3>
        </div>
            
            <div className="workspace-list">
                {workspaces.map(ws => (
                    <button 
                        key={ws}
                        className={`workspace-item ${currentWorkspace === ws ? 'active' : ''}`}
                        onClick={() => {
                            onSwitchWorkspace(ws);
                        }}
                    >
                        <Layout size={16} />
                        <span>{ws}</span>
                    </button>
                ))}
            </div>

            {isAdding ? (
                <form onSubmit={handleAdd} className="add-workspace-form">
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Name..." 
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onBlur={() => setIsAdding(false)}
                    />
                </form>
            ) : (
                <button className="add-workspace-btn" onClick={() => setIsAdding(true)}>
                    <Plus size={16} />
                    <span>New Workspace</span>
                </button>
            )}
        </div>
  );
};

export default Sidebar;
