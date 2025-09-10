# Evolu Flow

A modern, offline-first todo application built with React, TypeScript, and Evolu - a reactive database for the web.

## 🚀 Project Overview

This is a Progressive Web App (PWA) that demonstrates advanced React patterns and offline-first architecture using Evolu as the database layer. The app provides a clean, intuitive interface for managing todos with features like keyboard shortcuts, context menus, and responsive design.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Database:** Evolu (SQLite-based reactive database for web)
- **Styling:** Tailwind CSS with custom dark mode
- **Build Tool:** Vite
- **PWA:** Vite PWA plugin for offline functionality

## 📁 Project Structure

```
src/
├── components/
│   ├── ui.tsx              # Shared UI components (Button, NotificationBar)
│   ├── TodoForm.tsx        # Bottom-fixed form for adding todos with keyboard shortcuts
│   ├── TodoComponents.tsx  # Todo list and individual todo items
│   ├── SettingsMenu.tsx    # Settings dropdown with owner management
│   ├── SettingsIcon.tsx    # Settings gear icon in top-right corner
│   └── ContextMenu.tsx     # Reusable context menu component
├── lib/
│   ├── evolu-config.ts     # Evolu database configuration and queries
│   ├── schema.ts           # Database schema definitions (Todo, Person types)
│   └── utils.ts            # Error formatting utilities
└── App.tsx                 # Main application component
```

## 🎯 Key Features

### Core Functionality

- ✅ **Add Todos:** Bottom-fixed input with Enter key support
- ✅ **Toggle Status:** Click todos to cycle through: Todo → In Progress → Done
- ✅ **Edit Todos:** Right-click/long-tap for rename option
- ✅ **Delete Todos:** Context menu delete with confirmation
- ✅ **Offline-First:** Works without internet connection

### Advanced Features

- ✅ **Keyboard Shortcuts:** Alt+N (Win/Linux) or Option+N (Mac) to focus input
- ✅ **Context Menus:** Right-click or long-tap for actions
- ✅ **Visual Feedback:** Focus indicators and hover effects
- ✅ **Cross-Platform:** Optimized for desktop and mobile
- ✅ **Dark Mode:** Automatic theme switching
- ✅ **Settings Menu:** Owner management, database export, changelog

## 🗄️ Database Schema

```typescript
// Main Todo table
const Schema = {
  todo: {
    id: TodoId, // Auto-generated unique ID
    title: NonEmptyString1000, // Todo text (required)
    status: TodoStatus, // "todo" | "done" | "in progress"
    personJson: nullOr(PersonJson), // Optional person data
  },
};

// Person structure (stored as JSON)
const Person = object({
  name: NonEmptyString50, // Person name
  age: FiniteNumber, // Person age
});
```

## 🔧 Component Architecture

### App.tsx (Main Container)

- Wraps everything in `EvoluProvider`
- Contains `SettingsIcon` and `SettingsMenu`
- Includes `TodoForm` (fixed at bottom)
- Renders `Todos` component with scrollable list

### TodoForm.tsx (Bottom Input)

- **Keyboard Shortcuts:** Global Alt+N/Option+N detection
- **Key State Tracking:** Robust handling of modifier keys and dead keys
- **Visual Indicators:** Focus states with ring effects and color changes
- **Platform Detection:** Shows correct shortcut (⌥N vs Alt+N)

### TodoComponents.tsx (Todo List)

- **TodoItem:** Individual todo with status cycling
- **Context Menu:** Right-click/long-tap actions (rename, delete)
- **Status Management:** Click to cycle: todo → in progress → done → todo

### SettingsMenu.tsx (Top-Right Menu)

- **Owner Management:** Show/hide mnemonic, restore/reset owner
- **Database:** Export SQLite database file
- **Debug:** View changelog history
- **Modal:** Mnemonic display in overlay modal

## 🎨 UI/UX Highlights

### Responsive Design

- Mobile-first approach with touch-friendly interactions
- Adaptive layout for different screen sizes
- Proper z-index management for overlays

### Accessibility

- Keyboard navigation support
- Screen reader friendly markup
- Proper focus management
- Semantic HTML structure

### Performance

- React.memo for component optimization
- Efficient re-rendering with Evolu queries
- Minimal bundle size with Vite optimization

## 🔑 Key Technical Decisions

### Evolu Database Choice

- **Offline-First:** Works without network connection
- **Reactive:** Automatic UI updates when data changes
- **Type-Safe:** Full TypeScript integration
- **SQLite-Based:** Familiar SQL-like queries
- **Cross-Platform:** Same API for web and mobile

### Keyboard Shortcut Implementation

- **State Tracking:** Uses Set to track pressed keys for reliability
- **Dead Key Handling:** Special handling for Mac Option+N dead keys
- **Event Capture:** Uses capture phase for early event interception
- **Fallback Strategy:** Multiple detection methods for maximum compatibility

### Context Menu System

- **Reusable Component:** Generic ContextMenu with customizable items
- **Positioning:** Smart positioning relative to trigger element
- **Mobile Support:** Long-tap detection for touch devices
- **Click Outside:** Automatic closing when clicking elsewhere

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate PWA assets
npm run generate-pwa-assets

# Lint code
npm run lint
```

## 📱 Progressive Web App Features

- **Installable:** Can be installed as desktop/mobile app
- **Offline Support:** Full functionality without internet
- **Service Worker:** Automatic caching and updates
- **Manifest:** Proper app metadata and icons

## 🔒 Data Persistence

- **Local Storage:** SQLite database stored locally
- **Sync Ready:** Evolu supports data synchronization
- **Owner Management:** Mnemonic-based data ownership
- **Backup/Restore:** Export/import database functionality

## 🎯 Learning Points

This project demonstrates:

- Modern React patterns with hooks and refs
- Offline-first architecture with Evolu
- Complex keyboard event handling
- Context menu implementation
- PWA development
- TypeScript integration
- Cross-platform compatibility
- Responsive design principles

## 📈 Future Enhancements

- [ ] Todo categories/tags
- [ ] Due dates and reminders
- [ ] Drag-and-drop reordering
- [ ] Data synchronization across devices
- [ ] Search and filtering
- [ ] Todo templates
- [ ] Collaboration features

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Evolu**
