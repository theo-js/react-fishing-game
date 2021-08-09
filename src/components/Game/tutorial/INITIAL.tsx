import { useRef, Fragment } from 'react'
import Tutorial, { EntryProps } from './index'
import { TutorialEntry, TutorialEntryComponent} from '../../../interfaces/game'
import Modal from '../../misc/Modal'
import Slider from '../../misc/Slider'
import Wave from '../../misc/Spinners/Wave'
import { FaChevronLeft, FaChevronRight, FaCheck, FaFish } from 'react-icons/fa'

interface Props {
    afterComplete?: () => any
}

const Initial: TutorialEntryComponent<Props> = ({ afterComplete }) => {
    const modalRef = useRef<any>()

    return <Tutorial 
        afterComplete={afterComplete} 
        entry={TutorialEntry.INITIAL} 
        render={({
            onComplete, modalStyles
        }: EntryProps) => {
        return <Modal
            onClose={onComplete}
            isStatic
            blur="4px"
            transition={1}
            bgClassName={modalStyles.bg}
            className={modalStyles.modal}
            style={{ padding: '0 !important' }}
            ref={modalRef}
        >
            <Slider 
                useKeyboard 
                transition={.5} 
                lastPage={2}
                render={(page, setPage) => {
                return <>
                    {/* Page 0 */}
                    <div className={modalStyles.page} data-page={0}>
                        <header>
                            <h2 style={{ textAlign: 'center' }}>
                                Welcome to Go fishing !
                            </h2>
                        </header>
                        <main>
                            <p style={{ textAlign: 'center' }}>
                                Let's teach you how to fish !
                                <span className={modalStyles.animatedFish}>
                                    <FaFish className={modalStyles.fish} />
                                    <Wave
                                        className={modalStyles.wave} 
                                        size={2} color="var(--lightblue)"
                                        edgeBlur=".25em"
                                     />
                                </span>
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
                            <h3>1. Moving the player</h3>
                        </header>
                        <main>
                            <p>You should first choose a place to settle down.&nbsp;
                                {window.matchMedia('( max-device-width: 1000px )').matches ? (
                                    <>{/* Instructions for mobile device users */}
                                        <strong>Swipe your finger</strong> on the screen,&nbsp;
                                        or just <strong>touch a place on the shore</strong> to move your player.
                                    </>
                                ) : (
                                    <>{/* Not mobile */}
                                        Use the <strong>directional arrows</strong> of your keyboard,&nbsp;
                                        or just <strong>click somewhere on the shore</strong> to move your player.&nbsp;
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
                            <h3>2. Settling down</h3>
                        </header>
                        <main>
                            <p>Once your player is correctly positioned, use the <strong>enter/space</strong> key or <strong>click on&nbsp;
                            <span style={{ fontSize: '1rem', display: 'inline-flex' }} className="btn btn-primary">
                                Fish here ?<FaFish style={{ marginLeft: '.5em' }} />
                            </span>
                            </strong>&nbsp;to prepare your throw.</p>
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
                                OK<FaCheck style={{ marginLeft: '.5em' }} />
                            </button>
                        </footer>
                    </div>
                </>
            }} />
        </Modal>
    }} />
}
Initial.TutorialEntry = TutorialEntry.INITIAL

export default Initial