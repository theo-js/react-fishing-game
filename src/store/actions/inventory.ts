import {
    ADD_INVENTORY_ENTRY,
    REMOVE_INVENTORY_ENTRY,
    EARN_MONEY,
    SPEND_MONEY
} from './types'

export const addInventoryEntryAction = (itemID: string, amount: number) => ({ type: ADD_INVENTORY_ENTRY, payload: { itemID, amount } })
export const removeInventoryEntryAction = (itemID: string, amount: number) => ({ type: REMOVE_INVENTORY_ENTRY, payload: { itemID, amount } })
export const deleteItemAction = (itemID: string) => ({ type: REMOVE_INVENTORY_ENTRY, payload: { itemID, amount: 999 } })

// Shopping
export const purchaseItemAction = (itemID: string, amount: number, price: number) => dispatch => {
    dispatch({ type: SPEND_MONEY, payload: price })
    dispatch(addInventoryEntryAction(itemID, amount))
}

export const sellItemAction = (itemID: string, amount: number, price: number) => dispatch => {
    dispatch({ type: EARN_MONEY, payload: price })
    dispatch(removeInventoryEntryAction(itemID, amount))
}