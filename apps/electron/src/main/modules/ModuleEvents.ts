import * as dto from '@shared/types/dto'
import { AllowNullableKeys } from '@shared/types/utils'

export type LibraryModuleEvents = {
  'library.deleted': (payload: dto.Library) => void
  'library.created': (
    payload: AllowNullableKeys<dto.Library, 'createdAt'>,
  ) => void
}

export type FontModuleEvents = {
  'font.imported': (payload: dto.Font) => void
  'font.installed': (payload: dto.Font) => void
  'font.uninstalled': (payload: dto.Font) => void
  'font.activated': (payload: dto.Font) => void
  'font.deactivated': (payload: dto.Font) => void
}

type ModuleEvents = LibraryModuleEvents & FontModuleEvents

export default ModuleEvents
