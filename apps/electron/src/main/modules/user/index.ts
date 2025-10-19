import Module from '~/core/Module'
import UserRepository from './UserRepository'

export default class UserModule extends Module {
  protected override getWorkerPath(): string {
    throw new Error('Method not implemented.')
  }
  override async destroy(): Promise<void> {
    await this.repository.close()
  }
  override async onInitialize(): Promise<void> {
    await this.repository.initialize()
  }

  repository: UserRepository

  constructor(...args: ConstructorParameters<typeof Module>) {
    super(...args)

    this.repository = new UserRepository(this.config, this.log)
  }

  override api = {}
}
