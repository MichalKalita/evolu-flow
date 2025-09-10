import { FC, useState, useRef } from "react";
import { useQuery } from "@evolu/react";
import { twMerge } from "tailwind-merge";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { todosWithCategories, TodosWithCategoriesRow, useEvolu } from "../lib/evolu-config";
import { formatTypeError } from "../lib/utils";

export const Todos: FC = () => {
  const rows = useQuery(todosWithCategories);

  return (
    <div className="pb-20">
      {rows.map((row) => (
        <TodoItem key={row.id} row={row} />
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
      <li className="list-none pl-0">
        <div
          ref={itemRef}
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 transition-colors"
          onContextMenu={handleRightClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd} // Cancel long press if user moves finger
        >
          <label className="flex w-full items-center">
            <span
              className={twMerge(
                "cursor-pointer select-none",
                status === "done"
                  ? "line-through text-gray-500"
                  : status === "in progress"
                  ? "underline font-semibold"
                  : ""
              )}
              onClick={handleToggleCompletedClick}
            >
              {title}
            </span>
          </label>
        </div>
      </li>

      <ContextMenu
        items={contextMenuItems}
        position={contextMenu.position}
        onClose={hideContextMenu}
        isVisible={contextMenu.isVisible}
      />
    </>
  );
};
