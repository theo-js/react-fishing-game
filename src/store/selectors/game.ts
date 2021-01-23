import { createSelector } from 'reselect'
import { State } from '../reducers/game'
import { GameStats, FishRodLevel } from '../../interfaces/evolution'


export const processSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.process
)

export const isBGMEnabledSelector = createSelector(
    (state: any): State => state.game,
    (game: State): boolean => game.isBGMEnabled
)

export const isMainMenuOpenSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.isMainMenuOpen
)

export const isMainMenuClosingSelector = createSelector(
    (state: any) => state,
    (state: any) => state.game.isMainMenuClosing
)

// Stats
export const gameStatsSelector = createSelector(
    (state: any): GameStats => state.game.gameStats,
    (gameStats: GameStats) => gameStats
)

export const rodLevelSelector = createSelector(
    (state: any): GameStats => state.game.gameStats,
    (gameStats: GameStats): FishRodLevel => gameStats.fishrodLevel
)

export const doubloonsSelector = createSelector(
    (state: any): GameStats => state.game.gameStats,
    (gameStats: GameStats) => gameStats.doubloons
)

export const gameTimeSpentSelector = createSelector(
    (state: any): GameStats => state.game.gameStats,
    (gameStats: GameStats) => gameStats.gameTimeSpent
)