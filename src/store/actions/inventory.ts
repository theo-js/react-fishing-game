import {
    ADD_INVENTORY_ENTRY,
    REMOVE_INVENTORY_ENTRY,
    EARN_MONEY,
    SPEND_MONEY
} from './types'
import allItems from '../../components/items/items.json'
import { setRodLevelAction } from './game'

// Inventory
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

// Equipment
export const equipItemAction = (itemID: string) => dispatch => {
    // Find out item category
    const doesItemExist = allItems[itemID]
    if (!doesItemExist) return
    const { category } = doesItemExist

    // Decide what to do depending on item category
    switch (category) {
        case 'Fishing pole':
            // Replace fishing pole
            dispatch(setRodLevelAction(itemID))
            break
        default: return
    }
}