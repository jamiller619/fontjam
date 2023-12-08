import { SVGAttributes, memo } from 'react'
import * as lib from '~/components/icons/lib'

const icons = await import('@fluentui/react-icons')

type IconProps = SVGAttributes<SVGSVGElement> & {
  name: string
  // isGrayscale?: boolean
}

// const iconStyle = (isGray = false) => ({
//   width: 20,
//   filter: isGray ? 'grayscale(1)' : '',
// })
const iconStyle = {
  width: 20,
}

function MenuIcon({ name, ...props }: IconProps) {
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

export default memo(MenuIcon)
