import { State } from "./pages/relaynet/state";

export const setPath =
  <T extends Record<string, unknown>>(object: T) =>
  <P extends string[]>(...path: P) =>
  (value: Select<T, P>): T =>
    object;

export type Select<T, K extends string[]> = K extends [
  infer A,
  ...infer B extends string[],
]
  ? A extends keyof T
    ? Select<T[A], B>
    : never
  : T;
