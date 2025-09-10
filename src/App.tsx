import { Suspense, useState } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "./lib/evolu-config";
import { NotificationBar } from "./components/ui";
import { Todos } from "./components/TodoComponents";
import { TodoForm } from "./components/TodoForm";
import { SettingsIcon } from "./components/SettingsIcon";
import { SettingsMenu } from "./components/SettingsMenu";
import PWABadge from "./PWABadge.tsx";

function App() {
  const [settingsMenu, setSettingsMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });

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

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden dark:bg-neutral-900 dark:text-neutral-200 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Evolu Todo List</h1>

      <EvoluProvider value={evolu}>
        <NotificationBar />
        <Suspense>
          <Todos />
        </Suspense>

        <SettingsIcon onSettingsClick={handleSettingsClick} />
        <SettingsMenu
          isVisible={settingsMenu.isVisible}
          position={settingsMenu.position}
          onClose={handleSettingsClose}
        />

        <TodoForm />
      </EvoluProvider>

      <PWABadge />
      </div>
    </div>
  );
}

export default App;
