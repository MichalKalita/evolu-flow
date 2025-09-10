import React, { FC, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@evolu/react";
import { twMerge } from "tailwind-merge";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { todosWithCategories, TodosWithCategoriesRow, useEvolu } from "../lib/evolu-config";
import { formatTypeError } from "../lib/utils";

// Modal Component
const AddTodoModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  afterItemTitle: string;
}> = ({ isOpen, onClose, onSubmit, afterItemTitle }) => {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Insert todo after "{afterItemTitle}"
        </h3>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter todo title..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Insert Todo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TodosProps {
  todoFormRef: React.RefObject<{ focusInput: () => void }>;
}

export const Todos: FC<TodosProps> = ({ todoFormRef }) => {
  const rows = useQuery(todosWithCategories);
  const [focusedDateIndex, setFocusedDateIndex] = useState(0);
  const [focusedTodoIndex, setFocusedTodoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { update, insert } = useEvolu();

  // Function to sort todos by linked list structure
  const sortTodosByLinkedList = useCallback((todos: TodosWithCategoriesRow[]) => {
    if (!todos.length) return [];

    const todoMap = new Map(todos.map(todo => [todo.id as string, todo]));
    const sorted: TodosWithCategoriesRow[] = [];
    const visited = new Set<string>();

    // Find items with no previousId (starting points)
    const startingPoints = todos.filter(todo => todo.previousId == null);

    // If no starting points, use the first item as a fallback
    if (startingPoints.length === 0 && todos.length > 0) {
      startingPoints.push(todos[0]);
    }

    // Traverse from each starting point
    const traverseFrom = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const currentTodo = todoMap.get(currentId as string & { __brand: "Id" } & { __brand: "Todo" });
      if (!currentTodo) return;

      sorted.push(currentTodo);

      // Find all items that have this item as their previousId
      const nextItems = todos.filter(todo =>
        todo.previousId == currentId && !visited.has(todo.id)
      );

      // Sort next items by createdAt to maintain some predictability
      nextItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Traverse each next item
      nextItems.forEach(nextItem => traverseFrom(nextItem.id));
    };

    // Start traversal from each starting point
    startingPoints.forEach(startItem => {
      if (!visited.has(startItem.id)) {
        traverseFrom(startItem.id);
      }
    });

    // Add any remaining items that weren't reached (orphans)
    todos.forEach(todo => {
      if (!visited.has(todo.id)) {
        sorted.push(todo);
      }
    });

    return sorted;
  }, []);

  // Group todos by date and sort each group
  const groupedTodos = useMemo(() => {
    const groups = rows.reduce((acc, row) => {
      const date = new Date(row.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(row);
      return acc;
    }, {} as Record<string, TodosWithCategoriesRow[]>);

    // Sort each date group by linked list structure
    Object.keys(groups).forEach(date => {
      groups[date] = sortTodosByLinkedList(groups[date]);
    });

    return groups;
  }, [rows, sortTodosByLinkedList]);

  const dateKeys = Object.keys(groupedTodos);

  // Get the currently focused todo item for the modal
  const currentDateKey = useMemo(() => dateKeys[focusedDateIndex], [dateKeys, focusedDateIndex]);
  const currentTodos = useMemo(() => currentDateKey ? groupedTodos[currentDateKey] : [], [currentDateKey, groupedTodos]);
  const focusedTodo = useMemo(() => currentTodos[focusedTodoIndex], [currentTodos, focusedTodoIndex]);

  // Modal handlers
  const handleModalClose = () => setIsModalOpen(false);

  const handleModalSubmit = (title: string) => {
    addTodoAfterFocused(title);
    setIsModalOpen(false);
  };

  // Function to toggle the currently focused todo item
  const toggleFocusedTodo = useCallback(() => {
    const focusedTodo = currentTodos[focusedTodoIndex];

    if (focusedTodo) {
      update("todo", {
        id: focusedTodo.id,
        status:
          focusedTodo.status === "todo"
            ? "in progress"
            : focusedTodo.status === "in progress"
              ? "done"
              : "todo",
      });
    }
  }, [currentTodos, focusedTodoIndex, update]);

  // Function to add a new todo item after the currently focused item
  const addTodoAfterFocused = useCallback((title: string) => {
    if (focusedTodo && title.trim()) {
      // Create new todo with proper linked list structure
      const newTodoData = {
        title: title.trim(),
        status: "todo" as const,
        previousId: focusedTodo.id,
      };

      // Insert the new todo
      const result = insert("todo", newTodoData);

      if (result.ok) {
        // Calculate the expected position for the new item
        // The new item should appear right after the focused item
        const expectedNewIndex = focusedTodoIndex + 1;

        // Set focus to the expected position immediately
        setFocusedTodoIndex(expectedNewIndex);

        // Find all items that come after the focused item and update their previousId
        // This is needed because we're only using previousId (singly linked list)
        currentTodos.forEach((todo, index) => {
          if (index > focusedTodoIndex && todo.previousId == focusedTodo.id) {
            update("todo", {
              id: todo.id,
              previousId: result.value.id,
            });
          }
        });

        // Return the new item's ID
        return result.value.id;
      }
    }
    return null;
  }, [focusedTodo, currentTodos, focusedTodoIndex, insert, update]);

  // Navigation functions
  const navigateToNextDate = useCallback(() => {
    setFocusedDateIndex(prev => (prev + 1) % dateKeys.length);
    setFocusedTodoIndex(0);
  }, [dateKeys.length]);

  const navigateToPrevDate = useCallback(() => {
    setFocusedDateIndex(prev => (prev - 1 + dateKeys.length) % dateKeys.length);
    setFocusedTodoIndex(0);
  }, [dateKeys.length]);

  const navigateToNextTodo = useCallback(() => {
    const currentDateTodos = groupedTodos[dateKeys[focusedDateIndex]];
    if (currentDateTodos && currentDateTodos.length > 0) {
      setFocusedTodoIndex(prev => (prev + 1) % currentDateTodos.length);
    }
  }, [groupedTodos, dateKeys, focusedDateIndex]);

  const navigateToPrevTodo = useCallback(() => {
    const currentDateTodos = groupedTodos[dateKeys[focusedDateIndex]];
    if (currentDateTodos && currentDateTodos.length > 0) {
      setFocusedTodoIndex(prev => (prev - 1 + currentDateTodos.length) % currentDateTodos.length);
    }
  }, [groupedTodos, dateKeys, focusedDateIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            navigateToPrevTodo();
          } else {
            navigateToNextTodo();
          }
          break;
        case ' ':
        case 'Space':
          e.preventDefault();
          toggleFocusedTodo();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          if (todoFormRef.current) {
            todoFormRef.current.focusInput();
          }
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setIsModalOpen(true);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (focusedTodo) {
            const newTitle = window.prompt("Reword todo", focusedTodo.title);
            if (newTitle == null || newTitle.trim() === "") return;
            update("todo", { id: focusedTodo.id, title: newTitle.trim() });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateToPrevDate();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateToNextDate();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToPrevTodo();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToNextTodo();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToNextDate, navigateToNextTodo, navigateToPrevDate, navigateToPrevTodo, toggleFocusedTodo, addTodoAfterFocused]);

  return (
    <div className="pb-20">
      {Object.entries(groupedTodos).map(([date, todosForDate]) => (
        <div key={date} className="mb-6">
          <h3 className="text-base font-light text-gray-800 dark:text-gray-200 mb-3 px-3 py-2 border-b-2 border-gray-300 dark:border-gray-600 italic font-serif tracking-wide">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="flex flex-wrap gap-2">
            {todosForDate.map((row, index) => {
              // Calculate global index for focus management
              const dateIndex = dateKeys.indexOf(date);
              const isFocused = dateIndex === focusedDateIndex && index === focusedTodoIndex;
              return (
                <TodoItem
                  key={row.id}
                  row={row}
                  isFocused={isFocused}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Add Todo Modal */}
      <AddTodoModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        afterItemTitle={focusedTodo?.title || "selected item"}
      />
    </div>
  );
};

export const TodoItem: FC<{
  row: TodosWithCategoriesRow;
  isFocused?: boolean;
}> = ({ row: { id, title, status }, isFocused = false }) => {
  const { update } = useEvolu();
  const itemRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });

  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const handleToggleCompletedClick = () => {
    update("todo", {
      id,
      status:
        status === "todo"
          ? "in progress"
          : status === "in progress"
            ? "done"
            : "todo",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      handleToggleCompletedClick();
    }
  };

  const handleRenameClick = () => {
    const newTitle = window.prompt("Todo Name", title);
    if (newTitle == null || newTitle.trim() === "") return; // escape or cancel
    const result = update("todo", { id, title: newTitle.trim() });
    if (!result.ok) {
      alert(formatTypeError(result.error));
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      update("todo", { id, isDeleted: true });
    }
  };

  const showContextMenu = (x: number, y: number) => {
    setContextMenu({
      isVisible: true,
      position: { x, y },
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      isVisible: false,
      position: { x: 0, y: 0 },
    });
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
  };

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        showContextMenu(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: "Rename",
      onClick: handleRenameClick,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      ),
    },
    {
      label: "Delete",
      onClick: handleDeleteClick,
      className: "text-red-600 dark:text-red-400",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        ref={itemRef}
        tabIndex={0}
        className={twMerge(
          "inline-flex gap-1 cursor-pointer transition-colors rounded px-2 py-1 border focus:outline-none",
          status === "in progress"
            ? "border-gray-600 dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
            : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50",
          isFocused && "bg-red-200 dark:bg-red-800/50"
        )}
        onContextMenu={handleRightClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd} // Cancel long press if user moves finger
        onKeyDown={handleKeyDown}
      >
        <label className="flex items-center">
          <span
            className={twMerge(
              "cursor-pointer select-none whitespace-nowrap overflow-hidden text-ellipsis",
              status === "done" && "line-through text-gray-700 dark:text-gray-400 opacity-60 dark:opacity-70"
            )}
            onClick={handleToggleCompletedClick}
          >
            {title}
          </span>
        </label>
      </div>

      <ContextMenu
        items={contextMenuItems}
        position={contextMenu.position}
        onClose={hideContextMenu}
        isVisible={contextMenu.isVisible}
      />
    </>
  );
};
