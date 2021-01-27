import { createSelector } from 'reselect'
import { InventoryEntry } from '../../interfaces/items'

export const inventoryEntriesSelector = createSelector(
    (state: any) => state,
    (state: any) => state.inventory.entries
)

export const maxEntriesSelector = createSelector(
    (state: any) => state,
    (state: any) => state.inventory.maxEntries
)

export const inventoryLengthSelector = createSelector(
    inventoryEntriesSelector,
    (entries: InventoryEntry[]): number => entries.length
)

export const isPlayerOutOfBaitsSelector = createSelector(
    inventoryEntriesSelector,
    (entries: InventoryEntry[]): boolean => entries.filter(entry => entry.item.category === 'Bait' || entry.item.category === 'Fish').length <= 0
)

export const sellableEntriesSelector = createSelector(
    inventoryEntriesSelector,
    (entries: InventoryEntry[]): InventoryEntry[] => {
        return entries.filter((entry: InventoryEntry) => {
            return entry.item.isSellable
        })
    }
)