import { createEvolu, getOrThrow, SimpleName } from "@evolu/common";
import { createUseEvolu } from "@evolu/react";
import { evoluReactWebDeps } from "@evolu/react-web";
import { kysely } from "@evolu/common";
import { Schema } from "./schema";

export const evolu = createEvolu(evoluReactWebDeps)(Schema, {
  name: getOrThrow(SimpleName.from("evolu-react-vite-pwa-example")),
  reloadUrl: "/",

  ...(import.meta.env.DEV && {
    syncUrl: "http://localhost:4000",
  }),

  onInit: ({ isFirst }) => {
    if (isFirst) {
      evolu.insert("todo", {
        title: "Try React Suspense",
        status: "todo",
        previousId: null, // First item has no previous item
      });
    }
  },

  // Indexes are not required for development but are recommended for production.
  // https://www.evolu.dev/docs/indexes
  indexes: (create) => [
    create("todoCreatedAt").on("todo").column("createdAt"),
    create("todoPreviousId").on("todo").column("previousId"), // For efficient linked list traversal
  ],

  // enableLogging: true,
});

export const useEvolu = createUseEvolu(evolu);

export const todosWithCategories = evolu.createQuery(
  (db) =>
    db
      .selectFrom("todo")
      .select(["id", "title", "status", "createdAt", "previousId"])
      .where("isDeleted", "is not", 1)
      // Filter null value and ensure non-null type.
      .where("title", "is not", null)
      .$narrowType<{ title: kysely.NotNull }>(),
  {
    // logQueryExecutionTime: true,
    // logExplainQueryPlan: true,
  },
);

export type TodosWithCategoriesRow = typeof todosWithCategories.Row;

// Error subscription
evolu.subscribeError(() => {
  const error = evolu.getError();
  if (!error) return;
  alert("🚨 Evolu error occurred! Check the console.");

  console.error(error);
});
