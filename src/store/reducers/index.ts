import { combineReducers } from 'redux'
import gameReducer from './game'
import itemsReducer from './inventory'
import positionReducer from './position'
import fishingReducer from './fishing'

export default combineReducers({
    game: gameReducer,
    inventory: itemsReducer,
    position: positionReducer,
    fishing: fishingReducer
})