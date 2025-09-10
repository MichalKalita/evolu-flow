import { Suspense, useState, useEffect } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "./lib/evolu-config";
import { NotificationBar } from "./components/ui";
import { Todos } from "./components/TodoComponents";
import { TodoForm } from "./components/TodoForm";
import { createRef } from "react";
import { SettingsIcon } from "./components/SettingsIcon";
import { SettingsMenu } from "./components/SettingsMenu";
import { ShortcutsPanel } from "./components/ShortcutsPanel";
import PWABadge from "./PWABadge.tsx";

function App() {
  const [settingsMenu, setSettingsMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });

  const [shortcutsVisible, setShortcutsVisible] = useState(false);

  // Ref for TodoForm to focus on input
  const todoFormRef = createRef<{ focusInput: () => void }>();

  const handleSettingsClick = (position: { x: number; y: number }) => {
    setSettingsMenu({
      isVisible: true,
      position,
    });
  };

  const handleSettingsClose = () => {
    setSettingsMenu({
      isVisible: false,
      position: { x: 0, y: 0 },
    });
  };

  const handleShortcutsToggle = () => {
    setShortcutsVisible(prev => !prev);
  };

  // Global keyboard handler for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleShortcutsToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden dark:bg-neutral-900 dark:text-neutral-200 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Evolu Flow</h1>
          <div
            className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 select-none"
            onClick={handleShortcutsToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleShortcutsToggle();
              }
            }}
          >
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">H</kbd> for help
          </div>
        </div>

        <ShortcutsPanel isVisible={shortcutsVisible} onClose={() => setShortcutsVisible(false)} />

      <EvoluProvider value={evolu}>
        <NotificationBar />
        <Suspense>
          <Todos todoFormRef={todoFormRef} />
        </Suspense>

        <SettingsIcon onSettingsClick={handleSettingsClick} />
        <SettingsMenu
          isVisible={settingsMenu.isVisible}
          position={settingsMenu.position}
          onClose={handleSettingsClose}
        />

        <TodoForm ref={todoFormRef} />
      </EvoluProvider>

      <PWABadge />
      </div>
    </div>
  );
}

export default App;
