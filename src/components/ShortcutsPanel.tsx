import React, { FC } from "react";

interface ShortcutsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  action: string;
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { key: "H", action: "Help", description: "Toggle shortcuts panel" },
  { key: "Space", action: "Toggle", description: "Toggle todo status" },
  { key: "A", action: "Focus Form", description: "Focus on bottom form" },
  { key: "I", action: "Insert", description: "Insert after actual position" },
  { key: "R", action: "Reword", description: "Rename focused todo" },
  { key: "Tab", action: "Navigate", description: "Move to next todo" },
  { key: "Shift+Tab", action: "Navigate", description: "Move to previous todo" },
  { key: "↑/↓", action: "Navigate", description: "Move between dates" },
  { key: "←/→", action: "Navigate", description: "Move between todos" },
];

const formatShortcutKey = (key: string): JSX.Element => {
  const parts = key.split('+');
  if (parts.length > 1) {
    return (
      <>
        <span>{parts[0]}</span>
        <span>+</span>
        <span>{parts[1]}</span>
      </>
    );
  } else {
    return <span>{key}</span>;
  }
};

export const ShortcutsPanel: FC<ShortcutsPanelProps> = ({ isVisible, onClose }) => {
  // Handle escape key to close panel
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-20 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Keyboard Shortcuts
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl leading-none"
          aria-label="Close shortcuts panel"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {shortcut.action}
              </span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded border text-gray-800 dark:text-gray-200">
                {formatShortcutKey(shortcut.key)}
              </kbd>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};
