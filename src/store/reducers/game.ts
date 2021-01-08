import {
    SET_GAME_PROCESS,
    SPEND_ONE_MINUTE,
    ENABLE_BGM,
    OPEN_MAIN_MENU,
    SET_IS_MAIN_MENU_CLOSING,
    SET_FISHROD_LEVEL,
    EARN_MONEY,
    SPEND_MONEY
} from '../actions/types'
import gameProcesses from '../../components/Game/processes/index.json'
import { GameStats } from '../../interfaces/evolution'
import { rodLevels } from '../../components/Game/evolution'

export interface State {
    process: string,
    isMainMenuOpen: boolean,
    isMainMenuClosing: boolean,
    isBGMEnabled: boolean,
    gameStats: GameStats
}

const initialGameStats: GameStats = {
    gameTimeSpent: 0,
    doubloons: 50,
    fishrodLevel: rodLevels.find(lvl => lvl._id === 'Starter')
}

const initialState: State = {
    process: gameProcesses.INITIAL,
    isMainMenuOpen: false,
    isMainMenuClosing: false,
    isBGMEnabled: typeof localStorage['bgm_enabled'] !== 'undefined' ? JSON.parse(localStorage['bgm_enabled']) : true,
    gameStats: localStorage['gameStats'] ? JSON.parse(localStorage['gameStats']) : initialGameStats
}

export default function (state: State = initialState, action) {
    switch (action.type) {
        case SET_GAME_PROCESS:
            return { ...state, process: action.payload }
            break
        case SPEND_ONE_MINUTE: {
            const newTime = state.gameStats.gameTimeSpent + 1
            const newStats = { ...state.gameStats, gameTimeSpent: newTime }
            
            localStorage['gameStats'] = JSON.stringify(newStats)
            return { ...state, gameStats: newStats }
            break
        } case OPEN_MAIN_MENU:
            return { ...state, isMainMenuOpen: action.payload }
            break
        case SET_IS_MAIN_MENU_CLOSING:
            return { ...state, isMainMenuClosing: action.payload }
            break
        case SET_FISHROD_LEVEL: {
            const newGameStats = {
                ...state.gameStats,
                fishrodLevel: rodLevels.find(lvl => lvl._id === action.payload)
            }
            localStorage['gameStats'] = JSON.stringify(newGameStats)
            return {
                ...state,
                gameStats: newGameStats
            }
        }
        case EARN_MONEY: {
            const maxDoubloons = 999999
            const myDoubloons = state.gameStats.doubloons
            const canEarnMore = myDoubloons + action.payload < maxDoubloons
            let nextDoubloons = myDoubloons
            if (!canEarnMore) nextDoubloons = maxDoubloons
            else nextDoubloons = myDoubloons + action.payload

            // Save game stats
            const newStats = {
                ...state.gameStats,
                doubloons: nextDoubloons
            }
            localStorage['gameStats'] = JSON.stringify(newStats)

            return { ...state, gameStats: newStats }
            break
        }
        case SPEND_MONEY: {
            const minDoubloons = 0
            const myDoubloons = state.gameStats.doubloons
            const canSpendMore = myDoubloons - action.payload > minDoubloons
            let nextDoubloons = myDoubloons
            if (!canSpendMore) nextDoubloons = minDoubloons
            else nextDoubloons = myDoubloons - action.payload

            // Save game stats
            const newStats = {
                ...state.gameStats,
                doubloons: nextDoubloons
            }
            localStorage['gameStats'] = JSON.stringify(newStats)

            return { ...state, gameStats: newStats }
            break
        }
        case ENABLE_BGM:
            localStorage['bgm_enabled'] = JSON.stringify(action.payload)
            return {
                ...state,
                isBGMEnabled: action.payload
            }
            break
        default: return state
    }
}