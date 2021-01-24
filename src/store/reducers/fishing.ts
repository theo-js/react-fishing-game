import {
    MAKE_BAIT_AVAILABLE,
    PUT_ON_BAIT_ITEM,
    SET_HOOKED_FISH,
    SET_LINE_TENSION,
    SET_IS_PULLING
} from '../actions/types'
import { FishData } from '../../interfaces/fishes'
import { Item } from '../../interfaces/items'
import allItems from '../../components/items/items.json'

export interface State {
    isBaitAvailable: boolean,
    baitFood: Item,
    hookedFish: FishData, // uuid of the fish that has taken the bait
    lineTension: number, // Min: -100; max: 100,
    isPulling: boolean // Whether fish is pulling on the line
}

const initialState: State = {
    isBaitAvailable: false,
    baitFood: localStorage['baitFood'] ? JSON.parse(localStorage['baitFood']) : allItems['Mushroom'],
    hookedFish: null,
    lineTension: 0,
    isPulling: false
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
        case SET_LINE_TENSION:
            return { ...state, lineTension: action.payload }
            break
        case SET_IS_PULLING:
            return { ...state, isPulling: action.payload }
            break
        default: return state
    }
}