import {
    SET_GAME_PROCESS,
    OPEN_MAIN_MENU,
    SET_IS_MAIN_MENU_CLOSING,
    SET_FISHROD_LEVEL
} from './types'

export const setGameProcessAction = (process: string) => ({ type: SET_GAME_PROCESS, payload: process })
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