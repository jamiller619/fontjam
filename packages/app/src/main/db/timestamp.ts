export function toStorage(date: number) {
  return Math.round(date / 1000)
}

export function fromStorage(date: number) {
  return new Date(date * 1000)
}
