import React, { Dispatch, SetStateAction, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import styles from './index.module.sass'
import Initial from './processes/Initial'
import ThrowLine from './processes/ThrowLine'
import WaitFish from './processes/WaitFish'
import Battle from './processes/Battle'
import Barometer from './Barometer'
import AudioPlayer from './AudioPlayer'
import MainMenu from './MainMenu'
import GameNotification from './GameNotification'
import { randomIntFromInterval } from '../../utils/math'
import { Dimensions, Coordinates, Path, Map } from '../../interfaces/position'
import { GameProcess, GameNotif, GameNotifType } from '../../interfaces/game'
import { FishRodLevel } from '../../interfaces/evolution'
import { Item } from '../../interfaces/items'
import { GiFishingHook } from 'react-icons/all'
import { getVectorLength, pxToM } from '../../utils/position'
import useLazyAudio from '../../hooks/useLazyAudio'
import FishingAreas from './areas'

// Redux
import { connect, useSelector } from 'react-redux'
import { SPEND_ONE_MINUTE } from '../../store/actions/types'
import {
    isMainMenuOpenSelector,
    isBGMEnabledSelector,
    processSelector,
    rodLevelSelector
} from '../../store/selectors/game'
import { baitFoodSelector, lineTensionSelector } from '../../store/selectors/fishing'
import { gameNotificationSelector } from '../../store/selectors/game'
import { isPlayerOutOfBaitsSelector } from '../../store/selectors/inventory'
import {
    setGameProcessAction,
    setRodLevelAction,
    enableBGMAction,
    setGameNotificationAction
} from '../../store/actions/game'
import { updatePositionAction } from '../../store/actions/position'
import { addInventoryEntryAction } from '../../store/actions/inventory'

interface Props {
    process?: string,
    setProcess?: Dispatch<SetStateAction<GameProcess>>,
    spendOneMinute?: any,
    isBGMEnabled?: boolean,
    setIsBGMEnabled?: Dispatch<SetStateAction<boolean>>,
    isMainMenuOpen?: boolean,
    updateGlobalPositionState?: any,
    rodLevel?: FishRodLevel,
    isPlayerOutOfBaits?: boolean,
    addToInventory?: any,
    gameNotification?: GameNotif,
    setGameNotification?: Dispatch<SetStateAction<GameNotif>>
}

const Game: React.FC<Props> = ({
    process,
    setProcess,
    spendOneMinute,
    isBGMEnabled,
    setIsBGMEnabled,
    isMainMenuOpen,
    updateGlobalPositionState,
    rodLevel,
    isPlayerOutOfBaits,
    addToInventory,
    gameNotification,
    setGameNotification
}) => {
    // Audio
    const creekBE = useLazyAudio({
        src: 'be/creek.mp3',
        loop: true
    })
    const [audioEnabled, setAudioEnabled] = useState<boolean>(false)
    useEffect(() => {
        // Play game background effect as soon as audio is enabled
        if (audioEnabled) {
            try {
                creekBE.play()
            } catch (err) {
                console.log('Failed playing "creek" background effect')
            }
        } else creekBE.pause()
    }, [audioEnabled])
    // Enable audio
    useEffect(() => {
        // User must to interact with the page first to enable audio
        function handler (): void {
            setAudioEnabled(true)
        }
        if (!audioEnabled) {
            document.body.addEventListener('click', handler, false)
            document.body.addEventListener('touchstart', handler, false)
            document.body.addEventListener('keypress', handler, false)
        } else {
            document.body.removeEventListener('click', handler, false)
            document.body.removeEventListener('touchstart', handler, false)
            document.body.removeEventListener('keypress', handler, false)
        }
        return () => {
            document.body.removeEventListener('click', handler, false)
            document.body.removeEventListener('touchstart', handler, false)
            document.body.removeEventListener('keypress', handler, false)
        }
    }, [audioEnabled])

    // Background music
    const backgroundMusic = useLazyAudio({
        src: 'bgm/beach.mp3',
        preload: 'auto',
        volume: .25,
        onended: e => {
            // Loop start
            try {
                const audio = e.path[0]
                audio.pause()
                audio.currentTime = 4.5
                audio.play()
            } catch (err) {}
        }
    })

    useEffect(() => {
        if (audioEnabled) {
            // Play bg music as soon as audio is enabled (if not muted)
            if (isBGMEnabled) {
                try {
                    backgroundMusic.play()
                } catch (err) {
                    console.log('Failed to play background music')
                }
            }
            else backgroundMusic.pause()
        }
    }, [audioEnabled, isBGMEnabled])

    // Game time
    useEffect(() => {
        const intervalID = window.setInterval(spendOneMinute, 60000)
        return () => window.clearInterval(intervalID)
    }, [])

    // Refs
    const playerRef = useRef<HTMLDivElement>(null)
    const playerPositionRef = useRef<HTMLDivElement>(null)
    const shoreRef = useRef<HTMLDivElement>(null)
    const lakeRef = useRef<HTMLDivElement>(null)
    const baitRef = useRef<HTMLDivElement>(null)

    // State
    const [map, setMap] = useState<Map>({
        width: 4200,
        height: 3200,
        shorePath: { from: { x: 0, y: 0 }, to: { x: 4200, y: 200 }},
        lakePath: { from: { x: 0, y: 0 }, to: { x: 4200, y: 3000 }}
    })
    const [playerCoordinates, setPlayerCoordinates] = useState<Coordinates | undefined>({
        x: map.width / 2 - (50/*playerWidth*//2),
        y: map.shorePath.to.y / 2,
        width: 50
    })

    const rodDimensions = useMemo((): Dimensions => ({ height: 150, width: 10 }), [])
    const [rodOffset, setRodOffset] = useState<Coordinates>({ x: 0, y: -20 })
    const [rodAngle, setRodAngle] = useState<number>(0) 

    const [baitType, setBaitType] = useState('default')
    const baitCoordinates = useMemo((): Coordinates => ({
        x: playerCoordinates.x + playerCoordinates.width/2 + 1,
        y: playerCoordinates.y * 3/2 + rodDimensions.height + 14,
        width: 20,
        height: 30
    }), [playerCoordinates])
    const [baitOffset, setBaitOffset] = useState<Coordinates>({ x: 0, y: -20, transition: '.2 all ease' })
    // Line length in px
    const lineLength = useMemo(() => {
        return getVectorLength({ from: {x: 0, y: 0}, to: { x: baitOffset.x, y: baitOffset.y } })
    }, [baitOffset])
    // Display rounded line length in meters
    const baitDistance = useMemo(() => {
        return Math.round(pxToM(lineLength)*10)/10
    }, [lineLength])

    const baitOffsetLimit = useMemo(():Path => {
        return ({
            from: { // Min offset
                x: -baitCoordinates.x, // Lake left border
                y: 0 // Lake top border
            },
            to: { // Max offset
                x: map.width - baitCoordinates.x - baitCoordinates.width, // Lake right border
                y: map.lakePath.to.y - rodDimensions.height // Lake bottom border
            }
        })
    }, [map, baitCoordinates, playerCoordinates, rodDimensions])

    // Coordinates of bait relative to lake
    const baitLakeCoords = useMemo(
        (): Coordinates => {
            return ({
                x: baitCoordinates.x + baitOffset.x,
                y: baitCoordinates.y - map.shorePath.to.y + baitOffset.y
            })
        }, [baitOffset, baitCoordinates]
    )

    const lineOrigin = useMemo((): Coordinates => ({
        x: playerCoordinates.x + playerCoordinates.width/2 + rodOffset.x - (Math.sin(rodAngle*Math.PI/180) * rodDimensions.height / 2),
        y: playerCoordinates.y * 3/2 + rodDimensions.height + rodOffset.y - Math.abs((Math.sin(rodAngle*Math.PI/180/2) * rodDimensions.height / 2)),
    }), [playerCoordinates, rodDimensions, rodOffset, rodAngle])

    const lineEdge = useMemo((): Coordinates => ({
        x: lineOrigin.x + baitOffset.x - rodOffset.x + (Math.sin(rodAngle*Math.PI/180) * rodDimensions.height / 2),
        y: lineOrigin.y + baitOffset.y - rodOffset.y + (Math.abs(Math.sin(rodAngle*Math.PI/180/2) * rodDimensions.height / 2))
    }), [lineOrigin, baitOffset, rodOffset])

    const linePath = useMemo((): Path => ({
        from: lineOrigin,
        to: lineEdge
    }), [lineOrigin, lineEdge])

    const [isBarometerVisible, setIsBarometerVisible] = useState<boolean>(false)

    // Scroll functions
    const scrollToPlayer = useCallback(
        (behavior: 'smooth' | 'auto' | undefined = 'smooth'): void => {
            if (playerPositionRef.current) {
                playerPositionRef.current.scrollIntoView({
                    behavior,
                    block: 'start',
                    inline: 'center'
                })
            }
        }, []
    )
    const scrollToBait = useCallback(
        (behavior: 'smooth' | 'auto' | undefined = 'auto'): void => {
            if (baitRef.current) {
                baitRef.current.scrollIntoView({
                    behavior,
                    block: 'center',
                    inline: 'center'
                })
            }
        }, []
    )

    // Disable scroll on mobile devices
    useEffect(() => {
        const doc: any = document // Override type to use eventlistener 'passive' option
        doc.addEventListener('touchstart', e => e.preventDefault())
        doc.addEventListener('touchmove', e => e.preventDefault(), { passive: false })
        doc.addEventListener('touchforcechange', e => e.preventDefault(), { passive: false })
        return () => {
            doc.removeEventListener('touchstart', e => e.preventDefault())
            doc.removeEventListener('touchmove', e => e.preventDefault(), { passive: false })
            doc.removeEventListener('touchforcechange', e => e.preventDefault(), { passive: false })
        }
    }, [])
    // Disable default keyboard behaviour
    useEffect(() => {
        function preventDefault (e: any) {
            switch(e.keyCode) {
                case 32: // Space
                case 13: // Enter
                case 37: // Left
                case 38: // Top
                case 39: // Right
                case 40: // Bottom
                    e.preventDefault()
                    break
            }
        }
        window.addEventListener('keydown', preventDefault, false)
        return () => window.removeEventListener('keydown', preventDefault, false)
    }, [])

    // Update global state
    useEffect(() => {
        updateGlobalPositionState({
            baitLakeCoords
        })
    }, [baitLakeCoords])

    // Enable events depending on game scene
    const currentProcess = useMemo(() => {
        switch(process) {
            case GameProcess.INITIAL:
                return <Initial
                    setProcess={setProcess}
                    playerCoordinates={playerCoordinates}
                    setPlayerCoordinates={setPlayerCoordinates}
                    scrollToPlayer={scrollToPlayer}
                    shoreRef={shoreRef}
                    map={map}
                    isBarometerVisible={isBarometerVisible}
                    setIsBarometerVisible={setIsBarometerVisible}
                    setBaitOffset={setBaitOffset}
                    setRodAngle={setRodAngle}
                    setBaitType={setBaitType}
                 />
                break
            case GameProcess.THROW_LINE:
                return <ThrowLine
                    setProcess={setProcess}
                    scrollToBait={scrollToBait}
                    scrollToPlayer={scrollToPlayer}
                    rodAngle={rodAngle}
                    setRodAngle={setRodAngle}
                    playerCoordinates={playerCoordinates}
                    rodOffset={rodOffset}
                    setRodOffset={setRodOffset}
                    baitOffset={baitOffset}
                    setBaitOffset={setBaitOffset}
                    baitOffsetLimit={baitOffsetLimit}
                    baitLakeCoords={baitLakeCoords}
                    rodLevel={rodLevel}
                    baitRef={baitRef}
                    setBaitType={setBaitType}
                    lakeRef={lakeRef}
                    isBarometerVisible={isBarometerVisible}
                    setIsBarometerVisible={setIsBarometerVisible}
                 />
                break
            case GameProcess.WAIT_FISH:
                return <WaitFish
                    setProcess={setProcess}
                    scrollToPlayer={scrollToPlayer}
                    scrollToBait={scrollToBait}
                    baitOffset={baitOffset}
                    setBaitOffset={setBaitOffset}
                    baitDistance={baitDistance}
                    lineLength={lineLength}
                    setBaitType={setBaitType}
                    setRodAngle={setRodAngle}
                    isBarometerVisible={isBarometerVisible}
                    setIsBarometerVisible={setIsBarometerVisible}
                 />
                break
            case GameProcess.BATTLE:
                return <Battle
                    setProcess={setProcess}
                    scrollToPlayer={scrollToPlayer}
                    scrollToBait={scrollToBait}
                    baitOffset={baitOffset}
                    setBaitOffset={setBaitOffset}
                    baitOffsetLimit={baitOffsetLimit}
                    baitDistance={baitDistance}
                    lineLength={lineLength}
                    setBaitType={setBaitType}
                    setRodAngle={setRodAngle}
                    baitRef={baitRef}
                    isBarometerVisible={isBarometerVisible}
                    setIsBarometerVisible={setIsBarometerVisible}
                 />
            default: return null
        }
    }, [
        process,
        setProcess,
        playerCoordinates,
        rodAngle,
        rodOffset,
        baitOffset,
        baitLakeCoords,
        baitOffsetLimit,
        baitDistance,
        lineLength,
        rodLevel,
        setIsBarometerVisible,
        map
    ])
    
    // Spawn mushroom on the shore when inventory is empty
    const [mushroom, setMushroom] = useState<Coordinates>(null)
    useEffect(() => {
        let timerID = null
        if (isPlayerOutOfBaits) {
            // Spawn mushroom
            timerID = window.setTimeout(() => {
                setMushroom({
                    x: randomIntFromInterval(map.shorePath.from.x, map.shorePath.to.x),
                    y: randomIntFromInterval(map.shorePath.from.y, map.shorePath.to.y)
                })
            }, 5000)
        } else {
            // Clear interval
            window.clearTimeout(timerID)
        }
        return () => {
            window.clearTimeout(timerID)
        }
    }, [isPlayerOutOfBaits])
    
    return <div className={styles.game}>
        <div
            className={styles.shore}
            style={{
                width: `${map.width}px`,
                height: `${map.shorePath.to.y}px`
            }}
            ref={shoreRef}
        >
            <div
                className={styles.playerPosition}
                style={{
                    top: 0,
                    bottom: 0,
                    width: playerCoordinates.width,
                    left: playerCoordinates.x,
                }}
                ref={playerPositionRef}
            >
                <div className={styles.player} ref={playerRef}>

                </div>
                <div
                    className={`${styles.fishingRod} ${rodLevel.className}`}
                    style={{
                        left: `${playerCoordinates.width/2 - 10/2}px`,
                        top: `${playerCoordinates.y *3/2}px`,
                        height: `${rodDimensions.height}px`,
                        width: `${rodDimensions.width}px`,
                        transform: `translate(${rodOffset.x}px, ${rodOffset.y}px) rotate(${rodAngle}deg)`
                    }}
                >
                </div>
            </div>
        </div>

        <Line
            map={map}
            linePath={linePath}
        />

        <Bait
            ref={baitRef}
            type={baitType}
            baitCoordinates={baitCoordinates}
            baitOffset={baitOffset}
         />

        <div
            className={styles.lake}
            style={{
                width: `${map.width}px`,
                height: `${map.lakePath.to.y}px`
            }}
            ref={lakeRef}
        >
            {currentProcess}
            <FishingAreas />
        </div>

        {isBarometerVisible && <Barometer
            rodLevel={rodLevel}
            baitDistance={baitDistance}
         />}

        {isMainMenuOpen && <MainMenu />}
        <AudioPlayer bgm={backgroundMusic} />

        {mushroom && (
            <div
                className={styles.mushroom}
                onClick={() => {
                    // Add item
                    addToInventory('Mushroom', 1)
                    setMushroom(null)
                    
                    // Notify
                    setGameNotification({
                        type: GameNotifType.ITEM,
                        html: {
                            header: '<h3>New item</h3>',
                            body: '<p>Gained <strong style="color: var(--lightgreen)">1 Mushroom</strong></p>'
                        },
                        duration: 10
                    })
                }}
                style={{ left: mushroom.x, top: mushroom.y }}
            >
            </div>
        )}

        {gameNotification && <GameNotification />}
    </div>
}

// Bait component
interface BaitProps {
    type?: string,
    baitOffset: Coordinates,
    baitCoordinates: Coordinates
}
export const Bait = React.forwardRef<HTMLDivElement, BaitProps>(
    ({ type = 'default', baitOffset, baitCoordinates }, forwardedRef) => {
    // Redux
    const baitFood = useSelector(baitFoodSelector)

    // Set bait look
    const baitType = useMemo((): any => {
        switch (type) {
            case 'immersed':
                return <GiFishingHook className={styles.immersed} />
                break
            case 'default':
            default:
                return <GiFishingHook />
        }
    }, [type])

    return <div className={styles.bait}
        ref={forwardedRef}
        style={{
            left: baitCoordinates.x - baitCoordinates.width / 2,
            top: baitCoordinates.y - baitCoordinates.height / 2,
            width: baitCoordinates.width,
            height: baitCoordinates.height,
            transform: `translate(${baitOffset.x}px, ${baitOffset.y}px)`,
            transition: baitOffset.transition || 'none',
            opacity: baitFood ? 1 : 0
        }}
    >
        {baitType}
    </div>
})

// Line component
interface LineProps {
    map: Map,
    linePath: Path
}

export const Line: React.FC<LineProps> = ({ map, linePath }) => {
    // Redux
    const baitFood = useSelector<Item>(baitFoodSelector)
    const lineTension = useSelector(lineTensionSelector)

    // Change line color depending on its tension
    const lineColor = useMemo((): string => {
        if (lineTension > 0) {
            // Line tension ranges from 1 to 100 here
            const pctTo255 = lineTension*255/100
            // The tighter the redder
            return `rgb(255, ${255 - pctTo255}, ${255 - pctTo255})`
        }
        else if (lineTension === 0) return 'white'
        else {
            // Line tension ranges from -100 to -1 here
            const pctTo255 = Math.abs(lineTension*255/100)
            // The looser the bluer
            return `rgb(${255 - pctTo255}, ${255 - pctTo255}, 255)`
        }
    }, [lineTension])

    return <svg
        className={`
            ${styles.line} 
            ${lineTension >= 75 || lineTension <= -75 ? styles.danger : ''} 
            ${lineTension >= 90 || lineTension <= -90 ? styles.highDanger : ''}
        `}
        style={{
            width: map.width,
            height: map.shorePath.to.y + map.lakePath.to.y,
            opacity: baitFood ? 1 : 0
        }}
    >
        <line
            x1={linePath.from.x}
            y1={linePath.from.y}
            x2={linePath.to.x}
            y2={linePath.to.y}
            style={{ stroke: lineColor }}
            />
    </svg>
}

// Connect Game component to Redux
const mapStateToProps = state => ({
    process: processSelector(state),
    rodLevel: rodLevelSelector(state),
    isMainMenuOpen: isMainMenuOpenSelector(state),
    isBGMEnabled: isBGMEnabledSelector(state),
    isPlayerOutOfBaits: isPlayerOutOfBaitsSelector(state),
    gameNotification: gameNotificationSelector(state)
})
const mapDispatchToProps = dispatch => ({
    setProcess: (newProcess: GameProcess) => dispatch(setGameProcessAction(newProcess)),
    setRodLevel: (fishrodID: string) => dispatch(setRodLevelAction(fishrodID)),
    updateGlobalPositionState: (positionObject: any) => dispatch(updatePositionAction(positionObject)),
    spendOneMinute: () => dispatch({ type: SPEND_ONE_MINUTE }),
    setIsBGMEnabled: (isEnabled: boolean) => dispatch(enableBGMAction(isEnabled)),
    addToInventory: (itemID: string, amount: number) => dispatch(addInventoryEntryAction(itemID, amount)),
    setGameNotification: (notif: GameNotif) => dispatch(setGameNotificationAction(notif))
})
const GameConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(Game)

export default GameConnected