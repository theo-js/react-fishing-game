import {
    MAKE_BAIT_AVAILABLE,
    PUT_ON_BAIT_ITEM,
    SET_HOOKED_FISH
} from '../actions/types'
import { FishData } from '../../interfaces/fishes'
import { Item } from '../../interfaces/items'
import allItems from '../../components/items/items.json'

export interface State {
    isBaitAvailable: boolean,
    baitFood: Item,
    hookedFish: FishData // uuid of the fish that has taken the bait
}

const initialState: State = {
    isBaitAvailable: false,
    baitFood: localStorage['baitFood'] ? JSON.parse(localStorage['baitFood']) : allItems['Mushroom'],
    hookedFish: null
}

export default function(state: State = initialState, action): State {
    switch(action.type) {
        case MAKE_BAIT_AVAILABLE:
            return { ...state, isBaitAvailable: action.payload }
            break
        case PUT_ON_BAIT_ITEM:
            localStorage['baitFood'] = JSON.stringify(action.payload)
            return { ...state, baitFood: action.payload }
            break
        case SET_HOOKED_FISH:
            return { ...state, hookedFish: action.payload }
            break
        default: return state
    }
}