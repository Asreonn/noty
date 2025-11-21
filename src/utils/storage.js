export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
};

export const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from local storage:', error);
    return null;
  }
};

export const getWorkspaces = () => {
    try {
        const workspaces = localStorage.getItem('cozy-workspaces');
        return workspaces ? JSON.parse(workspaces) : ['Main'];
    } catch (error) {
        return ['Main'];
    }
};

export const saveWorkspaces = (workspaces) => {
    localStorage.setItem('cozy-workspaces', JSON.stringify(workspaces));
};
