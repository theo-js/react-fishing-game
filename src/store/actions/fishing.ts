import {
    MAKE_BAIT_AVAILABLE,
    PUT_ON_BAIT_ITEM,
    SET_HOOKED_FISH
} from './types'
import { Item } from '../../interfaces/items'
import { FishData } from '../../interfaces/fishes'
import { removeInventoryEntryAction, addInventoryEntryAction } from './inventory'
import { baitFoodSelector } from '../selectors/fishing'

// Set whether bait is available to fishes
export const makeBaitAvailableAction = (bool: boolean): any => ({ type: MAKE_BAIT_AVAILABLE, payload: bool })

// Remove item from fishrod tip
export const removeBaitItemAction = () => (dispatch, getState) => {
    const baitFood: Item = baitFoodSelector(getState())
    if (baitFood) {
        // Place item in inventory
        dispatch(addInventoryEntryAction(baitFood._id, 1))
        // Remove from fishrod
        dispatch({ type: PUT_ON_BAIT_ITEM, payload: null })
    }
}

// Place an item on the fishrod tip
export const putOnBaitItemAction = (item: Item) => dispatch => {
    // Remove current item from fishrod if there is one
    dispatch(removeBaitItemAction())

    // Remove from inventory
    dispatch(removeInventoryEntryAction(item._id, 1))

    // Put on fishrod
    dispatch({ type: PUT_ON_BAIT_ITEM, payload: item })
}

// Fish takes the bait away
export const loseBaitAction = () => dispatch => {
    // Remove bait food
    dispatch(removeBaitItemAction())
}

// Player successfully caught a fish and receives an item
export const catchNewFish = (fishID: string) => dispatch => {
    // Get new item
    dispatch(addInventoryEntryAction(fishID, 1))
    // Lose bait
    dispatch(loseBaitAction())
}

// One fish is took the bait, all the other fishes must disappear
export const setHookedFishAction = (fish: FishData) => ({ type: SET_HOOKED_FISH, payload: fish })