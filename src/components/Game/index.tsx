import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import styles from './index.module.sass'
import Initial from './processes/Initial'
import ThrowLine from './processes/ThrowLine'
import WaitFish from './processes/WaitFish'
import { Dimensions, Coordinates, Path, Map } from '../../interfaces/position'
import { FishRodLevel } from '../../interfaces/gameProgress'
import { GiFishingHook, GiFishingLure } from 'react-icons/all'
import { getVectorLength } from '../../utils/position'

interface Props {
    [key: string]: any
}

export const gameProcesses = {
    INITIAL: 'INITIAL',
    THROW_LINE: 'THROW_LINE',
    WAIT_FISH: 'WAIT_FISH'
}

const rodLevels: FishRodLevel[] = [
    {
        name: 'Default',
        className: styles.default,
        maxLength: 1500
    }
]

const Game: React.FC<Props> = props => {
    // Refs
    const playerRef = useRef<HTMLDivElement>(null)
    const playerPositionRef = useRef<HTMLDivElement>(null)
    const shoreRef = useRef<HTMLDivElement>(null)
    const lakeRef = useRef<HTMLDivElement>(null)
    const baitRef = useRef<HTMLDivElement>(null)
    const lineRef = useRef(null)

    // State
    const [process, setProcess] = useState(gameProcesses.INITIAL)
    const [map, setMap] = useState<Map>({
        width: 4200,
        shoreHeight: 200,
        lakeHeight: 3000
    })
    const [playerCoordinates, setPlayerCoordinates] = useState<Coordinates>({
        x: map.width / 2 - (50/*playerWidth*//2),
        y: map.shoreHeight / 2,
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
    const baitDistance = useMemo(() => {
        return Math.round(Math.abs(getVectorLength({ from: {x: 0, y: 0}, to: baitOffset })/10))
    }, [baitOffset])

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

    const [isBaitVisible, setIsBaitVisible] = useState<boolean>(true)
    const [rodLevelNum, setRodLevelNum] = useState<number>(0)
    const rodLevel = useMemo(() => rodLevels[rodLevelNum], [rodLevelNum])

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

    // Disable scroll on mobile devices
    useEffect(() => {
        function preventDefault (e: any) {
            e.preventDefault()
        }
        window.addEventListener('touchstart', preventDefault, false)
        return () => window.removeEventListener('touchstart', preventDefault, false)
    }, [])

    // Allow actions depending on game phase
    const currentProcess = useMemo(() => {
        switch(process) {
            case gameProcesses.INITIAL:
                return <Initial
                    setProcess={setProcess}
                    playerCoordinates={playerCoordinates}
                    setPlayerCoordinates={setPlayerCoordinates}
                    scrollToPlayer={scrollToPlayer}
                    shoreRef={shoreRef}
                    map={map}
                 />
                break
            case gameProcesses.THROW_LINE:
                return <ThrowLine
                    setProcess={setProcess}
                    rodAngle={rodAngle}
                    setRodAngle={setRodAngle}
                    playerCoordinates={playerCoordinates}
                    rodOffset={rodOffset}
                    setRodOffset={setRodOffset}
                    baitOffset={baitOffset}
                    setBaitOffset={setBaitOffset}
                    baitDistance={baitDistance}
                    rodLevel={rodLevel}
                    baitRef={baitRef}
                    setBaitType={setBaitType}
                 />
                break
            case gameProcesses.WAIT_FISH:
                return <WaitFish
                    setProcess={setProcess}
                    scrollToPlayer={scrollToPlayer}
                    baitOffset={baitOffset}
                    setBaitOffset={setBaitOffset}
                    baitDistance={baitDistance}
                    setBaitType={setBaitType}
                 />
                break
            default: return null
        }
    }, [
        process,
        setProcess,
        playerCoordinates,
        rodAngle,
        rodOffset,
        baitOffset,
        baitDistance,
        rodLevel,
        map
    ])
    
    return <div className={styles.game}>
        <div
            className={styles.shore}
            style={{
                width: `${map.width}px`,
                height: `${map.shoreHeight}px`
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
        <svg
            className={styles.line}
            ref={lineRef}
            style={{ width: map.width, height: map.shoreHeight + map.lakeHeight }}
        >
            <line
                x1={linePath.from.x}
                y1={linePath.from.y}
                x2={linePath.to.x}
                y2={linePath.to.y}
                 />
        </svg>
        <div className={styles.bait}
            ref={baitRef}
            style={{
                display: isBaitVisible ? 'block' : 'none',
                left: baitCoordinates.x - baitCoordinates.width / 2,
                top: baitCoordinates.y - baitCoordinates.height / 2,
                width: baitCoordinates.width,
                height: baitCoordinates.height,
                transform: `translate(${baitOffset.x}px, ${baitOffset.y}px)`,
                transition: baitOffset.transition || 'none'
            }}
        >
            <Bait type={baitType} />
        </div>
        <div
            className={styles.lake}
            style={{
                width: `${map.width}px`,
                height: `${map.lakeHeight}px`
            }}
            ref={lakeRef}
        >
            {currentProcess}
        </div>
    </div>
}

interface BaitProps {
    type: string
}
export const Bait: React.FC<BaitProps> = ({ type = 'default' }) => {
    let bait = null
    switch (type) {
        case 'immersed':
            bait = <GiFishingHook className={styles.immersed} />
            break
        case 'default':
        default:
            bait = <GiFishingHook />
    }
    return bait
}

export default Game