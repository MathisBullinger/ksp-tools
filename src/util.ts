export const select = <T, P extends string[]>(
  object: T,
  ...path: P
): Select<T, P> => {
  let value: any = object;
  for (const key of path) {
    if (typeof value !== "object" || value === null || !(key in value)) {
      return null as any;
    }
    value = value[key];
  }
  return value;
};

export type Select<T, K extends string[]> = K extends [
  infer A,
  ...infer B extends string[],
]
  ? A extends keyof T
    ? Select<T[A], B>
    : never
  : T;

export const ident = <T>(value: T): T => value;

export type { Vec } from "./vec";
export * as vec from "./vec";
