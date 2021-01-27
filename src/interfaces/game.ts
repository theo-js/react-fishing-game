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