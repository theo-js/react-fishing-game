import {
    ADD_INVENTORY_ENTRY,
    REMOVE_INVENTORY_ENTRY
} from './types'

export const addInventoryEntryAction = (itemID: string, amount: number) => ({ type: ADD_INVENTORY_ENTRY, payload: { itemID, amount } })
export const removeInventoryEntryAction = (itemID: string, amount: number) => ({ type: REMOVE_INVENTORY_ENTRY, payload: { itemID, amount } })
export const deleteItemAction = (itemID: string) => ({ type: REMOVE_INVENTORY_ENTRY, payload: { itemID, amount: 999 } })