import React, { ReactElement, Dispatch, SetStateAction, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import { minsToHrsMins } from '../../../../utils/time'
import allCategories from '../../../items/categories.json'
import { SectionID } from '../index'
import { GameStats } from '../../../../interfaces/evolution'
import { Item, ItemCategory } from '../../../../interfaces/items'
import styles from './index.module.sass'
import { BiStats, BiCoin, GiFishingPole, GiFishing } from 'react-icons/all'
// Redux
import { gameStatsSelector } from '../../../../store/selectors/game'
import { baitFoodSelector } from '../../../../store/selectors/fishing'
import { removeBaitItemAction } from '../../../../store/actions/fishing'

interface Props {
    setCurrentSection: Dispatch<SetStateAction<SectionID>>,
    // Redux
    gameStats?: GameStats,
    baitFood?: Item,
    removeBait: any
}

enum StatusSectionID {
    GENERAL = 'GENERAL',
    GEAR = 'GEAR'
}

const Status: React.FC<Props> = ({
    setCurrentSection,
    gameStats,
    baitFood,
    removeBait
}) => {
    const { gameTimeSpent, fishrodLevel, doubloons } = gameStats
    const gameTimeSpentFormatted = useMemo((): string => minsToHrsMins(gameTimeSpent), [gameTimeSpent])
    const [currentStatusSectionID, setCurrentStatusSectionID] = useState<StatusSectionID>(StatusSectionID.GENERAL)

    // The category of item which current bait belongs to
    const baitCategory = useMemo((): ItemCategory => {
        if (baitFood) return allCategories[baitFood['category']]
        else return null
    }, [baitFood, allCategories])

    // The color used on the bait icon which depends on its item category
    const baitColor = useMemo((): string => {
        if (!baitCategory) return ''

        return baitCategory.colors[0]
    }, [baitCategory])

    const currentStatusSection = useMemo((): ReactElement => {
        switch (currentStatusSectionID) {
            case StatusSectionID.GENERAL:
                return <section className={styles.general}>
                    <h3>General</h3>
                    <ul className={styles.gameStats}>
                        <li>
                            Doubloons:&nbsp;
                            <span className={styles.data}>
                                <strong>{doubloons}</strong>&nbsp;
                                <BiCoin color="var(--yellow)" style={{ verticalAlign: 'middle' }} />
                            </span>
                        </li>
                        <li>Game time:&nbsp;
                            <span className={styles.data}>
                                <strong className={styles.time}>{gameTimeSpentFormatted}</strong>
                            </span>
                        </li>
                    </ul>
                </section>
                break
            case StatusSectionID.GEAR:
                return <section className={styles.general}>
                    <h3>Gear</h3>
                    <ul className={styles.gear}>
                        <li>Fishrod:&nbsp;
                            <span className={styles.data}>
                                <strong>{fishrodLevel._id}</strong>
                            </span>
                        </li>
                        <li>Bait:&nbsp;
                            {baitFood ? (
                                <span className={styles.data}>
                                    <span style={{ color: baitColor }} dangerouslySetInnerHTML={{ __html: baitFood.image }}></span>&nbsp;
                                    <strong>{baitFood._id}</strong>&nbsp;
                                    <button
                                        className={`btn btn-cancel ${styles.btn}`}
                                        onClick={removeBait}
                                    >Remove</button>
                                </span>
                            ) : (
                                <span className={styles.data}>
                                    <strong>None</strong>&nbsp;
                                    <button
                                        className={`btn btn-primary ${styles.btn}`}
                                        onClick={() => setCurrentSection(SectionID.INVENTORY)}
                                    >
                                        Add from inventory
                                    </button>
                                </span>
                            )}
                        </li>
                    </ul>
                </section>
                break
        }
    }, [
        currentStatusSectionID,
        fishrodLevel,
        baitFood,
        baitColor,
        removeBait,
        doubloons,
        gameTimeSpentFormatted
    ])

    return <article className={styles.status}>
        <nav className={styles.statusSectionNav}>
            <ul>
                <li
                    className={currentStatusSectionID === StatusSectionID.GENERAL ? styles.active : ''}
                    onClick={() => setCurrentStatusSectionID(StatusSectionID.GENERAL)}
                >
                    <BiStats />
                </li>
                <li
                    className={currentStatusSectionID === StatusSectionID.GEAR ? styles.active : ''}
                    onClick={() => setCurrentStatusSectionID(StatusSectionID.GEAR)}
                >
                    <GiFishingPole />
                </li>
            </ul>
        </nav>
        {currentStatusSection}
    </article>
}

// Connect to Redux
const mapStateToProps = state => ({
    gameStats: gameStatsSelector(state),
    baitFood: baitFoodSelector(state)
})
const mapDispatchToProps = dispatch => ({
    removeBait: () => dispatch(removeBaitItemAction())
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Status)