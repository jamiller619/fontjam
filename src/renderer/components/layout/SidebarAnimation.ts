import { css } from 'styled-components'

export const Container = (isOpen: boolean) => {
  return css`
    --nav-ease: cubic-bezier(1, 0, 0.5, 1);

    transition: flex 200ms var(--nav-ease);
    flex: 0 0 ${isOpen ? '200px' : '70px'};

    .navItemLinkLabel {
      opacity: ${isOpen ? '1' : '0'};
      transition: opacity 200ms var(--nav-ease);
    }

    .navSectionHeader {
      transition-duration: 200ms;
      transition-timing-function: var(--nav-ease);
      transition-property: background, transform;
      height: 16px;

      ${isOpen
        ? css`
            background: transparent;
            transform: scaleY(1);
          `
        : css`
            background: var(--gray-8);
            transform: scaleY(0.1);
            width: 60%;
            overflow: hidden;
          `}
    }
  `
}
