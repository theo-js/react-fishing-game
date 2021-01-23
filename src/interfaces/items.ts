export interface Item {
    _id: string,
    plural?: string,
    category: string,
    description?: string,
    image?: string,
    isSellable: boolean,
    isDisposable: boolean,
    purchasePrice?: number,
    salePrice?: number
}

export interface InventoryEntry {
    amount: number,
    item: Item
}

export interface ItemCategory {
    _id: string,
    colors: string[]
}