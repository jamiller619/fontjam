export default class TokenPath {
  path: string
  resolved: string

  constructor(path: string) {
    this.path = path
    this.resolved = TokenPath.resolve(path)
  }

  static resolve(path: string) {
    return path.replace(/%([^%]+)%/g, (_, name) => process.env[name] ?? '')
  }
}
