export default function useClassNames(names: Record<string, boolean>) {
  return {
    className: Object.entries(names)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(' '),
  }
}
