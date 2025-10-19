import path from 'node:path'
import * as dto from '@shared/types/dto'
import Module from '~/core/Module'
import FontRepository from './FontRepository'

export default class FontModule extends Module {
  repository: FontRepository

  constructor(...args: ConstructorParameters<typeof Module>) {
    super(...args)

    this.repository = new FontRepository(this.config, this.log)
  }

  override async onInitialize() {
    await this.repository.initialize()
  }

  override async destroy() {
    await this.repository.close()
  }

  protected override getWorkerPath(): string {
    return path.join(this.config.get('worker.path'), 'font.worker.js')
  }

  override api = {
    'activations.get': async (deviceId: string): Promise<dto.Activation[]> => {
      return this.repository.getActivations(deviceId)
    },

    'activation.set': async (
      fontId: string,
      deviceId: string,
      status: dto.ActivationStatus,
    ): Promise<void> => {
      await this.repository.setActivation(fontId, deviceId, status)
    },
  }
}
