export const countFromTo = (from: number, to: number) => {
  const arr = new Array(to - from + 1);
  for (let i = 0;from + i <= to; i++) {
    arr[i] = from + i
  }
  return arr
}
export const countTo = (to: number) => countFromTo(0, to)