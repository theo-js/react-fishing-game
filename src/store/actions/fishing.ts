import {
    MAKE_BAIT_AVAILABLE,
    PUT_ON_BAIT_ITEM,
    BAIT_FALL_IN_WATER,
    SET_HOOKED_FISH,
    SET_LINE_TENSION,
    DECREMENT_LINE_TENSION,
    SET_IS_PULLING
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
export const catchNewFishAction = (fishID: string) => dispatch => {
    // Get new item
    dispatch(addInventoryEntryAction(fishID, 1))
    // Lose bait
    dispatch(loseBaitAction())
}

// Detect when bait reaches water; if it falls on a fish, it flees
export const emitBaitFallEventAction = () => dispatch => {
    dispatch({ type: BAIT_FALL_IN_WATER, payload: true })
    window.setTimeout(() => {
        dispatch({ type: BAIT_FALL_IN_WATER, payload: false })
    }, 20)
}

// One fish has taken the bait, all the other fishes must disappear
export const setHookedFishAction = (fish: FishData) => ({ type: SET_HOOKED_FISH, payload: fish })

// Set line tension; if lower than -100 lose bait, if higher than 100 line breaks (=> lose bait)
export const setLineTensionAction = (newTension: number) => ({ type: SET_LINE_TENSION, payload: newTension })
// Decrement
export const decrementLineTensionAction = (step: number) => ({ type: DECREMENT_LINE_TENSION, payload: step })

// Set whether fish is pulling on the line
export const setIsPullingAction = (isPulling: boolean) => ({ type: SET_IS_PULLING, payload: isPulling })