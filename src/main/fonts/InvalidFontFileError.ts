export default class InvalidFontFileError extends Error {
  constructor(filePath: string, isValid: boolean) {
    const msg = isValid ? `isn't a supported font` : `is an invalid font`

    super(`${filePath} ${msg}`)
  }
}
