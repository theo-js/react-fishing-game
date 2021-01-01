import { createSelector } from 'reselect'

export const isBaitAvailableSelector = createSelector(
    (state: any) => state,
    (state: any) => state.fishing.isBaitAvailable
)

export const baitFoodSelector = createSelector(
    (state: any) => state,
    (state: any) => state.fishing.baitFood
)