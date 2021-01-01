import { createSelector } from 'reselect'

export const inventoryEntriesSelector = createSelector(
    (state: any) => state,
    (state: any) => state.inventory.entries
)

export const maxEntriesSelector = createSelector(
    (state: any) => state,
    (state: any) => state.inventory.maxEntries
)