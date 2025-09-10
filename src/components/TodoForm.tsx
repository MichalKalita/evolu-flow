import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useEvolu } from "../lib/evolu-config";
import { Button } from "./ui";

export interface TodoFormRef {
  focusInput: () => void;
}

export const TodoForm = forwardRef<TodoFormRef>((props, ref) => {
  const { insert } = useEvolu();
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  // Expose focusInput method to parent components
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }));

  // Detect platform for shortcut display
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌥' : 'Alt';
  const shortcutText = `${shortcutKey}+N`;

  const handleAddTodo = (title: string) => {
    if (title.trim() === "") return;

    const result = insert("todo", {
      title: title.trim(),
      status: "todo",
      previousId: null, // New items from form go to the end (no previous item)
    });

    if (!result.ok) {
      alert("Failed to add todo");
    } else {
      setNewTodoTitle("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTodo(newTodoTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTodo(newTodoTitle);
    }
  };

  // Global keyboard shortcut listener with proper key state tracking
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Track pressed keys
      keysPressed.current.add(e.key.toLowerCase());

      // Check if Alt/Option + N combination is pressed
      const hasModifier = keysPressed.current.has('alt') || keysPressed.current.has('meta') || e.altKey || e.metaKey;
      const isNKey = e.key.toLowerCase() === 'n';
      const isDeadKey = e.key === 'Dead' || e.key.startsWith('Dead');

      // Handle both regular N key and Dead key (Option+N on Mac can produce Dead key)
      if (hasModifier && (isNKey || isDeadKey)) {
        // Don't trigger if we're already in an input field
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (inputRef.current) {
          // Small delay to ensure component is fully mounted
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 10);
        } else {
          // Fallback: try to find the input by querySelector
          const inputElement = document.querySelector('input[placeholder*="What needs to be done"]') as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
          }
        }
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      // Remove key from pressed set when released
      keysPressed.current.delete(e.key.toLowerCase());
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true); // Use capture phase
    document.addEventListener('keyup', handleGlobalKeyUp, true); // Use capture phase

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      document.removeEventListener('keyup', handleGlobalKeyUp, true);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
      <div className="max-w-screen-sm mx-auto flex gap-2">
        <div className="flex-1 relative focus-within:ring-4 focus-within:ring-blue-500/20 rounded-md">
          <input
            ref={inputRef}
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400/20 dark:focus:border-blue-400 dark:focus:bg-blue-900/20 shadow-sm focus:shadow-md"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs transition-colors duration-200 text-gray-400 dark:text-gray-500 select-none focus-within:text-blue-600 dark:focus-within:text-blue-400">
            {shortcutText}
          </div>
        </div>
        <Button
          title="Add Todo"
          onClick={() => handleAddTodo(newTodoTitle)}
          className="whitespace-nowrap"
        />
      </div>
    </form>
  );
});
