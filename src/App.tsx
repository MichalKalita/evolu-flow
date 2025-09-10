import { EvoluExample } from "./components/EvoluDemo.tsx";
import PWABadge from "./PWABadge.tsx";

function App() {
  return (
    <div className="w-screen h-screen dark:bg-neutral-900 dark:text-neutral-200 p-4">
      <h1 className="text-2xl font-bold">Evolu Todo List</h1>
      <EvoluExample />

      <PWABadge />
    </div>
  );
}

export default App;
