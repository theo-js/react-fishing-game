import React, { Dispatch, SetStateAction, ReactNode, Fragment, useMemo, useState, useCallback, useRef } from 'react'
import { InventoryEntry, ItemCategory, Item } from '../../../../interfaces/items'
import Modal from '../../../misc/Modal'
import categories from '../../../items/categories.json'
import { SectionID } from '../index'
import styles from './index.module.sass'

// Redux
import { connect, useDispatch, useSelector } from 'react-redux'
import { baitFoodSelector } from '../../../../store/selectors/fishing'
import { inventoryEntriesSelector, maxEntriesSelector } from '../../../../store/selectors/inventory'
import { deleteItemAction, removeInventoryEntryAction } from '../../../../store/actions/inventory'
import { putOnBaitItemAction, removeBaitItemAction } from '../../../../store/actions/fishing'

interface Props {
    entries: InventoryEntry[],
    maxEntries: number,
    setCurrentSection: Dispatch<SetStateAction<SectionID>>
}

interface EntryProps {
    entry: InventoryEntry,
    handleSelect: () => void,
    isSelected: boolean
}

interface DetailsProps {
    entry: InventoryEntry,
    setCurrentEntryNum: Dispatch<SetStateAction<number|ReactNode>>
}

export const Entry: React.FC<EntryProps> = ({ entry, handleSelect, isSelected }) => {
    const { amount, item } = entry
    const { category, image } = item
    const itemCategory = useMemo((): ItemCategory => categories[category], [category])
    const { colors } = itemCategory

    return <li
        className={`${styles.entry} ${isSelected ? styles.selected : ''}`}
        onClick={handleSelect}
    >
        <figure
            className={styles.image}
            dangerouslySetInnerHTML={{ __html: image }}
            style={{ color: colors[1] }}
        >
        </figure>
        <span className={styles.amount}>&times;<strong>{amount}</strong></span>
    </li>
}

export const Details: React.FC<DetailsProps> = ({ entry, setCurrentEntryNum }) => {
    const { item, amount } = entry
    const { _id, plural, description, category } = item
    const itemCategory = useMemo((): ItemCategory => categories[category], [category])

    const [modal, setModal] = useState<ReactNode>(null)
    const modalRef = useRef<any>(null)
    const [dropAmount, setDropAmount] = useState<number>(1)

    // Redux
    const dispatch = useDispatch()
    const removeItem = useCallback((itemID: string, amount: number): void => dispatch(removeInventoryEntryAction(itemID, amount)), [])
    const deleteEntry = useCallback((itemID: string): void => dispatch(deleteItemAction(itemID)), [])
    const putOnBait = useCallback((item: Item): void => dispatch(putOnBaitItemAction(item)), [])
    const removeBait = useCallback((): void => dispatch(removeBaitItemAction()), [])
    const baitFood = useSelector(baitFoodSelector)

    const handleConfirm = useCallback(
        (onConfirm, msg = 'Are you sure ?'): void => {
            setModal(
                <Modal
                    ref={modalRef}
                    onClose={setModal}
                    className={styles.modal}
                >
                    <h3>{msg}</h3>
                    <ul className={styles.actionsList}>
                        <li>
                            <button
                                onClick={() => modalRef.current.closeModal()}
                                className={`btn btn-cancel`}
                            >Cancel</button>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    onConfirm()
                                    modalRef.current.closeModal()
                                }}
                                className={`btn btn-primary`}
                            >Confirm</button>
                        </li>
                    </ul>
                </Modal>
            )
        }, []
    )

    const handleUseBait = useCallback(
        (): void => {
            putOnBait(item)
            setCurrentEntryNum(
                <p style={{ background: 'var(--black)', padding: '.25rem' }}>
                    <strong style={{ color: itemCategory.colors[0] }}>
                        {_id}
                    </strong>&nbsp;
                    is now on your fish pole
                </p>
            )
        }, [item, putOnBait, setCurrentEntryNum, _id, itemCategory]
    )

    const handleUseItem = useCallback(
        (): void => {
            switch(category) {
                case 'Fish':
                    // Fishes can be used as baits
                case 'Bait':
                    handleUseBait()
                    break
                default: return null
            }
        }, [category, handleUseBait]
    )

    return <aside className={styles.details}>
        <h3
            style={{
                background: `-webkit-linear-gradient(${itemCategory.colors.join(', ')})`
            }}
        >
            {_id}
        </h3>
        <article className={styles.description} style={{ color: itemCategory.colors[0] }}>
            {description}
        </article>
        <ul className={styles.actions}>
            <li>
                {
                category.match(/Bait|Fish/i) &&
                baitFood &&
                baitFood._id === _id ? (
                    <button
                        onClick={removeBait}
                        className={`btn btn-primary`}
                        title={`You are using some ${_id} as a bait. Remove it ?`}
                    >
                        Remove from fish pole
                    </button>
                ) : (
                    <button
                        onClick={handleUseItem}
                        className={`btn btn-primary`}
                        title={`Try to use ${_id.toLowerCase()}`}
                    >Use</button>
                )}
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '.25rem', flexWrap: 'nowrap' }}>
                <button
                    className={`btn btn-cancel`}
                    title={`Remove a chosen amount of ${_id.toLowerCase()} from the inventory`}
                    onClick={() => handleConfirm(() => removeItem(_id, dropAmount), `Drop ${dropAmount} ${dropAmount > 1 ? plural.toLowerCase() : _id.toLowerCase()} ?`)}
                >Drop</button>
                <input
                    title={`How many ${plural} should be thrown away ?`}
                    className={styles.dropAmount}
                    type="number"
                    value={dropAmount}
                    min={1}
                    max={amount}
                    step={1}
                    onChange={e => {
                        const newAmount = parseInt(e.target.value)
                        if (newAmount < 1) setDropAmount(1)
                        else if(newAmount > amount) setDropAmount(amount)
                        else setDropAmount(newAmount)
                    }}
                 />
            </li>
            <li>
                <button
                    className={`btn btn-cancel`} 
                    title={`Remove every ${_id.toLowerCase()} from the inventory`}
                    onClick={() => handleConfirm(() => deleteEntry(_id), `Drop every ${_id.toLowerCase()} ?`)}
                >
                    Drop all
                </button>
            </li>
        </ul>
        {modal && modal}
    </aside>
}

