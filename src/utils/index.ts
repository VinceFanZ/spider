/** @format */

export function timeout(delay: number = 2) {
  return new Promise((resolve) => setTimeout(resolve, delay * 1000))
}
