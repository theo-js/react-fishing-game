import { Fragment, useRef } from 'react'
import Tutorial, { EntryProps } from './index'
import { TutorialEntry, TutorialEntryComponent } from '../../../interfaces/game'
import Modal from '../../misc/Modal'
import Slider from '../../misc/Slider'
import { FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa'
import { BsArrowRepeat } from 'react-icons/bs'

interface Props {
    afterComplete?: () => any
}

const Thrown: TutorialEntryComponent<Props> = ({ afterComplete }) => {
    const modalRef = useRef<any>()
    const isMobileDevice = window.matchMedia('( max-device-width: 1000px )').matches

    return <Tutorial
        afterComplete={afterComplete}
        entry={TutorialEntry.THROWN} 
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
                lastPage={3}
                onEnd={() => modalRef.current && modalRef.current.closeModal()}
                render={(page, setPage) => {
                return <>
                    {/* Page 0 */}
                    <div className={modalStyles.page} data-page={0}>
                        <header>
                            <h2 style={{ textAlign: 'center', fontSize: window.matchMedia('( max-width: 407px )').matches ? '1.125rem' : '1.5rem' }}>
                                Congratulations !
                            </h2>
                        </header>
                        <main>
                            <p  style={{ textAlign: 'center' }}>
                                Your bait is now in the water;&nbsp;
                                let's wait for a fish to notice it !
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
                            <h3>6. Reeling</h3>
                        </header>
                        <main>
                            <p>
                                You can reel in the line by&nbsp;
                                {isMobileDevice ? (
                                    <>{/* Instructions for mobile device users */}
                                        <strong>resting your finger against the screen</strong>.&nbsp;
                                        To cancel and throw the line again immediately, click on&nbsp;
                                        <span className="btn btn-cancel" style={{ display: 'inline-flex', fontSize: '.875rem' }}>
                                            <BsArrowRepeat />
                                        </span>
                                    </>
                                ) : (
                                    <>{/* Not mobile */}
                                        <strong>clicking anywhere/pressing down <i>SPACE|ENTER</i></strong>, and <strong>maintaining</strong>.&nbsp;
                                        To cancel and throw the line again immediately, <strong>press <i>BACKSPACE|0|DELETE</i></strong>.
                                    </>
                                )}
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
                    {/* Page 2 */}
                    <div className={modalStyles.page} data-page={2}>
                        <header>
                            <h3>7. Approaching fishes</h3>
                        </header>
                        <main>
                            <p>
                                If you want a fish to notice your bait,&nbsp;
                                <strong>you need to be close enough</strong>.
                            </p>
                            <p>
                                Note that <strong>some fishes are only attracted to certain foods</strong>;&nbsp;
                                if a fish dislikes your bait, there's no chance you can catch it.
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
                                onClick={() => setPage(3)}
                            >
                                Next<FaChevronRight style={{ marginLeft: '.25em' }} />
                            </button>
                        </footer>
                    </div>
                    {/* Page 3 */}
                    <div className={modalStyles.page} data-page={3}>
                        <header>
                            <h3>8. Hooking</h3>
                        </header>
                        <main>
                            <p>
                                When a fish takes your bait,&nbsp;
                                {isMobileDevice ? (
                                    <strong>{/* Instructions for mobile device users */}
                                        touch the screen
                                    </strong>
                                ) : (
                                    <strong>{/* Not mobile */}
                                        click anywhere/press <i>SPACE|ENTER</i>
                                    </strong>
                                )}&nbsp;
                                when the fish turns <strong style={{ color: 'var(--lightgreen)' }}>green</strong> to hook it.
                            </p>
                            <p>Too early, the fish will get scared and leave. Too late and it will escape with your bait !</p>
                        </main>
                        <footer style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem 1rem' }}>
                            <button
                                className="btn btn-cancel"
                                onClick={() => setPage(2)}
                            >
                                <FaChevronLeft style={{ marginRight: '.25em' }} />Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => modalRef.current && modalRef.current.closeModal()}
                            >
                                OK<FaCheck style={{ marginLeft: '.5em' }} />
                            </button>
                        </footer>
                    </div>
                </>
            }} />
        </Modal>
    )} />
}
Thrown.TutorialEntry = TutorialEntry.THROWN

export default Thrown