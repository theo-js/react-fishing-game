import { MAKE_BAIT_AVAILABLE } from './types'

export const makeBaitAvailableAction = (bool: boolean): any => ({ type: MAKE_BAIT_AVAILABLE, payload: bool })