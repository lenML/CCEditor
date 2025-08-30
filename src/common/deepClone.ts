export const deepClone: typeof globalThis.structuredClone =
  globalThis.structuredClone
    ? globalThis.structuredClone
    : (obj: any) => JSON.parse(JSON.stringify(obj));
