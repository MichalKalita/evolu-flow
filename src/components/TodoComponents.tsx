import { FC, useState, useRef } from "react";
import { useQuery } from "@evolu/react";
import { twMerge } from "tailwind-merge";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { todosWithCategories, TodosWithCategoriesRow, useEvolu } from "../lib/evolu-config";
import { formatTypeError } from "../lib/utils";

export const Todos: FC = () => {
  const rows = useQuery(todosWithCategories);

  // Group todos by date
  const groupedTodos = rows.reduce((groups, row) => {
    const date = new Date(row.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(row);
    return groups;
  }, {} as Record<string, TodosWithCategoriesRow[]>);

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
            {todosForDate.map((row) => (
              <TodoItem key={row.id} row={row} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TodoItem: FC<{
  row: TodosWithCategoriesRow;
}> = ({ row: { id, title, status } }) => {
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
        className={twMerge(
          "inline-flex gap-1 cursor-pointer transition-colors rounded px-2 py-1 border",
          status === "in progress"
            ? "border-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
            : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}
        onContextMenu={handleRightClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd} // Cancel long press if user moves finger
      >
        <label className="flex items-center">
          <span
            className={twMerge(
              "cursor-pointer select-none whitespace-nowrap overflow-hidden text-ellipsis",
              status === "done" && "line-through text-gray-500"
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
