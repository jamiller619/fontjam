import { HTMLAttributes, Ref, forwardRef } from 'react'
import { LinkProps } from 'react-router-dom'
import useAnimatedNavigate from '~/hooks/useAnimatedNavigate'

type AnimatedLinkProps = Omit<
  LinkProps & HTMLAttributes<HTMLAnchorElement>,
  'onClick'
> & {
  onClick?: (
    ev: React.MouseEvent<HTMLAnchorElement>
  ) => void | Promise<void> | (() => void | Promise<void>)
}

function AnimatedLink(
  { to, children, onClick, ...props }: AnimatedLinkProps,
  ref: Ref<HTMLAnchorElement>
) {
  const navigate = useAnimatedNavigate()

  return (
    <a
      href={to.toString()}
      ref={ref}
      {...props}
      onClick={async (ev) => {
        ev.preventDefault()
        let off = () => {}

        if (onClick) {
          const ret = await onClick(ev)

          if (ret) off = ret
        }

        navigate(to, off)
      }}>
      {children}
    </a>
  )
}

export default forwardRef(AnimatedLink)
