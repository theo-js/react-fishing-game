export interface FishRodLevel {
    _id: string
    className?: any, // Sass module
    maxLength: number,
    resistance: number, // Similar to Health Points
    strength: number // 0 - 1 Capacity to reel back the fish
}

export interface GameStats {
    doubloons: number,
    gameTimeSpent: number, // in minutes
    fishrodLevel: FishRodLevel
}