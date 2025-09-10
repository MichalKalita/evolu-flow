import { FC, useState } from "react";
import { useQuery } from "@evolu/react";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui";
import { todosWithCategories, TodosWithCategoriesRow, useEvolu } from "../lib/evolu-config";
import { formatTypeError } from "../lib/utils";

export const Todos: FC = () => {
  const rows = useQuery(todosWithCategories);
  const { insert } = useEvolu();
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const handleAddTodo = (title: string) => {
    if (title.trim() === "") return;

    const result = insert("todo", {
      title: title.trim(),
      // This object is automatically converted to a JSON string.
      personJson: { name: "Joe", age: 32 },
      status: "todo",
    });

    if (!result.ok) {
      alert(formatTypeError(result.error));
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

  return (
    <div>
      {rows.map((row) => (
        <TodoItem key={row.id} row={row} />
      ))}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
        />
        <Button
          title="Add Todo"
          onClick={() => handleAddTodo(newTodoTitle)}
          className="whitespace-nowrap"
        />
      </form>
    </div>
  );
};

export const TodoItem: FC<{
  row: TodosWithCategoriesRow;
}> = ({ row: { id, title, status } }) => {
  const { update } = useEvolu();

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
    const title = window.prompt("Todo Name");
    if (title == null) return; // escape or cancel
    const result = update("todo", { id, title });
    if (!result.ok) {
      alert(formatTypeError(result.error));
    }
  };

  const handleDeleteClick = () => {
    update("todo", { id, isDeleted: true });
  };

  return (
    <li className="list-none pl-0">
      <div className="flex items-center gap-1">
        <label className="flex w-full items-center">
          <span
            className={twMerge(
              "cursor-pointer",
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
        <div className="flex gap-1">
          <Button
            className="ml-auto"
            title="Rename"
            onClick={handleRenameClick}
          />
          <Button title="Delete" onClick={handleDeleteClick} />
        </div>
      </div>
    </li>
  );
};
