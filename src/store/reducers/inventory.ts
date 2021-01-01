import {
    ADD_INVENTORY_ENTRY,
    REMOVE_INVENTORY_ENTRY
} from '../actions/types'
import { Item, InventoryEntry } from '../../interfaces/items'
import allItems from '../../components/items/items.json'

interface State {
    entries: InventoryEntry[],
    maxEntries: number
}

const initialEntries: InventoryEntry[] = [
    {
        item: allItems['Mushroom'],
        amount: 3
    },
    {
        item: allItems['Fly'],
        amount: 1
    },
    {
        item: allItems['Angelfish'],
        amount: 1
    }
]

const initialState = localStorage['inventory'] ?
    JSON.parse(localStorage['inventory']) 
    : ({
        entries: initialEntries,
        maxEntries: 20
    })

export default function (state: State = initialState, action) {
    switch (action.type) {
        case ADD_INVENTORY_ENTRY: {
            let newState = state
            // Check if item is already in inventory
            const itemInInventory = state.entries.find(entry => entry.item._id === action.payload.itemID)

            if (itemInInventory) {
                // Add amount only
                let newAmount = itemInInventory.amount + action.payload.amount
                if (newAmount > 99) newAmount = 99 // Limit max amount to 99
                newState = {
                    ...state,
                    entries: state.entries.map(entry => {
                        if (entry.item._id === action.payload.itemID) {
                            return { ... entry, amount: newAmount }
                        }
                        return entry
                    })
                }
            } else {
                // Add new entry to inventory
                if (state.entries.length < state.maxEntries) {
                    // Find item data
                    const item = allItems[action.payload.itemID]
                    if (!item) {
                        // This item does not exist !
                        return state
                    } else {
                        newState = {
                            ...state,
                            entries: [...state.entries, { item, amount: action.payload.amount }]
                        }
                    }
                } else {
                    // Error: your inventory is full
                    return state
                }
            }

            localStorage['inventory'] = JSON.stringify(newState)
            return newState
            break
        }
        case REMOVE_INVENTORY_ENTRY: {
            let newState = state
            // Check if item is already in inventory
            const itemInInventory = state.entries.find(entry => entry.item._id === action.payload.itemID)
            if (!itemInInventory) return state

            // Check if new amount is a positive integer
            let newAmount = itemInInventory.amount - action.payload.amount

            if (newAmount <= 0) {
                // Remove entry from inventory
                newState = {
                    ...state,
                    entries: state.entries.filter(entry => entry.item._id !== action.payload.itemID)
                }
            } else {
                // Keep entry and replace amount
                newState = {
                    ...state,
                    entries: state.entries.map(entry => {
                        if (entry.item._id === action.payload.itemID) {
                            return { ...entry, amount: newAmount }
                        }
                        return entry
                    })
                }
            }

            localStorage['inventory'] = JSON.stringify(newState)
            return newState
            break
        }
        default: return state
    }
}