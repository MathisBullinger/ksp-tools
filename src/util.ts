export const setPath =
  <T extends Record<string, unknown>>(object: T) =>
  <P extends string[]>(...path: P) =>
  (value: Select<T, P>): T => {
    if (path.length === 0) return value as any;

    if (typeof object !== "object" || object === null) {
      throw new Error(`[setPath] cannot set ${path[0]} key in non-object`);
    }

    const updated = setPath((object as any)[path[0]])(...path.slice(1))(
      value as any
    );
    if (updated === object[path[0]]) return object;

    return {
      ...object,
      [path[0]]: updated,
    };
  };

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
