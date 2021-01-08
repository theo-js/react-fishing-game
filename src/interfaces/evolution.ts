export interface FishRodLevel {
    _id?: string
    className?: any, // Sass module
    maxLength?: number
}

export interface GameStats {
    doubloons: number,
    gameTimeSpent: number, // in minutes
    fishrodLevel: FishRodLevel
}