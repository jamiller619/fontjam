const icons = await import('@fluentui/react-icons')

type CustomIconProps = {
  name: string
}

export default function CustomIcon({ name }: CustomIconProps) {
  const Icon = icons[name as keyof typeof icons]

  // @ts-ignore: Apparently, the @fluentui/react-icons
  // package includes many top-level exports that aren't
  // icons. We limit this in reality, but TypeScript can't
  // know that.
  return <Icon />
}
