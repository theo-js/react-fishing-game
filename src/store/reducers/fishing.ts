import { MAKE_BAIT_AVAILABLE, PUT_ON_BAIT_ITEM } from '../actions/types'
import { Item } from '../../interfaces/items'
import allItems from '../../components/items/items.json'

export interface State {
    isBaitAvailable: boolean,
    baitFood: Item,
    didFishBite: boolean
}

const initialState: State = {
    isBaitAvailable: false,
    baitFood: localStorage['baitFood'] ? JSON.parse(localStorage['baitFood']) : allItems['Mushroom'],
    didFishBite: false
}

export default function(state: State = initialState, action): State {
    switch(action.type) {
        case MAKE_BAIT_AVAILABLE:
            return { ...state, isBaitAvailable: action.payload }
            break
        case PUT_ON_BAIT_ITEM:
            localStorage['baitFood'] = JSON.stringify(action.payload)
            return { ...state, baitFood: action.payload }
        default: return state
    }
}