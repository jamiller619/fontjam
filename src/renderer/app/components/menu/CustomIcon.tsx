import { SVGAttributes } from 'react'

const icons = await import('@fluentui/react-icons')

type CustomIconProps = SVGAttributes<SVGSVGElement> & {
  name: string
}

export default function CustomIcon({ name, ...props }: CustomIconProps) {
  const Icon = icons[name as keyof typeof icons]

  // @ts-ignore: Apparently, the @fluentui/react-icons
  // package includes many top-level exports that aren't
  // icons. We limit this in reality, but TypeScript can't
  // know that.
  return <Icon {...props} />
}
