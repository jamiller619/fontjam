import { SVGAttributes } from 'react'
import * as lib from './lib'

const icons = await import('@fluentui/react-icons')

type CustomIconProps = SVGAttributes<SVGSVGElement> & {
  name: string
}

const iconStyle = {
  width: 20,
  filter: 'grayscale(1)',
}

export default function LibraryIcon({ name, ...props }: CustomIconProps) {
  const [iconLibrary, iconName] = name.split('/')

  if (iconLibrary === 'lib') {
    if (Object.hasOwn(lib, iconName)) {
      const Icon = lib[iconName as keyof typeof lib]

      return <Icon {...props} style={iconStyle} />
    }
  } else if (iconLibrary === 'fluentui') {
    if (Object.hasOwn(icons, iconName)) {
      const Icon = icons[iconName as keyof typeof icons]

      //@ts-ignore: Apparently there are a few keys on the
      //"icons" object that won't return a Component,
      //however, we limit this to actual icons.
      return <Icon {...props} />
    }
  }

  return null
}
