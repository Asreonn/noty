# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Cozy Not-To-Do Canvas" is a React-based infinite canvas application focused on creating a calm, cozy workspace for notes with emphasis on "not-to-do" items rather than traditional to-do lists. All data is stored locally in browser localStorage. See `rapor.md` for complete design philosophy and feature specifications (in Turkish).

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
vite build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core State Management

The app uses React hooks for state management without external libraries. Main state is centralized in `App.jsx`:

- **Workspace System**: Multiple workspaces stored in localStorage with independent note collections
- **Notes**: Array of note objects with `{id, x, y, content, type, fontStyle, fontSize}`
- **Connections**: Array of line connections between notes `{id, from, to}`
- **Transform**: Canvas pan/zoom state managed by `useCanvas` hook

### Data Flow

1. **Storage Layer** (`src/utils/storage.js`): LocalStorage wrapper with error handling
2. **Workspace Loading**: On workspace switch, data loads via `loadFromStorage()` with automatic migration for old color types (`note`→`yellow`, `not-to-do`→`red`)
3. **Auto-Save**: Notes/connections save to localStorage on every change via `useEffect`
4. **Migration**: Old note types are automatically converted to new color-based types (src/App.jsx:32-37)

### Component Structure

```
App.jsx (main state + orchestration)
├── Canvas.jsx (infinite pan/zoom container)
│   ├── Note/Note.jsx (draggable markdown notes)
│   └── SVG connections layer
├── ContextDock/ContextDock.jsx (floating property editor)
│   └── ColorPicker.jsx (preset + custom hex colors)
├── Sidebar.jsx (workspace switcher)
├── FloatingMenu.jsx (zen mode toggle)
├── BreathIntro.jsx (initial calm intro animation)
└── LofiPlayer.jsx (embedded music player)
```

### Key Interactions

**Note Creation**: Double-click canvas → creates note at cursor with random color
**Note Editing**: Double-click note → enter edit mode with markdown support
**Note Dragging**: Click+drag note tape → move note (hold Ctrl for grid snap)
**Connections**: Shift+click note → drag to another note → creates dashed line
**Selection**: Click note → shows in ContextDock for color/font editing
**Canvas Navigation**:
  - Scroll wheel = zoom
  - Click+drag background = pan
  - Middle mouse = pan

### Color System

Notes use standardized color names: `yellow`, `red`, `blue`, `green`, `purple`, `orange`, `pink`, `cyan`, or hex values (e.g., `#ff5733`). Colors map to CSS classes in `Note.css` with pastel palette for "cozy" aesthetic.

### Custom Hook: useCanvas

Located in `src/hooks/useCanvas.js`. Manages pan/zoom transform state and mouse event handlers for infinite canvas navigation. Returns `{transform, handlers}` object consumed by Canvas component.

### Performance Optimizations

- Note drag uses `requestAnimationFrame` for throttled updates (src/components/Note/Note.jsx:79-82)
- Connection updates only on RAF callback during drag
- Transform applied via CSS `transform` property for GPU acceleration

## Important Patterns

### Preventing Event Bubbling

Notes and canvas have overlapping click handlers. Always use `e.stopPropagation()` on note interactions to prevent triggering canvas pan or note creation.

### Markdown Support

Notes use `react-markdown` library. Content is stored raw and rendered on blur. Edit mode shows plain textarea, view mode renders markdown.

### Grid Snapping

Hold Ctrl during drag to snap to 20px grid. Logic in Note.jsx:70-74 rounds position to nearest grid multiple only when Ctrl is pressed.

## Design Philosophy

- **Zero Friction**: Notes auto-focus on creation for immediate typing
- **Cozy Aesthetic**: Pastel colors, soft typography, calm interactions
- **Local-First**: No backend, all data in localStorage
- **Privacy**: User data never leaves browser
- **Markdown**: Rich formatting without complexity

## Common Pitfall

When adding new note properties, remember to:
1. Update the note object structure in App.jsx
2. Pass new props to Note component
3. Handle in ContextDock if user-editable
4. Consider migration for existing localStorage data
