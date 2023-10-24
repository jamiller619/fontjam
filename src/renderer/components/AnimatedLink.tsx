import { HTMLAttributes, useRef } from 'react'
import { flushSync } from 'react-dom'
import { LinkProps, useNavigate } from 'react-router-dom'

type AnimatedLinkProps = LinkProps & HTMLAttributes<HTMLAnchorElement>

export default function AnimatedLink({
  to,
  children,
  ...props
}: AnimatedLinkProps) {
  const navigate = useNavigate()
  const ref = useRef(null)

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
