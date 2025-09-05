import { JsonPatchOperation } from "@core/enums";

// Build a discriminated union for all operations
export type JsonPatchDocument<T extends object> = {
  [K in keyof T]:
    // add: requires path + value
    | { op: JsonPatchOperation.Add; path: `/${Extract<K, string>}`; value: T[K] }

    // replace: requires path + value
    | { op: JsonPatchOperation.Replace; path: `/${Extract<K, string>}`; value: T[K] }

    // remove: only path
    | { op: JsonPatchOperation.Remove; path: `/${Extract<K, string>}` }

    // test: requires path + value
    | { op: JsonPatchOperation.Test; path: `/${Extract<K, string>}`; value: T[K] }

    // move: requires from + path
    | { op: JsonPatchOperation.Move; from: `/${Extract<K, string>}`; path: `/${Extract<K, string>}` }

    // copy: requires from + path
    | { op: JsonPatchOperation.Copy; from: `/${Extract<K, string>}`; path: `/${Extract<K, string>}` }
}[keyof T];

export type JsonPatchForField<
  T extends object,
  K extends Extract<keyof T, string>   // <-- constrain to string keys
> = Extract<JsonPatchDocument<T>, { path: `/${K}` }>;
