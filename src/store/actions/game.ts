import { GameNotif } from '../../interfaces/game'
import {
    SET_GAME_PROCESS,
    ENABLE_BGM,
    OPEN_MAIN_MENU,
    SET_IS_MAIN_MENU_CLOSING,
    SET_FISHROD_LEVEL,
    GAME_NOTIFICATION
} from './types'

export const setGameProcessAction = (process: string) => ({ type: SET_GAME_PROCESS, payload: process })
export const enableBGMAction = (isEnabled: boolean) => ({ type: ENABLE_BGM, payload: isEnabled })
export const openMainMenuAction = () => ({ type: OPEN_MAIN_MENU, payload: true })
export const closeMainMenuAction = () => dispatch => {
    // Wait until closing animation is finished 
    dispatch({ type: SET_IS_MAIN_MENU_CLOSING, payload: true })
    window.setTimeout(() => {
        dispatch({ type: OPEN_MAIN_MENU, payload: false })
        dispatch({ type: SET_IS_MAIN_MENU_CLOSING, payload: false })
    }, 700)
}
export const setRodLevelAction = (fishrodID: string) => ({ type: SET_FISHROD_LEVEL, payload: fishrodID })

export const setGameNotificationAction = (notif: GameNotif|null) => ({ type: GAME_NOTIFICATION, payload: notif }) 