import {
    SET_GAME_PROCESS,
    OPEN_MAIN_MENU,
    SET_IS_MAIN_MENU_CLOSING,
    SET_FISHROD_LEVEL
} from '../actions/types'
import gameProcesses from '../../components/Game/processes/index.json'
import { GameStats } from '../../interfaces/evolution'
import { rodLevels } from '../../components/Game/evolution'

interface State {
    process: string,
    isMainMenuOpen: boolean,
    isMainMenuClosing: boolean,
    gameStats: GameStats
}

const initialGameStats: GameStats = {
    coins: 0,
    fishrodLevel: rodLevels.find(lvl => lvl._id === 'Starter')
}

const initialState: State = {
    process: gameProcesses.INITIAL,
    isMainMenuOpen: false,
    isMainMenuClosing: false,
    gameStats: localStorage['gameStats'] ? JSON.parse(localStorage['gameStats']) : initialGameStats
}

export default function (state: State = initialState, action) {
    switch (action.type) {
        case SET_GAME_PROCESS:
            return { ...state, process: action.payload }
            break
        case OPEN_MAIN_MENU:
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
        default: return state
    }
}