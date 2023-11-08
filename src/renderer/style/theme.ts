import { css } from 'styled-components'

export const control = {
  style: css`
    background-color: transparent;
    cursor: pointer;
    color: var(--gray-11);
    transition-property: color, background-color;
    transition-duration: 120ms;
    transition-timing-function: ease-out;
  `,
  active: css`
    background-color: var(--gray-a3);
    color: var(--gray-12);
    transition-duration: 100ms;
  `,
  pressed: css`
    background-color: var(--gray-a3);
    transition-duration: 100ms;
  `,
  hover: css`
    background-color: var(--gray-a4);
    color: var(--gray-12);
  `,
}
