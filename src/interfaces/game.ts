import { FC } from 'react'

// Game processes
export enum GameProcess {
    "INITIAL" = "INITIAL",
    "THROW_LINE" = "THROW_LINE",
    "WAIT_FISH" = "WAIT_FISH",
    "BATTLE" = "BATTLE"
}

export type GameProcessComponent<T> = FC<T> & {
    GameProcess: GameProcess
}

// Custom in-game notifications
export enum GameNotifType {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    GREAT_SUCCESS = 'GREAT_SUCCESS',
    ITEM = 'ITEM',
    FAIL = 'FAIL'
}

export interface GameNotifContent {
    header?: string, // Header html content
    body?: string, // Body html content
    footer?: string // Footer html content
}

export interface GameNotif {
    html: GameNotifContent, // Message content
    type: GameNotifType,
    duration?: number, // in seconds
    transition?: number // in seconds
}

// Game tutorial
export enum TutorialEntry {
    INITIAL = 'INITIAL',
    BAG = 'BAG',
    THROW_LINE = 'THROW_LINE',
    THROWN = 'THROWN'
}

export interface Tutorial {
    [index: string]: boolean
}

export type TutorialEntryComponent<T> = FC<T> & {
    TutorialEntry: TutorialEntry
}