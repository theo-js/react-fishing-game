import {
    MAKE_BAIT_AVAILABLE,
    PUT_ON_BAIT_ITEM,
    BAIT_FALL_IN_WATER,
    SET_HOOKED_FISH,
    SET_LINE_TENSION,
    INCREMENT_LINE_TENSION,
    DECREMENT_LINE_TENSION,
    SET_IS_PULLING
} from './types'
import { pxToM } from '../../utils/position'
import { formatMeters } from '../../utils/position'
import { Item } from '../../interfaces/items'
import { FishData, UniqueFish } from '../../interfaces/fishes'
import { GameNotifType } from '../../interfaces/game'
import { setGameNotificationAction } from './game'
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
    // Lose bait food
    dispatch({ type: PUT_ON_BAIT_ITEM, payload: null })
}

// Player successfully caught a fish and receives an item
export const catchNewFishAction = (fish: UniqueFish) => (dispatch, getState) => {
    // Get new item
    dispatch(addInventoryEntryAction(fish._id, 1))
    // Lose bait
    dispatch({ type: PUT_ON_BAIT_ITEM, payload: null })
    // Notify
    const fishSize = fish.size
    dispatch(setGameNotificationAction({
        type: getState().fishing.hookedFish.fish.isBoss ? GameNotifType.GREAT_SUCCESS : GameNotifType.SUCCESS,
        html: {
            header: `<h3>New fish !</h3>`,
            body: `
                <p>Gained <strong style="color: var(--lightblue)">${fish._id}</strong></p>
                <p>Size: <strong style="color: var(--lightblue)">${formatMeters(parseFloat(pxToM(fishSize/10).toFixed(2)))}</strong></p>
                <p>Strength: <strong style="color: var(--lightblue)">${fish.strength}</strong></p>
            `
        },
        duration: 10
    }))
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
// Increment
export const incrementLineTensionAction = (step: number) => ({ type: INCREMENT_LINE_TENSION, payload: step })
// Decrement
export const decrementLineTensionAction = (step: number) => ({ type: DECREMENT_LINE_TENSION, payload: step })

// Set whether fish is pulling on the line
export const setIsPullingAction = (isPulling: boolean) => ({ type: SET_IS_PULLING, payload: isPulling })