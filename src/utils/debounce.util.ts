export const debounce = (fn: (...args: any) => void, ms: number) => {
  let timeout: number | undefined = undefined;
  return (...args: any) => {
    if (timeout != null) {clearTimeout(timeout)}
    timeout = setTimeout(fn.bind(null, ...args), ms);
  }
}