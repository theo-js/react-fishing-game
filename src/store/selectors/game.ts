import { createSelector } from 'reselect'
import { State } from '../reducers/game'
import { GameNotif } from '../../interfaces/game'
import { GameStats, FishRodLevel } from '../../interfaces/evolution'


export const processSelector = createSelector(
    (state: any): State => state.game,
    (game: State): string => game.process
)

export const isBGMEnabledSelector = createSelector(
    (state: any): State => state.game,
    (game: State): boolean => game.isBGMEnabled
)

export const isMainMenuOpenSelector = createSelector(
    (state: any): State => state.game,
    (game: State): boolean => game.isMainMenuOpen
)

export const isMainMenuClosingSelector = createSelector(
    (state: any): State => state.game,
    (game: State) => game.isMainMenuClosing
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
    (gameStats: GameStats): number => gameStats.doubloons
)

export const gameTimeSpentSelector = createSelector(
    (state: any): GameStats => state.game.gameStats,
    (gameStats: GameStats): number => gameStats.gameTimeSpent
)

// Notifications
export const gameNotificationSelector = createSelector(
    (state: any): State => state.game,
    (game: State): GameNotif => game.gameNotification
)