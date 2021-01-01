import { Item } from './items'

export interface Fish {
    _id: string,
    look?: string,
    minExp: number,
    maxExp: number,
    likes: string[]
}