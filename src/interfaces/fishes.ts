import { Item } from './items'

export interface Fish {
    readonly _id: string,
    look?: string,
    edibleFoods?: string[],
    strength: number[], // [min, max]
    size?: number[], // [min, max]
    roamingDistance?: number,
    roamingInterval?: number,
    biteChance?: number,
    catchTimeLapse?: number[],
    className?: string,
    detectionScope?: number
}

export interface UniqueFish {
    readonly _id: string,
    look?: string,
    edibleFoods?: string[],
    strength: number,
    size: number,
    roamingDistance?: number,
    roamingInterval?: number,
    biteChance?: number,
    catchTimeLapse?: number[],
    className?: string,
    detectionScope?: number
}

export interface FishData {
    fishID: string,
    groupID: string,
    fish: UniqueFish
}