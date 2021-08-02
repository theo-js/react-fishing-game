import React, { useMemo, useEffect,useState } from 'react'
import { GameNotif, GameNotifType } from '../../../interfaces/game'
import useLazyAudio from '../../../hooks/useLazyAudio'
import { MdMoodBad, GiTrophyCup, GiTrophy, BsInfoCircleFill, FaPlus } from 'react-icons/all'
import styles from './index.module.sass'

// Redux
import { connect } from 'react-redux'
import { gameNotificationSelector } from '../../../store/selectors/game'
import { setGameNotificationAction } from '../../../store/actions/game'

interface Props {
    // Redux
    gameNotification: GameNotif,
    destroyNotification: () => void
}

const GameNotification: React.FC<Props> = ({
    // Redux
    gameNotification,
    destroyNotification
}) => {
    // Props
    const { html, type } = gameNotification
    const { header, body, footer } = html
    const duration = gameNotification.duration || 10
    const transition = gameNotification.transition || 1

    // State
    const [isClosing, setIsClosing] = useState<boolean>(false)

    // Audio
    // Decide which SE to load depending on notification type
    const SEPath = useMemo((): string => {
        switch(type) {
            case GameNotifType.INFO:
                return 'infobleep.mp3'
                break
            case GameNotifType.SUCCESS:
                return 'short-success.mp3'
                break
            case GameNotifType.GREAT_SUCCESS:
                return 'long-success.mp3'
                break
            case GameNotifType.ITEM:
                return 'got-item.mp3'
                break
            case GameNotifType.FAIL:
                return 'xylo.mp3'
                break
            default: return ''
        }
    }, [type])
    const soundEffect = useLazyAudio({ src: `se/${SEPath}` }, [SEPath])
    
    // Play audio after mount
    useEffect(() => {
        if (soundEffect) {
            const playPromise = soundEffect.play()
            if (typeof playPromise !== 'undefined') {
                playPromise
                    .then(() => null)
                    .catch(() => console.log(`Failed to play ${SEPath} sound effect`))
            }
        }
    }, [soundEffect])

    // Destroy notification after duration
    useEffect(() => {
        const transitionEndTimerID = setTimeout(() => setIsClosing(true), duration*1000 - transition*1000)
        const destroyTimerID = setTimeout(destroyNotification, duration*1000)
        return () => {
            window.clearTimeout(transitionEndTimerID)
            window.clearTimeout(destroyTimerID)
        }
    }, [duration])

    // Style notif depending on type
    const typeClass = useMemo((): string => {
        switch(type) {
            case GameNotifType.INFO:
                return styles.info
                break
            case GameNotifType.SUCCESS:
                return styles.success
                break
            case GameNotifType.GREAT_SUCCESS:
                return styles.greatSuccess
                break
            case GameNotifType.ITEM:
                return styles.item
                break
            case GameNotifType.FAIL:
                return styles.fail
                break
            default: return ''
        }
    }, [type])

    // Header icon depends on type too
    const typeIcon = useMemo((): any => {
        switch (type) {
            case GameNotifType.FAIL:
                return <MdMoodBad className={styles.notifIcon} />
                break
            case GameNotifType.INFO:
                return <BsInfoCircleFill className={styles.notifIcon} />
                break
            case GameNotifType.SUCCESS:
                return <GiTrophy className={styles.notifIcon} />
                break
            case GameNotifType.GREAT_SUCCESS:
                return <GiTrophyCup className={styles.notifIcon} />
                break
            case GameNotifType.ITEM:
                return <FaPlus className={styles.notifIcon} />
                break
            default: return null
        }
    }, [type])

    return <div
        className={`
            ${styles.gameNotif} 
            ${isClosing ? styles.closing : ''}
            ${typeClass}
        `}
        style={{ transitionDuration: transition + 's' }}
    >
        {header && (
            <header
                className={styles.notifHeader}
                style={{ animationDuration: transition + 's' }}
            >
                <div
                    className={styles.headerContent}
                    dangerouslySetInnerHTML={{ __html: header }}
                >
                </div>
                {typeIcon}
            </header>
        )}
        {body && (
            <main
                className={styles.notifBody}
                dangerouslySetInnerHTML={{ __html: body }}
                style={{
                    // Slide left then fade in
                    animationDelay: transition + 's, ' + transition*2 + 's',
                    animationDuration: transition + 's, ' + transition + 's',
                    borderRadius: footer ? '0' : '0 0 5px 5px',
                    transition: transition + 's'
                }}
            ></main>
        )}
        {footer && (
            <footer
                className={styles.notifFooter}
                dangerouslySetInnerHTML={{ __html: footer }}
                style={{
                    // Slide left then fade in
                    animationDelay: transition + 's, ' + transition*2 + 's',
                    animationDuration: transition + 's, ' + transition + 's',
                    borderRadius: '0 0 5px 5px',
                    transition: transition + 's'
                }}
            ></footer>
        )}
    </div>
}

// Connect to Redux
const mapStateToProps = state => ({
    gameNotification: gameNotificationSelector(state)
})
const mapDispatchToProps = dispatch => ({
    destroyNotification: () => dispatch(setGameNotificationAction(null))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GameNotification)