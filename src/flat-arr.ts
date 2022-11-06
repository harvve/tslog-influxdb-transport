export function flatArr(input: Array<unknown>): Array<unknown> {
  const result = input.reduce((prv: unknown[], curr) => {
    if (typeof curr === 'object' && !Array.isArray(curr)) {
      curr = Object.entries((curr as object) || {});
    }
    if (Array.isArray(curr)) {
      curr = flatArr(curr);
    }
    prv.push(curr);
    return prv;
  }, []) as unknown[];
  return result.flat(Infinity);
}
