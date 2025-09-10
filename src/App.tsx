import { Suspense } from "react";
import { EvoluProvider } from "@evolu/react";
import { evolu } from "./lib/evolu-config";
import { NotificationBar } from "./components/ui";
import { Todos } from "./components/TodoComponents";
import { OwnerActions } from "./components/OwnerActions";
import { Changelog } from "./components/Changelog";
import PWABadge from "./PWABadge.tsx";

function App() {
  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden dark:bg-neutral-900 dark:text-neutral-200 p-4">
      <h1 className="text-2xl font-bold">Evolu Todo List</h1>

      <EvoluProvider value={evolu}>
        <NotificationBar />
        <Suspense>
          <Todos />
          <OwnerActions />
          <Changelog />
        </Suspense>
      </EvoluProvider>

      <PWABadge />
    </div>
  );
}

export default App;
