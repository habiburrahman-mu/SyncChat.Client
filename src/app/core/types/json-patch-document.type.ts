import { JsonPatchOperation } from "@core/enums";

export type JsonPatchDocument<T extends object> = {
  [K in keyof T]: {
    op: JsonPatchOperation;
    path: `/${Extract<K, string>}`;
    value?: T[K]; // optional for "remove"
  }
}[keyof T];
