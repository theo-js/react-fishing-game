import { createSelector } from 'reselect'
import { State } from '../reducers/fishing'

export const isBaitAvailableSelector = createSelector(
    (state: any) => state.fishing,
    (fishing: State) => fishing.isBaitAvailable
)

export const baitFoodSelector = createSelector(
    (state: any) => state.fishing,
    (fishing: State) => fishing.baitFood
)