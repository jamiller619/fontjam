import os from 'node:os'

const osType = os.platform()
const directories = {
  system: [] as string[],
  user: [] as string[],
}

switch (osType) {
  case 'darwin':
    {
      directories.system.push('/System/Fonts', '/Library/Fonts')

      directories.user.push(`${process.env.HOME}/Library/Fonts`)
    }
    break

  case 'win32':
    {
      directories.system.push(`${process.env.WINDIR}\\Fonts`)

      directories.user.push(`${process.env.LOCALAPPDATA}`)
    }

    break

  case 'linux':
    {
      directories.system.push('/usr/share/fonts', '/usr/local/share/fonts')

      directories.user.push(
        `${process.env.HOME}/.fonts`,
        `${process.env.HOME}/.local/share/fonts`,
      )
    }

    break

  default:
    console.warn(`Unsupported platform: ${osType}`)
}

export default directories
