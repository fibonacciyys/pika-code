export type TurnStartTime = number

export const DEFAULT_UPLOAD_CONCURRENCY = 4
export const FILE_COUNT_LIMIT = 1000
export const OUTPUTS_SUBDIR = 'outputs'

export type FailedPersistence = {
  path: string
  error: string
}

export type PersistedFile = {
  path: string
  fileId?: string
  size: number
}

export type FilesPersistedEventData = {
  filesCount: number
  totalBytes: number
  persistedFiles: PersistedFile[]
  failedFiles: FailedPersistence[]
  uploadDurationMs: number
}
