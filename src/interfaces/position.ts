export enum Direction {
    LEFT = 'LEFT',
    RIGHT = "RIGHT"
}

export interface Dimensions {
    width: number,
    height: number
}

export interface Coordinates {
    x: number,
    y: number,
    width?: number,
    height?: number,
    [key: string]: any
}

export interface Path {
    from: Coordinates,
    to: Coordinates
}

export interface Map {
    width: number,
    height: number,
    shorePath: Path,
    lakePath: Path
}