export type CacheEditsBlock = unknown
export type PinnedCacheEdits = { userMessageIndex: number; block: CacheEditsBlock }
export type CachedMCState = { pinnedEdits: PinnedCacheEdits[] }

export function createCachedMCState(): CachedMCState {
  return { pinnedEdits: [] }
}

export function markToolsSentToAPI(state: CachedMCState): void {}
export function resetCachedMCState(state: CachedMCState): void {
  state.pinnedEdits = []
}
