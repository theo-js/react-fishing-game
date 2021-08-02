import React, { ReactNode, Fragment, useState, useMemo, useCallback, useEffect } from 'react'
import styles from './index.module.sass'
import allItems from '../../../../items/items.json'
import { rodLevels } from '../../../evolution'
import allCategories from '../../../../items/categories.json'
import { ContentID, randomGreeting, randomThanks } from "../index"
import { Item, ItemCategory, InventoryEntry } from '../../../../../interfaces/items'
import { randomIntFromInterval } from '../../../../../utils/math'
import { pxToM } from '../../../../../utils/position'
import useLazyAudio from '../../../../../hooks/useLazyAudio'
import { BiCoin } from 'react-icons/all'

// Redux
import { connect, useSelector } from 'react-redux'
import { doubloonsSelector } from '../../../../../store/selectors/game'
import { inventoryEntriesSelector } from '../../../../../store/selectors/inventory'
import { purchaseItemAction } from '../../../../../store/actions/inventory'

// Seller dialogs
export const purchaseIntroPhrases: string[] = [
    'Which item will you buy ?',
    'How can I help you ?',
    'Alright, what can I do for ye ?'
]
export const randomPurchaseIntroPhrase = (): string => purchaseIntroPhrases[randomIntFromInterval(0, purchaseIntroPhrases.length - 1)]

export const tooExpensivePhrases: string[] = [
    'Hey ! I want more doubloons for that !!',
    'Come back with more cash, buddy !',
    'Well tried, but that is worth WAY more doubloons !'
]
export const randomTooExpensivePhrase = (): string => tooExpensivePhrases[randomIntFromInterval(0, tooExpensivePhrases.length - 1)]

interface Props {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>,
    setCurrentContentID?: React.Dispatch<React.SetStateAction<ContentID>>,
    myDoubloons?: number,
    purchaseItem: any
}

export const Buy: React.FC<Props> = ({ setSellerPhrase, setCurrentContentID, myDoubloons, purchaseItem }) => {
    // Redux
    const inventoryEntries: InventoryEntry[] = useSelector(inventoryEntriesSelector)

    // Audio
    const purchaseSE = useLazyAudio({ src: 'se/purchase.mp3' })
    const thankYouSE = useLazyAudio({ src: 'se/thank-you-for-the-doubloons.mp3' })

    // Items
    const [focusedItem, setFocusedItem] = useState<string>(null)
    const forSaleItems = useMemo(() => {
        const ids: string[] = [
            'Mushroom',
            'Fly',
            'Butterfly',
            'Dragonfly'
        ]
        // Add fishing poles that are not already in player's possession
        const fishrodIDs: Array<string> = rodLevels.map(lvl => {
            const fishrodID = lvl._id
            // Add to available for purchase list if this id is not inventory yet
            if (!inventoryEntries.find(entry => entry.item._id === fishrodID)) {
                return fishrodID
            }
        }).filter(id => typeof id !== 'undefined')

        return [...ids, ...fishrodIDs].map(id => {
            const item: Item = allItems[id]
            const isFocused = focusedItem === id
            return <ForSaleItem
                key={id}
                isFocused={isFocused}
                setFocusedItem={setFocusedItem}
                item={item}
                myDoubloons={myDoubloons}
             />
        })
    }, [focusedItem, myDoubloons, inventoryEntries])

    useEffect(() => {
        // Change seller's dialog
        if (!focusedItem) setSellerPhrase(randomPurchaseIntroPhrase())
    }, [focusedItem])

    // JSX
    const detailsJSX = useMemo((): ReactNode => {
        if (!focusedItem) {
            return <aside className={styles.details}>
                <p className={styles.description}>Select an item to check its details</p>
                <p className={styles.myDoubloons}>
                    <span className={styles.label}>Wallet:&nbsp;&nbsp;</span>
                    {myDoubloons} <BiCoin />
                </p>
            </aside>
        }

        const item: Item = allItems[focusedItem]
        return <PurchaseDetails
            key={item._id}
            setSellerPhrase={setSellerPhrase}
            item={item}
            myDoubloons={myDoubloons}
            purchaseItem={purchaseItem}
            purchaseSE={purchaseSE}
            thankYouSE={thankYouSE}
            inventoryEntries={inventoryEntries}
         />
    }, [focusedItem, purchaseItem, myDoubloons])

    return <div className={styles.buy}>
        <main className={styles.forSaleItems}>
            <ul className={styles.forSaleItemsList}>
                {forSaleItems}
            </ul>
            {detailsJSX}
        </main>
        <aside className={styles.footer}>
            <nav className={styles.navigation}>
                <button onClick={() => {
                    setSellerPhrase(randomGreeting())
                    setCurrentContentID(ContentID.ROOT)
                }} className={`btn btn-cancel ${styles.previous}`}>
                    &lt;
                </button>
            </nav>
        </aside>
    </div>
}

interface DetailsProps {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>,
    item: Item 
    myDoubloons?: number,
    purchaseItem?: any,
    purchaseSE?: HTMLAudioElement,
    thankYouSE?: HTMLAudioElement,
    inventoryEntries: InventoryEntry[]
}

const PurchaseDetails: React.FC<DetailsProps> = ({ setSellerPhrase, item, myDoubloons, purchaseItem, purchaseSE, thankYouSE, inventoryEntries }) => {
    // State
    const { _id, plural, description, purchasePrice, category } = item
    const [amount, setAmount] = useState<number>(1)
    const [isConfirmingPurchase, setIsConfirmingPurchase] = useState<boolean>(false)
    
    const totalPrice = useMemo((): number => purchasePrice*amount, [purchasePrice, amount])

    const canBuy = useMemo((): boolean => {
        const hasPlayerEnoughMoney = myDoubloons >= totalPrice
        return hasPlayerEnoughMoney && amount > 0
    }, [myDoubloons, totalPrice, amount])

    const amountInInventory = useMemo((): number => {
        const inventoryEntry = inventoryEntries.find((entry: InventoryEntry) => entry.item._id === _id)
        // Item is not in player's inventory
        if (!inventoryEntry) return 0
        // Item is already in inventory
        else return inventoryEntry.amount
    }, [inventoryEntries, _id])

    const purchaseBTN = useMemo((): ReactNode => {
        if (!canBuy) {
            return <button className={`${styles.disabled} btn btn-cancel ${styles.purchaseBTN}`}>
                Too expensive
            </button>
        }
        if (isConfirmingPurchase) {
            return <>
                <span
                    className={`btn btn-cancel ${styles.cancelBTN}`}
                    onClick={() => {
                        setIsConfirmingPurchase(false)
                        setSellerPhrase(randomPurchaseIntroPhrase())
                    }}
                >
                    Cancel
                </span>
                <button className={`btn btn-primary ${styles.purchaseBTN}`}>
                    Confirm
                </button>
            </>
        }

        return <button className={`btn btn-primary ${styles.purchaseBTN}`}>
            Buy {amount} {amount <= 1 ? _id : plural}
        </button>
    }, [canBuy, isConfirmingPurchase, amount, _id, plural])

    const confirmPurchase = useCallback(
        (e: any): void => {
            e.preventDefault()
            if (canBuy) {
                if (!isConfirmingPurchase) {
                    setIsConfirmingPurchase(true)
                    setSellerPhrase(`Want to buy ${amount} ${amount > 1 ? plural.toLowerCase() : _id.toLowerCase()} ?`)
                } else {
                    purchaseItem(_id, amount, totalPrice)
                    purchaseSE.play()
                    setSellerPhrase(randomThanks())
                    setIsConfirmingPurchase(false)
                    setAmount(1)
                    // "Thank you !"
                    window.setTimeout(() => {
                        if (thankYouSE) thankYouSE.play()
                    }, 1500)
                }
            } else {
                setSellerPhrase(randomTooExpensivePhrase())
            }
        }, [
            canBuy,
            isConfirmingPurchase,
            _id,
            plural,
            amount,
            totalPrice,
            purchaseItem,
            purchaseSE
        ]
    )

    // Component will unmount
    useEffect(() => {
        return () => {
            setSellerPhrase(randomPurchaseIntroPhrase)
        }
    }, [])

    // Display fishing pole stats
    const fishingPoleStats = useMemo((): ReactNode => {
        if (category !== 'Fishing pole') return null
        
        const lvl = rodLevels.find(level => level._id === _id)
        if (!lvl) return null

        return <section className={styles.fishingPoleStats}>
            <br />
            <p>Line length: <strong>{pxToM(lvl['maxLength'])}m</strong></p>
            <p>Resistance: <strong>{lvl['resistance']*100}</strong></p>
            <p>Strength: <strong>{lvl['strength']*5}</strong></p>
        </section>
    }, [_id, rodLevels])
    
    return <aside className={styles.details}>
        <article className={styles.description}>
            {description}
            {fishingPoleStats}
        </article>
        <form className={styles.purchaseActions} onSubmit={confirmPurchase}>
            <fieldset className={styles.amount}>
                <label htmlFor={`${_id}_amount`}>
                    Amount:&nbsp;
                </label>
                <input
                    type="number"
                    readOnly={isConfirmingPurchase}
                    id={`${_id}_amount`}
                    value={amount}
                    max={99}
                    min={1}
                    step={1}
                    onChange={e => {
                        if (category === 'Fishing pole') return setAmount(1) // Can only buy 1 fishing pole
                        
                        const newAmount = parseInt(e.target.value)
                        if (newAmount <= 0) setAmount(1)
                        else if (newAmount > 99) setAmount(99)
                        else setAmount(newAmount)
                    }}
                />
                <p className={styles.totalPrice}>
                    <span className={styles.label}>Total: </span>
                    {totalPrice} <BiCoin />
                </p>
            </fieldset>
            <p className={styles.myDoubloons}>
                <span className={styles.label}>Inventory:&nbsp;&nbsp;</span>
                {amountInInventory} 
                <span
                    className={styles.label}
                    style={{ marginLeft: '.5em' }}
                >Wallet:&nbsp;&nbsp;</span>
                {myDoubloons} <BiCoin />
            </p>
            <fieldset className={styles.submit}>{purchaseBTN}</fieldset>
        </form>
    </aside>
}

interface ForSaleItemProps {
    item: Item,
    isFocused: boolean,
    setFocusedItem: React.Dispatch<React.SetStateAction<string>>,
    myDoubloons?: number
}

function ForSaleItem ({ item, setFocusedItem, isFocused, myDoubloons }) {
    const { _id, purchasePrice, image, category } = item
    const itemCategory: ItemCategory = allCategories[category]
    const textStyle = useMemo(() => ({ background: `linear-gradient(${itemCategory.colors.join(', ')}` }), [itemCategory])

    return <li
        className={`
            ${styles.forSaleItem}
             ${isFocused ? styles.focused : ''}
             ${purchasePrice > myDoubloons ? styles.tooExpensive : ''}
        `}
        style={{ boxShadow: isFocused ? `0 0 1px 1px inset ${itemCategory.colors[0]}` : 'none' }}
        onClick={() => isFocused ? setFocusedItem(null) : setFocusedItem(_id)}
    >
        <figure
            className={styles.itemImage} 
            style={{ color: itemCategory.colors[1] }} 
            dangerouslySetInnerHTML={{ __html: image }}
        ></figure>
        <span
            className={styles.id}
            style={textStyle}
        >{_id}</span>
        <span className={styles.price}><strong>{purchasePrice}</strong> <BiCoin /></span>
    </li>
}

// Connect "Buy" component to Redux
const mapStateToProps = state => ({
    myDoubloons: doubloonsSelector(state)
})
const mapDispatchToProps = dispatch => ({
    purchaseItem: (itemID: string, amount: number, price: number) => dispatch(purchaseItemAction(itemID, amount, price))
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Buy)