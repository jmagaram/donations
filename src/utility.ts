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