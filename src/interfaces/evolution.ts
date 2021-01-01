export interface FishRodLevel {
    _id?: string
    className?: any, // Sass module
    maxLength?: number
}

export interface GameStats {
    coins: number,
    fishrodLevel: FishRodLevel
}