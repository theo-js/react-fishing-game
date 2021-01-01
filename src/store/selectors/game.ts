import { createSelector } from 'reselect'

export const processSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.process
)

export const isMainMenuOpenSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.isMainMenuOpen
)

export const isMainMenuClosingSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.isMainMenuClosing
)

export const rodLevelSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.gameStats.fishrodLevel
)