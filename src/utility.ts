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

export const cartesianProduct = <T>(arrays: T[][]): T[][] => {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);
  return first.flatMap((item) =>
    restProduct.map((combination) => [item, ...combination]),
  );
};

export const generatePermutations = <T>(arr: T[]): T[][] => {
  if (arr.length <= 1) return [arr];

  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const restPermutations = generatePermutations(rest);
    restPermutations.forEach((perm) => {
      result.push([arr[i], ...perm]);
    });
  }
  return result;
};