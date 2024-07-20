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
  let value = object;
  for (const key of path) {
    if (typeof value !== "object" || value === null || !(key in value))
      throw new Error(`[select]: ${key} not in ${value}`);
    value = value[key];
  }
  return value as any;
};

export type Select<T, K extends string[]> = K extends [
  infer A,
  ...infer B extends string[],
]
  ? A extends keyof T
    ? Select<T[A], B>
    : never
  : T;
