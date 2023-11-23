import { HTMLAttributes } from 'react'

export default function GoogleFonts(props: HTMLAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 192 192" {...props}>
      <path fill="none" d="M0 0h192v192H0z"></path>
      <path
        fill="#FBBC04"
        d="M95.33 36L92 32 8 160h58l26.07-39.73 3.26-7.06z"></path>
      <path fill="#1A73E8" d="M92 32h52v128H92z"></path>
      <circle fill="#EA4335" cx="36" cy="56" r="24"></circle>
      <path
        fill="#0D652D"
        d="M148 124l-4 36c-19.88 0-36-16.12-36-36s16.12-36 36-36l4 36z"></path>
      <path
        fill="#174EA6"
        d="M116 60c0-15.46 12.54-28 28-28l5 28-5 28c-15.46 0-28-12.54-28-28z"></path>
      <path
        fill="#1A73E8"
        d="M144 32c15.46 0 28 12.54 28 28s-12.54 28-28 28"></path>
      <path
        fill="#34A853"
        d="M144 88c19.88 0 36 16.12 36 36s-16.12 36-36 36"></path>
    </svg>
  )
}
