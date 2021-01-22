import { createSelector } from 'reselect'
import { State } from '../reducers/fishing'
import { FishData } from '../../interfaces/fishes'

export const isBaitAvailableSelector = createSelector(
    (state: any) => state.fishing,
    (fishing: State) => fishing.isBaitAvailable
)

export const baitFoodSelector = createSelector(
    (state: any) => state.fishing,
    (fishing: State) => fishing.baitFood
)

export const hookedFishSelector = createSelector(
    (state: any): State => state.fishing,
    (fishing: State): FishData => fishing.hookedFish
)