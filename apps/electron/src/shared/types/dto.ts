export type User = {
  id: string
  createdAt: Date
  email: string
  authProvider: string
}

export type Platform = 'darwin' | 'win32' | 'linux'

export type Device = {
  id: string
  userId: string
  name: string
  platform: Platform
  lastSeenAt: Date
}

export type LibraryVisibility = 'private' | 'shared' | 'public'
export type LibrarySourceType =
  | 'system'
  | 'user'
  | 'local'
  | 'collection'
  | 'cloud'
  | 'remote'

export type LibrarySource = {
  type: LibrarySourceType
  path: string
}

export type Library = {
  id: string
  createdAt: Date
  updatedAt?: Date
  userId?: string
  name: string
  description?: string
  visibility: LibraryVisibility
  source: LibrarySource
  fonts?: FontFamily[]
}

export type FontFamily = {
  id: string
  createdAt: Date
  libraryId: string
  name: string
  metadata?: FontFamilyMetaData
  fonts?: Font[]
}

export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2' | 'ttc'

export type Font = {
  id: string
  createdAt: Date
  familyId: string
  family: FontFamily | null
  name: string
  url: string
  format: FontFormat
  hash: string
  weight: number | null
  style: string
  version: string | null
  license: FontLicense | null
  metadata: FontMetadata
  fvar: FontVariation | null
}

export type FontVariationAxis = {
  tag: string
  name: string
  minValue: number
  defaultValue: number
  maxValue: number
}

export type FontVariationInstance = {
  name: string
  coordinates: Record<string, number>
}

export type FontVariation = {
  axes: FontVariationAxis[]
  instances: FontVariationInstance[]
}

export type FontFamilyMetaData = {
  designer?: string
  foundry?: string
  description?: string
  category?: string
  tags?: string[]
}

export type FontLicenseType =
  | 'open-source'
  | 'commercial'
  | 'proprietary'
  | 'unknown'

export type FontLicense = {
  type: FontLicenseType
  name?: string
  url?: string
  text?: string
  restrictions?: string[]
  allowCommercialUse?: boolean
  allowModification?: boolean
  allowDistribution?: boolean
}

export type FontMetadata = {
  fullName?: string
  postscriptName?: string
  subFamily?: string
  uniqueId?: string
  version?: string
  copyright?: string
  trademark?: string
  manufacturer?: string
  designer?: string
  description?: string
  vendorURL?: string
  designerURL?: string
  licenseURL?: string
}

export type ActivationStatus = 'active' | 'inactive'

export type Activation = {
  id: string
  fontId: string
  deviceId: string
  status: ActivationStatus
  activatedAt: Date
}

export type Tag = {
  id: string
  name: string
  color?: string
}

export type FontTag = {
  fontId: string
  tagId: string
}

// Operation types for sync
export type Operation<T> = {
  id: string
  deviceId: string
  type: OperationType
  payload: T
  createdAt: Date
  appliedAt?: Date
}

export type OperationType =
  | 'addFont'
  | 'removeFont'
  | 'updateFont'
  | 'tagFont'
  | 'untagFont'
  | 'activateFont'
  | 'deactivateFont'
  | 'createLibrary'
  | 'updateLibrary'
  | 'shareLibrary'

export type APIResponse<T = undefined> = {
  result?: T
  error: string | null
}
