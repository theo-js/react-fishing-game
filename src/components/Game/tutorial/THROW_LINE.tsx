import { Fragment, useRef } from 'react'
import Tutorial, { EntryProps } from './index'
import { TutorialEntry, TutorialEntryComponent } from '../../../interfaces/game'
import Modal from '../../misc/Modal'
import Slider from '../../misc/Slider'
import { FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa'

interface Props {
    afterComplete?: any
}

const ThrowLine: TutorialEntryComponent<Props> = ({ afterComplete }) => {
    const modalRef = useRef<any>()
    const isMobileDevice = window.matchMedia('( max-device-width: 1000px )').matches

    return <Tutorial
        entry={TutorialEntry.THROW_LINE} 
        afterComplete={afterComplete}
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
                            <h3>3. Setting direction</h3>
                        </header>
                        <main>
                            <p>
                                {isMobileDevice ? (
                                    <>{/* Instructions for mobile device users */}
                                        To turn your fishing pole in the desired angle, <strong>swipe your finger around</strong> or simply <strong>touch the screen</strong>.
                                    </>
                                ) : (
                                    <>{/* Non mobile */}
                                        To turn your fishing pole in the desired angle, <strong>move your mouse around</strong> or use the <strong>directional arrows</strong> on your keyboard.
                                    </>
                                )}
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
                            <h3>4. Cancelling</h3>
                        </header>
                        <main>
                            <p>
                                If your player was positioned incorrectly, you can cancel this step and go back to the previous scene by
                                {isMobileDevice ? (
                                    <>{/* Instructions for mobile device users */}
                                        &nbsp;clicking on&nbsp;
                                        <span className="btn btn-cancel" style={{ display: 'inline-flex', fontSize: '.75rem' }}>
                                            Cancel
                                        </span>
                                    </>
                                ) : (
                                    <>{/* Not mobile */}
                                        &nbsp;using the <strong>backspace/0</strong> key,
                                        or by clicking on&nbsp;
                                        <span className="btn btn-cancel" style={{ display: 'inline-flex', fontSize: '.75rem' }}>
                                            Cancel
                                        </span>
                                    </>
                                )}
                            </p>
                            <p>Generally, this can be done in most situations for cancelling an action.</p>
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
                            <h3>5. Charging</h3>
                        </header>
                        <main>
                            <p>
                                Once your fishing pole has the angle you want, it is time to throw !&nbsp;
                                In order to achieve this, you need to give enough <strong>power</strong>:
                            </p>
                            {isMobileDevice ? (
                                <ul>
                                    <li>
                                        I. <strong>Push on the bottom right black disk and maintain</strong>&nbsp;
                                        to start charging. You will see the power gauge increase.
                                    </li>
                                    <li>
                                        II. <strong>Remove your finger</strong> at the right moment
                                        to give your throw the desired amount of power
                                    </li>
                                </ul>
                            ) : (
                                <ul>
                                    <li>
                                        I. <strong>Click anywhere/press down <em>ENTER</em> key</strong> and <strong>maintain</strong>&nbsp;
                                        to start charging. You will see the power gauge increase (on the bottom right of your screen).
                                    </li>
                                    <li>
                                        II. <strong>Release</strong> at the right moment&nbsp;
                                        to give your throw the desired amount of power
                                    </li>
                                </ul>
                            )}
                            <p>
                                <strong style={{ textDecoration: 'underline' }}>NB:</strong>&nbsp;
                                After max power has been reached, you will need to restart the charge.
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
                                OK<FaCheck style={{ marginLeft: '.5em' }} />
                            </button>
                        </footer>
                    </div>
                </>
            }} />
        </Modal>
    )} />
}
ThrowLine.TutorialEntry = TutorialEntry.THROW_LINE

export default ThrowLine