import React, { ReactNode, useState, useMemo, useEffect } from 'react'
import styles from './index.module.sass'
import allItems from '../../../../items/items.json'
import allCategories from '../../../../items/categories.json'
import { Item, ItemCategory } from '../../../../../interfaces/items'
import { BiCoin } from 'react-icons/all'

interface Props {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>
}

const Buy: React.FC<Props> = ({ setSellerPhrase }) => {
    const [focusedItem, setFocusedItem] = useState<string>(null)
    const forSaleItems = useMemo(() => {
        const ids: string[] = [
            'Mushroom',
            'Fly',
            'Butterfly',
            'Dragonfly'
        ]
        return ids.map(id => {
            const item: Item = allItems[id]
            const isFocused = focusedItem === id
            return <ForSaleItem
                key={id}
                isFocused={isFocused}
                setFocusedItem={setFocusedItem}
                item={item}
             />
        })
    }, [focusedItem])

    useEffect(() => {
        // Change seller's dialog
        if (!focusedItem) setSellerPhrase('Which item will you buy ?')
    }, [focusedItem])

    const detailsJSX = useMemo((): ReactNode => {
        if (!focusedItem) {
            return <aside className={styles.details}>
                <p className={styles.description}>Select an item to check its details</p>
            </aside>
        }

        const item: Item = allItems[focusedItem]
        return <PurchaseDetails
            setSellerPhrase={setSellerPhrase}
            item={item}
         />
    }, [focusedItem])

    return <div className={styles.buy}>
        <main className={styles.forSaleItems}>
            <ul className={styles.forSaleItemsList}>
                {forSaleItems}
            </ul>
            {detailsJSX}
        </main>
    </div>
}

interface DetailsProps {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>,
    item: Item
}

const PurchaseDetails: React.FC<any> = ({ setSellerPhrase, item }) => {
    const { description } = item
    return <aside className={styles.details}>
        <article className={styles.description}>{description}</article>
    </aside>
}

interface ForSaleItemProps {
    item: Item,
    isFocused: boolean,
    setFocusedItem: React.Dispatch<React.SetStateAction<string>>
}

function ForSaleItem ({ item, setFocusedItem, isFocused }) {
    const { _id, isSellable, salePrice, image, category } = item
    const itemCategory: ItemCategory = allCategories[category]
    const textStyle = useMemo(() => ({ background: `linear-gradient(${itemCategory.colors.join(', ')}` }), [itemCategory])

    return <li
        className={`${styles.forSaleItem} ${isFocused ? styles.focused : ''}`}
        onClick={() => isFocused ? setFocusedItem(null) : setFocusedItem(_id)}
    >
        <figure className={styles.itemImage} style={{ color: itemCategory.colors[1] }} dangerouslySetInnerHTML={{ __html: image }}></figure>
        <span
            className={styles.id}
            style={textStyle}
        >{_id}</span>
        <span className={styles.price}><strong>{salePrice}</strong> <BiCoin /></span>
    </li>
}

export default Buy