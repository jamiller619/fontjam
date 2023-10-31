import { HTMLAttributes, Ref, forwardRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { LinkProps, useNavigate } from 'react-router-dom'

type AnimatedLinkProps = LinkProps & HTMLAttributes<HTMLAnchorElement>

function AnimatedLink(
  { to, children, ...props }: AnimatedLinkProps,
  ref: Ref<HTMLAnchorElement>
) {
  const navigate = useNavigate()

  return (
    <a
      href={to.toString()}
      ref={ref}
      {...props}
      onClick={(ev) => {
        ev.preventDefault()

        document.startViewTransition(() => {
          flushSync(() => {
            navigate(to)
          })
        })
      }}>
      {children}
    </a>
  )
}

export default forwardRef(AnimatedLink)

export function useAnimatedNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (path: string) => {
      document.startViewTransition(() => {
        flushSync(() => navigate(path))
      })
    },
    [navigate]
  )
}
