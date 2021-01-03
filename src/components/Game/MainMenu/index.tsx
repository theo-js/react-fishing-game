import React, { useEffect, useState, useMemo } from 'react'
import Inventory from './Inventory'
import Shop from './Shop'
import Credits from './Credits'
import styles from './index.module.sass'
import { CgInbox, BiStats, AiTwotoneShop, FaHandsHelping } from 'react-icons/all'

// Redux
import { connect } from 'react-redux'
import { closeMainMenuAction } from '../../../store/actions/game'
import { isMainMenuClosingSelector } from '../../../store/selectors/game'

interface Props {
    closeMenu?: () => void,
    isMenuClosing?: boolean
}

export enum SectionID {
    INVENTORY = 'INVENTORY',
    STATS = 'STATS',
    SHOPPING = 'SHOPPING',
    CREDITS = 'CREDITS'
}

export const MainMenu: React.FC<Props> = ({ closeMenu, isMenuClosing }) => {
    const [currentSection, setCurrentSection] = useState<SectionID>(SectionID.INVENTORY)

    // Keyboard events
    useEffect(() => {
        function handleKeyPress(e: KeyboardEvent): void {
            e.preventDefault()
            switch(e.keyCode) {
                case 8: // Backspace
                case 46: // Delete
                    closeMenu()
                    break
            }
        }

        document.addEventListener('keypress', handleKeyPress, false)
        return () => document.removeEventListener('keypress', handleKeyPress, false)
    }, [])

    const currentSectionJSX = useMemo(() => {
        switch(currentSection) {
            case SectionID.INVENTORY:
                return <Inventory setCurrentSection={setCurrentSection} />
                break
            case SectionID.STATS:
                return <p>Status</p>
                break
            case SectionID.CREDITS:
                return <Credits />
            default: return <Shop />
        }
    }, [currentSection])

    return (
        <div
            className={`${styles.mainMenu} ${isMenuClosing ? styles.closing : ''}`}
            onClick={closeMenu}
        >
            <main className={styles.menuContent} onClick={e => e.stopPropagation()}>
                {currentSectionJSX}
            </main>
            <nav className={styles.menuNavigation}>
                <ul>
                    <li
                        title="Inventory"
                        onClick={e => {e.stopPropagation(); setCurrentSection(SectionID.INVENTORY)}}
                        className={currentSection === SectionID.INVENTORY ? styles.active : ''}
                    >
                        <span className={styles.infoFacultative}>Inventory </span><CgInbox />
                    </li>
                    <li
                        title="Status"
                        onClick={e => {e.stopPropagation(); setCurrentSection(SectionID.STATS)}}
                        className={currentSection === SectionID.STATS ? styles.active : ''}
                    >
                        <span className={styles.infoFacultative}>Status </span><BiStats />
                    </li>
                    <li
                        title="Shopping"
                        onClick={e => {e.stopPropagation(); setCurrentSection(SectionID.SHOPPING)}}
                        className={currentSection === SectionID.SHOPPING ? styles.active : ''}
                    >
                        <span className={styles.infoFacultative}>Shopping </span><AiTwotoneShop />
                    </li>
                    <li
                        title="Credits"
                        onClick={e => {e.stopPropagation(); setCurrentSection(SectionID.CREDITS)}}
                        className={currentSection === SectionID.CREDITS ? styles.active : ''}
                    >
                        <span className={styles.infoFacultative}>Credits </span><FaHandsHelping />
                    </li>
                </ul>
            </nav>
        </div>
    )
}

// Connect to Redux
const mapStateToProps = state => ({
    isMenuClosing: isMainMenuClosingSelector(state)
})
const mapDispatchToProps = dispatch => ({
    closeMenu: () => dispatch(closeMainMenuAction())
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainMenu)