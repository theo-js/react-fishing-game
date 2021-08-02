import React, { ReactNode, Fragment, useState, useMemo, useCallback, useEffect } from 'react'
import styles from './index.module.sass'
import allCategories from '../../../../items/categories.json'
import { ContentID, randomGreeting, randomThanks } from "../index"
import { ItemCategory, InventoryEntry } from '../../../../../interfaces/items'
import { randomIntFromInterval } from '../../../../../utils/math'
import useLazyAudio from '../../../../../hooks/useLazyAudio'
import { BiCoin, GiMagnifyingGlass } from 'react-icons/all'

// Redux
import { connect } from 'react-redux'
import { doubloonsSelector } from '../../../../../store/selectors/game'
import { sellableEntriesSelector } from '../../../../../store/selectors/inventory'
import { sellItemAction } from '../../../../../store/actions/inventory'

// Seller dialogs
export const saleIntroPhrases: string[] = [
    'What do you need to get rid of ?',
    'How can I help you ?',
    'Alright, what do ye have for me ?'
]
export const randomSaleIntroPhrase = (): string => saleIntroPhrases[randomIntFromInterval(0, saleIntroPhrases.length - 1)]


interface Props {
    setSellerPhrase: React.Dispatch<React.SetStateAction<string>>,
    setCurrentContentID?: React.Dispatch<React.SetStateAction<ContentID>>,
    myDoubloons?: number,
    sellItem: any,
    sellableEntries?: InventoryEntry[]
}

export const Sell: React.FC<Props> = ({ setSellerPhrase, setCurrentContentID, myDoubloons, sellItem, sellableEntries }) => {
    // Audio
    const saleSE = useLazyAudio({ src: 'se/sale.mp3' })
    
    // State
    const [focusedItem, setFocusedItem] = useState<string>(null)
    const [searchFilter, setSearchFilter] = useState<string>('')

    // Items
    const forSaleItems = useMemo(() => {
        // Figure out which entries to render
        let entries = sellableEntries
        if (searchFilter) {
            entries = sellableEntries.filter((entry: InventoryEntry) => new RegExp(searchFilter, 'i').test(entry.item._id))
        }

        return entries.map((entry: InventoryEntry) => {
            const { item } = entry
            const isFocused = focusedItem === item._id
            return <ForSaleItem
                key={item._id}
                isFocused={isFocused}
                setFocusedItem={setFocusedItem}
                entry={entry}
                myDoubloons={myDoubloons}
            />
        })
    }, [focusedItem, myDoubloons, sellableEntries, searchFilter])

    useEffect(() => {
        // Change seller's dialog
        if (!focusedItem) setSellerPhrase(randomSaleIntroPhrase())
    }, [focusedItem])

    // JSX
    const detailsJSX = useMemo((): ReactNode => {
        const fallback = <aside className={styles.details}>
            <p className={styles.description}>Select an item from your inventory</p>
            <p className={styles.myDoubloons}>
                <span className={styles.label}>Wallet:&nbsp;&nbsp;</span>
                {myDoubloons} <BiCoin />
            </p>
        </aside>

        const entry: InventoryEntry = sellableEntries.find((entry: InventoryEntry) => entry.item._id === focusedItem)
        if (!focusedItem || !entry) return fallback

        return <SaleDetails
            key={entry.item._id}
            setSellerPhrase={setSellerPhrase}
            entry={entry}
            myDoubloons={myDoubloons}
            sellItem={sellItem}
            saleSE={saleSE}
            setFocusedItem={setFocusedItem}
         />
    }, [focusedItem, sellableEntries, sellItem, myDoubloons])

    return <div className={styles.sell}>
        <main className={styles.forSaleItems}>
            <ul className={styles.forSaleItemsList}>
                <li className={`${styles.search} ${searchFilter ? styles.active : ''}`}>
                    <input
                        type="text"
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                     />
                    <GiMagnifyingGlass />
                </li>
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
    setFocusedItem: React.Dispatch<React.SetStateAction<string>>,
    entry: InventoryEntry, 
    myDoubloons?: number,
    sellItem?: any,
    saleSE?: HTMLAudioElement
}

const SaleDetails: React.FC<DetailsProps> = ({ setSellerPhrase, setFocusedItem, entry, myDoubloons, sellItem, saleSE }) => {
    const { item, amount } = entry
    const { _id, plural, description, salePrice, isSellable } = item
    const [saleAmount, setSaleAmount] = useState<number>(1)
    const [isConfirmingSale, setIsConfirmingSale] = useState<boolean>(false)
    
    const totalPrice = useMemo((): number => salePrice*saleAmount, [salePrice, saleAmount])

    const canSell = useMemo((): boolean => {
        return isSellable && amount > 0 && saleAmount > 0
    }, [isSellable, amount, saleAmount])

    const saleBTN = useMemo((): ReactNode => {
        if (!canSell) {
            return <button className={`${styles.disabled} btn btn-cancel ${styles.saleBTN}`}>
                Cannot sell this
            </button>
        }
        if (isConfirmingSale) {
            return <>
                <span
                    className={`btn btn-cancel ${styles.cancelBTN}`}
                    onClick={() => {
                        setIsConfirmingSale(false)
                        setSellerPhrase(randomSaleIntroPhrase())
                    }}
                >
                    Cancel
                </span>
                <button className={`btn btn-primary ${styles.saleBTN}`}>
                    Confirm
                </button>
            </>
        }

        return <button className={`btn btn-primary ${styles.saleBTN}`}>
            Sell {saleAmount} {saleAmount <= 1 ? _id : plural}
        </button>
    }, [canSell, isConfirmingSale, saleAmount, _id, plural])

    const confirmSale = useCallback(
        (e: any): void => {
            e.preventDefault()
            if (canSell) {
                if (!isConfirmingSale) {
                    setIsConfirmingSale(true)
                    setSellerPhrase(`Want to sell me ${saleAmount} ${saleAmount > 1 ? plural.toLowerCase() : _id.toLowerCase()} ?`)
                } else {
                    sellItem(_id, saleAmount, totalPrice)
                    saleSE.play()
                    setSellerPhrase(randomThanks())
                    setIsConfirmingSale(false)

                    // Remove focus if entry is removed from inventory (amount gets null)
                    const isNextAmountNull = saleAmount >= amount
                    if (isNextAmountNull) setFocusedItem(null)
                }
            } else {
                setSellerPhrase('I\'m not interested ...')
            }
        }, [
            canSell,
            isConfirmingSale,
            _id,
            plural,
            amount,
            saleAmount,
            totalPrice,
            sellItem,
            saleSE
        ]
    )

    // Component will unmount
    useEffect(() => {
        return () => {
            setSellerPhrase(randomSaleIntroPhrase)
        }
    }, [])
    
    return <aside className={styles.details}>
        <article className={styles.description}>{description}</article>
        <form className={styles.saleActions} onSubmit={confirmSale}>
            <fieldset className={styles.amount}>
                <label htmlFor={`${_id}_amount`}>
                    Amount:&nbsp;
                </label>
                <input
                    type="number"
                    readOnly={isConfirmingSale}
                    id={`${_id}_amount`}
                    value={saleAmount}
                    max={amount}
                    min={1}
                    step={1}
                    onChange={e => {
                        const newAmount = parseInt(e.target.value)
                        if (newAmount <= 0) setSaleAmount(1)
                        else if (newAmount > amount) setSaleAmount(amount)
                        else setSaleAmount(newAmount)
                    }}
                />
                <p className={styles.totalPrice}>
                    <span className={styles.label}>Total: </span>
                    {totalPrice} <BiCoin />
                </p>
            </fieldset>
            <p className={styles.myDoubloons}>
                <span className={styles.label}>Wallet:&nbsp;&nbsp;</span>
                {myDoubloons} <BiCoin />
            </p>
            <fieldset className={styles.submit}>{saleBTN}</fieldset>
        </form>
    </aside>
}

interface ForSaleItemProps {
    entry: InventoryEntry,
    isFocused: boolean,
    setFocusedItem: React.Dispatch<React.SetStateAction<string>>,
    myDoubloons?: number
}

function ForSaleItem ({ entry, setFocusedItem, isFocused, myDoubloons }) {
    const { item, amount } = entry
    const { _id, salePrice, image, category } = item
    const itemCategory: ItemCategory = allCategories[category]
    const textStyle = useMemo(() => ({ background: `linear-gradient(${itemCategory.colors.join(', ')}` }), [itemCategory])

    return <li
        className={`${styles.forSaleItem} ${isFocused ? styles.focused : ''}`}
        style={{ boxShadow: isFocused ? `0 0 1px 1px inset ${itemCategory.colors[0]}` : 'none' }}
        onClick={() => isFocused ? setFocusedItem(null) : setFocusedItem(_id)}
    >
        <figure className={styles.itemImage} style={{ color: itemCategory.colors[1] }} dangerouslySetInnerHTML={{ __html: image }}></figure>
        <span
            className={styles.id}
            style={textStyle}
        >{_id}</span>
        <span className={styles.amount}>&times;{amount}</span>
        <span className={styles.price}><strong>{salePrice}</strong> <BiCoin /></span>
    </li>
}

// Connect "Sell" component to Redux
const mapStateToProps = state => ({
    myDoubloons: doubloonsSelector(state),
    sellableEntries: sellableEntriesSelector(state)
})
const mapDispatchToProps = dispatch => ({
    sellItem: (itemID: string, amount: number, price: number) => dispatch(sellItemAction(itemID, amount, price))
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sell)