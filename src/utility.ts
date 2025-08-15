/**
 * Counts occurrences of keys in an array using a key extraction function.
 * K must be a type that works with === (e.g., string, number, boolean, etc.).
 */
export function countOccurrences<T, K>(
  array: T[],
  keyFn: (item: T) => K
): Map<K, number> {
  const map = new Map<K, number>();
  for (const item of array) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}
let callDepth = 0;

export const timeFunction = (title: string, f: () => void): void => {
  const indent = "  ".repeat(callDepth);
  console.log(`${indent}START ${title}`);
  const start = performance.now();

  callDepth++;
  try {
    f();
  } finally {
    callDepth--;
  }

  const end = performance.now();
  const ms = Math.round(end - start);
  console.log(`${indent}END ${title} ${ms}ms`);
};

export const replaceItemAtIndex = <T>(
  array: T[],
  index: number,
  item: T
): T[] => {
  const newArray = [...array];
  newArray[index] = item;
  return newArray;
};
