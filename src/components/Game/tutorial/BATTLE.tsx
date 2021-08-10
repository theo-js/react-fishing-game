import { Fragment, useRef, useMemo } from 'react'
import Tutorial, { EntryProps } from './index'
import { TutorialEntry, TutorialEntryComponent } from '../../../interfaces/game'
import Modal from '../../misc/Modal'
import Slider from '../../misc/Slider'
import { FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa'
// Redux
import { useSelector } from 'react-redux'
import { hookedFishSelector } from '../../../store/selectors/fishing'

interface Props {
    afterComplete?: () => any
}

const Battle: TutorialEntryComponent<Props> = ({ afterComplete }) => {
    const modalRef = useRef<any>()
    const isMobileDevice = window.matchMedia('( max-device-width: 1000px )').matches
    const hookedFish = useSelector(hookedFishSelector)
    const fishName = useMemo((): string => {
        let name
        try {
            name = hookedFish.fish._id.toLowerCase()
        } catch (e) {
            name = 'fish'
        }
        return name
    }, [hookedFish])

    return <Tutorial
        afterComplete={afterComplete}
        entry={TutorialEntry.BATTLE} 
        render={({ onComplete, modalStyles }: EntryProps) => (
        <Modal
            onClose={onComplete}
            isStatic
            transition={1}
            bgClassName={`${modalStyles.bg} ${modalStyles.transparent}`}
            className={modalStyles.modal}
            style={{ padding: '0 !important' }}
            ref={modalRef}
        >
            <Slider
                transition={.5} 
                useKeyboard
                lastPage={2}
                onEnd={() => modalRef.current && modalRef.current.closeModal()}
                render={(page, setPage) => {
                return <>
                    {/* Page 0 */}
                    <div className={modalStyles.page} data-page={0}>
                        <header>
                            <h2 style={{ textAlign: 'center', fontSize: window.matchMedia('( max-width: 407px )').matches ? '1.125rem' : '1.5rem' }}>
                                A {fishName} is hooked !
                            </h2>
                        </header>
                        <main>
                            <p  style={{ textAlign: 'center' }}>
                                We need to reel it back to the shore !
                            </p>
                        </main>
                        <footer style={{ textAlign: 'right' }}>
                            <button
                                className="btn btn-primary"
                                style={{ display: 'inline-flex' }}
                                onClick={() => setPage(1)}
                            >
                                Next<FaChevronRight style={{ marginLeft: '.25em' }} />
                            </button>
                        </footer>
                    </div>
                    {/* Page 1 */}
                    <div className={modalStyles.page} data-page={1}>
                        <header>
                            <h3>9. Line tension</h3>
                        </header>
                        <main>
                            <p>
                                Your fishing line may be resistant, but it is not indestructible.&nbsp;
                                As you try to force the fish in your direction, and as it struggles, the tension increases.
                            </p>
                            <p>
                                A gauge that indicates the current tension level is at the bottom of your screen.&nbsp;
                                If it's too high, <strong>your line will break</strong>.
                            </p>
                            <p>
                                <strong style={{ textDecoration: 'underline' }}>NB:</strong>&nbsp;
                                <strong>a too low tension level will result in the fish escaping</strong> as well.
                            </p>
                        </main>
                        <footer style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem 1rem' }}>
                            <button
                                className="btn btn-cancel"
                                onClick={() => setPage(0)}
                            >
                                <FaChevronLeft style={{ marginRight: '.25em' }} />Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setPage(2)}
                            >
                                Next<FaChevronRight style={{ marginLeft: '.25em' }} />
                            </button>
                        </footer>
                    </div>
                    {/* Page 3 */}
                    <div className={modalStyles.page} data-page={2}>
                        <header style={{ marginTop: 'auto' }}>
                            <h3 style={{ textAlign: 'center', color: 'var(--green)' }}>Good luck !</h3>
                        </header>
                        <main>
                            <p style={{ textAlign: 'center' }}>
                                Catch the&nbsp;
                                <strong style={{ color: 'var(--lightblue)' }}>
                                    {fishName}
                                </strong>
                                .
                            </p>
                        </main>
                        <footer style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem 1rem' }}>
                            <button
                                className="btn btn-cancel"
                                onClick={() => setPage(1)}
                            >
                                <FaChevronLeft style={{ marginRight: '.25em' }} />Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => modalRef.current && modalRef.current.closeModal()}
                            >
                                Let's do this<FaCheck style={{ marginLeft: '.5em' }} />
                            </button>
                        </footer>
                    </div>
                </>
            }} />
        </Modal>
    )} />
}
Battle.TutorialEntry = TutorialEntry.BATTLE

export default Battle