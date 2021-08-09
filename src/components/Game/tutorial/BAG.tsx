import { useEffect, useRef } from 'react'
import Tutorial, { EntryProps } from './index'
import Modal from '../../misc/Modal'
import { TutorialEntry, TutorialEntryComponent } from '../../../interfaces/game'
// Redux
import { useDispatch } from 'react-redux'
import { openMainMenuAction } from '../../../store/actions/game'

interface Props {
    [index: string]: any
}

const Bag: TutorialEntryComponent<Props> = () => {
    // Open main menu (and mark as completed) on click
    const dispatch = useDispatch()
    const handleClick = () => {
        dispatch(openMainMenuAction())
    }

    return <Tutorial
        entry={TutorialEntry.BAG} 
        render={({ modalStyles }: EntryProps) => {
            // Should be marked as completed on the 1st time player opens main menu

            return <Modal
                onClose={() => false}
                onWindowClick={handleClick}
                wrapper={false}
                transition={1}
                className={`
                    ${modalStyles.modal} 
                    ${modalStyles.bag} 
                    ${modalStyles.tooltip}
                `}
            >
                <header>
                    <h4>Bag</h4>
                </header>
                <main>
                    <p style={{ margin: '0' }}>
                        You can open your bag to use, purchase or sell items
                    </p>
                </main>
            </Modal>
    }} />
}
Bag.TutorialEntry = TutorialEntry.BAG

export default Bag