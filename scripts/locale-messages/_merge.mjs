export function mergeDeep(target, source) {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof out[key] === "object" &&
      out[key] &&
      !Array.isArray(out[key])
    ) {
      out[key] = mergeDeep(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function countKeys(obj) {
  let n = 0;
  if (typeof obj === "string") return 1;
  if (Array.isArray(obj)) {
    for (const item of obj) n += countKeys(item);
    return n;
  }
  if (obj && typeof obj === "object") {
    for (const v of Object.values(obj)) n += countKeys(v);
  }
  return n;
}
