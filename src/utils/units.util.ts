export const getRemPixels = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
