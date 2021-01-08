import React, { Dispatch, SetStateAction } from 'react'
import { connect } from 'react-redux'
import { SectionID } from '../index'
import { GameStats } from '../../../../interfaces/evolution'
import { BiCoin } from 'react-icons/all'
import styles from './index.module.sass'

// Redux
import { gameStatsSelector } from '../../../../store/selectors/game'

interface Props {
    setCurrentSection: Dispatch<SetStateAction<SectionID>>,
    // Redux
    gameStats?: GameStats
}

const Status: React.FC<Props> = ({
    gameStats
}) => {
    console.log(gameStats)
    const { gameTimeSpent, fishrodLevel, doubloons } = gameStats

    return <article className={styles.status}>
        <section className={styles.general}>
            <h3>General</h3>
            <ul className={styles.gameStats}>
                <li>Fishrod:&nbsp;
                    <span className={styles.data}>
                        <strong>{fishrodLevel._id}</strong>
                    </span>
                </li>
                <li>
                    Doubloons:&nbsp;
                    <span className={styles.data}>
                        <strong>{doubloons}</strong>&nbsp;
                        <BiCoin color="var(--yellow)" style={{ verticalAlign: 'middle' }} />
                    </span>
                </li>
            </ul>
        </section>
    </article>
}

// Connect to Redux
const mapStateToProps = state => ({
    gameStats: gameStatsSelector(state)
})

export default connect(
    mapStateToProps,
    dispatch => ({})
)(Status)