import {
  id,
  maxLength,
  NonEmptyString,
  NonEmptyString1000,
  nullOr,
  union,
} from "@evolu/common";

// Define the Evolu schema that describes the database tables and column types.
// First, define the typed IDs.

export const TodoId = id("Todo");
export type TodoId = typeof TodoId.Type;

// const TodoCategoryId = id("TodoCategory");
// type TodoCategoryId = typeof TodoCategoryId.Type;

// A custom branded Type.
export const NonEmptyString50 = maxLength(50)(NonEmptyString);
// string & Brand<"MinLength1"> & Brand<"MaxLength50">
export type NonEmptyString50 = typeof NonEmptyString50.Type;


export const TodoStatus = union("todo", "done", "in progress");
export type TodoStatus = typeof TodoStatus.Type;

export const Schema = {
  todo: {
    id: TodoId,
    title: NonEmptyString1000,
    status: TodoStatus,
    previousId: nullOr(TodoId), // Nullable self-reference for linked list ordering
  },
};

export type Schema = typeof Schema;
