import { Map, Coordinates } from '../../interfaces/position'
import { UPDATE_POSITION } from '../actions/types'

interface State {
    map: Map,
    baitLakeCoords: Coordinates
}

const initialMap: Map = {
    width: 4200,
    height: 3200,
    shorePath: { from: { x: 0, y: 0 }, to: { x: 4200, y: 200 }},
    lakePath: { from: { x: 0, y: 0 }, to: { x: 4200, y: 3000 }}
}


const initialState = {
    map: initialMap,
    baitLakeCoords: { x: 0, y: 0 }
}

export default function (state = initialState, action: any): State {
    switch(action.type) {
        case UPDATE_POSITION:
            return ({
                ...state,
                ...action.payload
            })
            break
        default: return state
    }
}