export const Inventory: React.FC<Props> = ({
    entries = [],
    maxEntries,
    setCurrentSection
}) => {
    const [currentEntryNum, setCurrentEntryNum] = useState<number|ReactNode>(null)
    const remainingEntries = useMemo((): number => maxEntries - entries.length, [entries, maxEntries])
    const entriesJSX = useMemo((): (ReactNode[]) => {
        return entries.map((entry: InventoryEntry, index: number) => {
            const isSelected: boolean = currentEntryNum === index
            return <Entry
                key={entry.item._id}
                entry={entry}
                handleSelect={() => !isSelected ? setCurrentEntryNum(index) : setCurrentEntryNum(null)}
                isSelected={isSelected}
             />
        })
    }, [entries, currentEntryNum])

    const remainingEntriesJSX = useMemo((): (ReactNode[] | ReactNode | null) => {
        if (typeof remainingEntries !== 'number' || remainingEntries <= 0) return null
        let remaining = []
        for (let i = 0; i < remainingEntries; i++) {
            remaining.push(
                <li key={i} className={`${styles.entry} ${styles.empty}`}></li>
            )
        }
        return remaining
    }, [remainingEntries])

    const detailsJSX = useMemo((): (ReactNode | null) => {
        // Inventory is empty
        if (!entries || entries.length <= 0) {
            return <aside className={`${styles.details} ${styles.msg}`}>
                <h3>Your inventory is empty ...</h3>
                <p>Lost all your <em>baits</em> ?</p>
                <p>
                    You can buy new ones at the&nbsp;
                    <span className={styles.link} onClick={() => setCurrentSection(SectionID.SHOPPING)}>fishing shop</span>
                    ; otherwise, you might as well look after something edible for fish consumption somewhere on the shore.
                </p>
            </aside>
        }

        // No item selected
        if (currentEntryNum === null) {
            return <aside className={`${styles.details} ${styles.msg}`}>
                <h3>Select an item</h3>
            </aside>
        }

        // Display message
        if (typeof currentEntryNum !== 'number') {
            return <aside className={`${styles.details} ${styles.msg}`}>
                {currentEntryNum}
            </aside>
        }
        
        // Item selected: display its details
        const currentEntry = entries[currentEntryNum]
        if (!currentEntry) return null
        return <Details entry={currentEntry} setCurrentEntryNum={setCurrentEntryNum} />
    }, [entries, currentEntryNum])

    return <div className={styles.inventory}>
        <main className={styles.entries}>
            <ul className={styles.entriesList}>
                {entriesJSX}
                {remainingEntriesJSX}
            </ul>
        </main>
        {detailsJSX}
    </div>
}

// Connect to Redux
const mapStateToProps = state => ({
    entries: inventoryEntriesSelector(state),
    maxEntries: maxEntriesSelector(state)
})
const mapDispatchToProps = dispatch => ({})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Inventory)