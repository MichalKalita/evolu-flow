import {
  id,
  json,
  maxLength,
  NonEmptyString,
  NonEmptyString1000,
  nullOr,
  object,
  FiniteNumber,
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

// SQLite supports JSON-compatible values.
export const Person = object({
  name: NonEmptyString50,
  // Did you know that JSON.stringify converts NaN (a number) into null?
  // Now, imagine that `age` accidentally becomes null. To prevent this, use FiniteNumber.
  age: FiniteNumber,
});
export type Person = typeof Person.Type;

// SQLite stores JSON-compatible values as strings. Fortunately, Evolu provides
// a convenient `json` Type Factory for type-safe JSON serialization and parsing.
export const PersonJson = json(Person, "PersonJson");
// string & Brand<"PersonJson">
export type PersonJson = typeof PersonJson.Type;

export const TodoStatus = union("todo", "done", "in progress");
export type TodoStatus = typeof TodoStatus.Type;

export const Schema = {
  todo: {
    id: TodoId,
    title: NonEmptyString1000,
    status: TodoStatus,
    personJson: nullOr(PersonJson),
  },
};

export type Schema = typeof Schema;
