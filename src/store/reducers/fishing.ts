import { MAKE_BAIT_AVAILABLE } from '../actions/types'

interface State {
    isBaitAvailable: boolean,
    baitFood: string,
    didFishBite: boolean
}

const initialState = {
    isBaitAvailable: false,
    baitFood: 'mushroom',
    didFishBite: false
}

export default function(state: State = initialState, action): State {
    switch(action.type) {
        case MAKE_BAIT_AVAILABLE:
            return { ...state, isBaitAvailable: action.payload }
            break
        default: return state
    }
}