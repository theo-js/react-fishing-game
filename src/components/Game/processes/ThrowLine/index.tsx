import React, { Dispatch, SetStateAction, ReactNode, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import gameProcesses from '../index.json'
import ProgressCircle from '../../../ProgressCircle'
import { Coordinates, Path } from '../../../../interfaces/position'
import { FishRodLevel } from '../../../../interfaces/evolution'
import { getVectorLength, getNextCoordinatesOfPath } from '../../../../utils/position'
import throttle from '../../../../utils/throttle'
import { splashAnim } from '../../animations'
import styles from './index.module.sass'

// Redux
import { useDispatch } from 'react-redux'
import { emitBaitFallEventAction } from '../../../../store/actions/fishing'

interface Props {
    setProcess: Dispatch<SetStateAction<string>>,
    scrollToBait: (behavior?: 'smooth' | 'auto' | undefined) => void,
    scrollToPlayer: (behavior?: 'smooth' | 'auto' | undefined) => void,
    rodAngle: number,
    setRodAngle: Dispatch<SetStateAction<number>>,
    rodOffset: Coordinates,
    setRodOffset: Dispatch<SetStateAction<Coordinates>>,
    baitOffset: Coordinates,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    baitDistance: number,
    baitOffsetLimit: Path,
    baitLakeCoords: Coordinates,
    lakeRef: any,
    baitRef: any,
    setBaitType: Dispatch<SetStateAction<string>>,
    playerCoordinates: Coordinates,
    rodLevel: FishRodLevel,
    setIsBarometerVisible: Dispatch<SetStateAction<boolean>>,
    isBarometerVisible: boolean
}

const maxAngle: number = 70
const minAngle: number = -70

export default (({
    setProcess,
    scrollToBait,
    scrollToPlayer,
    rodAngle,
    setRodAngle,
    rodOffset,
    setRodOffset,
    baitOffset,
    setBaitOffset,
    baitDistance,
    baitOffsetLimit,
    baitRef,
    baitLakeCoords,
    lakeRef,
    setBaitType,
    playerCoordinates,
    rodLevel,
    isBarometerVisible,
    setIsBarometerVisible
 }) => {
     // Audio
    const baitDropSE = useMemo(() => require('../../../../assets/audio/se/bait-drop.mp3').default, [])
    const badassSE = useMemo(() => require('../../../../assets/audio/se/badass.mp3').default, [])

    // State
    const [gaugeValue, setGaugeValue] = useState<number>(0)
    const [spaceFired, setSpaceFired] = useState<boolean>(false)
    const [isPushing, setIsPushing] = useState<boolean>(false)
    const [isPreparingThrow, setIsPreparingThrow] = useState<boolean>(false)
    const [isThrowing, setIsThrowing] = useState<boolean>(false)
    const [hasThrown, setHasThrown] = useState<boolean>(false)

    // Redux
    const dispatch = useDispatch()
    const emitBaitFallEvent = useCallback(() => dispatch(emitBaitFallEventAction()), [])

    // Refs
    const lastTouchX = useRef<number>(null)
    const gaugeRef = useRef<any>(null)
    const gaugeValueRef = useRef<number>(0)
    const requestRef = useRef<any>(null)
    const directionRef = useRef<number>(rodAngle)
    const stepRef = useRef<number>(0)
    const remainingDistanceRef = useRef<number>(0)
    const baitDropSERef = useRef<HTMLAudioElement>(new Audio())
    baitDropSERef.current.src = baitDropSE
    const badassSERef = useRef<HTMLAudioElement>(new Audio())
    badassSERef.current.src = badassSE
    badassSERef.current.volume = .75

    // Go back to initial process
    const goBack = useCallback(
        (): void => {
            // Set fishing rod to initial position before
            setRodAngle(0)
            setRodOffset({ x: 0, y: -20 })
            setBaitOffset({ x: 0, y: -20, transition: '.2s ease all' })
            setBaitType('default')
            setProcess(gameProcesses.INITIAL)
        }, []
    )

    // Move fishing rod forward on process start
    useEffect(() => {
        setRodOffset({ x: 0, y: 0 })
        setBaitOffset({ x: 0, y: 0 })
        scrollToPlayer()
    }, [])

    // Hide barometer
    useEffect(() => isBarometerVisible && setIsBarometerVisible(false), [])

    // Move fishing rod direction
    const changeRodDirection = useCallback(
        (angle: number) => {
            if (!isThrowing) {
                setRodAngle(angle)
                setRodOffset({ x: -angle/4, y: -Math.abs(angle)/2 })
                setBaitOffset({x: -angle, y: -Math.abs(angle)/2 })
            }
        }, [isThrowing]
    )

    // Throw bait at the right distance and direction
    useEffect(() => {
        if (isThrowing) {
            // Display barometer
            setIsBarometerVisible(true)
            // Initial throw speed
            stepRef.current = remainingDistanceRef.current / 15 // stepRef.current is the distance travelled in px / frame

            const move = (): void => {
                if (remainingDistanceRef.current > 0) {
                    // Bait is still moving
                    // Get next coordinates
                    let nextCoords: Coordinates = getNextCoordinatesOfPath(directionRef.current, stepRef.current)
                    let nextOffset: Coordinates = { x: baitOffset.x - nextCoords.x, y: baitOffset.y + nextCoords.y }
                    remainingDistanceRef.current = Math.floor(remainingDistanceRef.current - stepRef.current)
                    /*
                        Detect collision against lake borders before it happens
                        and change direction in that case
                    */
                    if (nextOffset.x > baitOffsetLimit.to.x) {
                        // Handle right limit collision
                        // Deviate
                        directionRef.current *= -1
                        // Kinetic energy loss
                        remainingDistanceRef.current = remainingDistanceRef.current - stepRef.current
                    } else if (nextOffset.y > baitOffsetLimit.to.y) {
                        // Handle bottom limit collision
                        directionRef.current = directionRef.current - 270
                        remainingDistanceRef.current = remainingDistanceRef.current - stepRef.current
                    } else if (nextOffset.x < baitOffsetLimit.from.x) {
                        // Handle left limit collision
                        directionRef.current *= -1
                        remainingDistanceRef.current = remainingDistanceRef.current - stepRef.current
                    /*} else if (nextOffset.y < baitOffsetLimit.from.y) {
                        // Handle top limit collision
                        directionRef.current = directionRef.current - 270
                        remainingDistanceRef.current = remainingDistanceRef.current - stepRef.current
                    */
                    }

                    // Apply translation and scroll
                    setBaitOffset(nextOffset)
                    scrollToBait()

                    // Ease-out
                    stepRef.current *= .999 // Deceleration coeff
                    throttle(move, 100)
                } else {
                    // Bait has reached the correct distance
                    emitBaitFallEvent()
                    setIsThrowing(false)
                    setBaitType('immersed')
                    // Play bait drop sound effect
                    const baitDropSEPromise = baitDropSERef.current.play()
                    if (typeof baitDropSEPromise !== 'undefined') {
                        baitDropSEPromise
                        .then(() => null)
                        .catch(err => console.log(err))
                    }
                    // Play "badass"" sound effect if throw was particularly high
                    if (gaugeValueRef.current >= 90) {
                        window.setTimeout(() => {
                            const badassSEPromise = badassSERef.current.play()
                            if (typeof badassSEPromise !== 'undefined') {
                                badassSEPromise
                                .then(() => null)
                                .catch(() => console.log('Failed to play "badass" sound effect'))
                            }
                        }, 1000)
                    }
                    // Play splash animation on bait
                    baitRef.current && splashAnim(baitLakeCoords, lakeRef.current)
                    // Wait for fish
                    gaugeValueRef.current = 0
                    setProcess(gameProcesses.WAIT_FISH)
                    return
                }
            }
            throttle(move, 100)()
        }
    }, [isThrowing, hasThrown, rodLevel, baitOffset, baitOffsetLimit, baitLakeCoords])

    const confirmThrow = useCallback(
        (): void => {
            if (gaugeValueRef.current >= 5) {
                const reach = Math.round(gaugeValueRef.current)/100 * rodLevel.maxLength
                remainingDistanceRef.current = reach
                setIsThrowing(true)
                setBaitOffset({ x: 0, y: 0 })
                // Initial direction
                directionRef.current = rodAngle
            }
            setIsPreparingThrow(false)
            setGaugeValue(0)
        }, [rodLevel, rodAngle]
    )

    // Attach event listeners
    useEffect(() => {
        function handleKeyDown (e: KeyboardEvent): void {
            const { keyCode } = e
            switch (keyCode) {
                case 8: // Backspace
                case 46: // Delete
                case 48: // 0
                    e.preventDefault()
                    if (!isThrowing) {
                        goBack()
                    }
                    break
                case 37: // Left
                    e.preventDefault()
                    if (!isThrowing) {
                        // Increase fishrod angle
                        const addOffset = 4
                        if (rodAngle < maxAngle) {
                            let newAngle = 0
                            if (rodAngle + addOffset >= maxAngle) newAngle = maxAngle
                            else newAngle = rodAngle + addOffset
                            changeRodDirection(newAngle)
                        }
                    }
                    break
                case 38: // Top
                    e.preventDefault()
                    break
                case 39: // Right
                    e.preventDefault()
                    if (!isThrowing) {
                        // Decrease fishrod angle
                        const subOffset = 4
                        if (rodAngle > minAngle) {
                            let newAngle = 0
                            if (rodAngle - subOffset <= minAngle) newAngle = minAngle
                            else newAngle = rodAngle - subOffset
                            changeRodDirection(newAngle)
                        }
                    }
                    break
                case 40: // Bottom
                    e.preventDefault()
                    break
                case 32: // Space
                case 13: // Enter
                    e.preventDefault()
                    if (!isThrowing) {
                        if (!spaceFired) { // Prevent mousedown event from firing multiple times
                            setSpaceFired(true)
                            if(!isPreparingThrow) {
                                setIsPreparingThrow(true)
                            }
                        }
                    }
                    break
            }
        }
        function handleKeyUp (e: KeyboardEvent): void {
            if (!isThrowing) {
                const { keyCode } = e
                switch (keyCode) {
                    case 32:
                    case 13:
                        setSpaceFired(false)
                        if (isPreparingThrow) {
                            confirmThrow()
                        }
                        break
                }
            }
        }
        function handleMouseDown (e: Event): void {
            if (!isThrowing) {
                setSpaceFired(true)
                if(!isPreparingThrow) {
                    setIsPreparingThrow(true)

                }
            }
        }
        function handleMouseUp (e: Event): void {
            setSpaceFired(false)
            if (isPreparingThrow) {
                confirmThrow()
            }
        }
        function handleTouchMove (e: TouchEvent) {
            const currentTouchX = e.touches[0].clientX
            if (lastTouchX.current !== null && !isThrowing) {
                e.stopPropagation()
                if (currentTouchX > lastTouchX.current) {
                    // Swap right
                    // Decrease fishrod angle
                    const subOffset: number = 8
                    if (rodAngle > minAngle) {
                        let newAngle: number = 0
                        if (rodAngle - subOffset <= minAngle) newAngle = minAngle
                        else newAngle = rodAngle - subOffset
                        changeRodDirection(newAngle)
                    }
                } else if (currentTouchX < lastTouchX.current) {
                    // Swap left
                    // Increase fishrod angle
                    const addOffset: number = 6
                    if (rodAngle < maxAngle) {
                        let newAngle: number = 0
                        if (rodAngle + addOffset >= maxAngle) newAngle = maxAngle
                        else newAngle = rodAngle + addOffset
                        changeRodDirection(newAngle)
                    }
                }
            }
            lastTouchX.current = currentTouchX
        }
        const handleTouchMoveThrottle = throttle(handleTouchMove, 50)
    
        document.addEventListener('keydown', handleKeyDown, false)
        document.addEventListener('keyup', handleKeyUp, false)
        document.addEventListener('mousedown', handleMouseDown, false)
        document.addEventListener('mouseup', handleMouseUp, false)
        // Touch events
        document.addEventListener('touchmove', handleTouchMoveThrottle, false)
        if (gaugeRef.current) {
            gaugeRef.current.addEventListener('touchstart', (e: TouchEvent) => {setIsPushing(true); handleMouseDown(e)}, false)
            gaugeRef.current.addEventListener('touchmove', (e: TouchEvent) => {e.stopPropagation(); e.preventDefault()}, false)
            gaugeRef.current.addEventListener('touchend', (e: TouchEvent) => {setIsPushing(false); handleMouseUp(e)}, false)
        }

        return (): void => {
            document.removeEventListener('keydown', handleKeyDown, false)
            document.removeEventListener('keyup', handleKeyUp, false)
            document.removeEventListener('mousedown', handleMouseDown, false)
            document.removeEventListener('mouseup', handleMouseUp, false)
            document.removeEventListener('touchmove', handleTouchMoveThrottle, false)
            if (gaugeRef.current) {
                gaugeRef.current.removeEventListener('touchstart', (e: TouchEvent) => {setIsPushing(true); handleMouseDown(e)}, false)
                gaugeRef.current.removeEventListener('touchmove', (e: TouchEvent) => {e.stopPropagation(); e.preventDefault()}, false)
                gaugeRef.current.removeEventListener('touchend', (e: TouchEvent) => {setIsPushing(false); handleMouseUp(e)}, false)
            }
        }
    }, [
        isPreparingThrow,
        spaceFired,
        rodAngle,
        rodOffset,
        confirmThrow,
        isThrowing
    ])

    // Add mousemove event
    useEffect(() => {
        function handleMouseMove (e: MouseEvent): void {
            // Follow mouse
            const { offsetX, pageY } = e
            const centerX: number = playerCoordinates.x + playerCoordinates.width/2
            const centerY: number = playerCoordinates.y * 3/2
            const adjacent: number = getVectorLength({ from: { x: centerX, y: centerY }, to: { x: centerX, y: pageY } })
            const opposite: number = offsetX - centerX
            // tan(rodAngle) = opposite/adjacent
            const angleRadians: number = Math.atan(opposite/adjacent)
            const angleDegrees: number = angleRadians*180/Math.PI
            if (!Number.isNaN(angleDegrees) && angleDegrees >= minAngle && angleDegrees <= maxAngle) {
                // Move rod as angle changes
                changeRodDirection(-angleDegrees)
            }
        }
        const handleMouseMoveThrottle = throttle(handleMouseMove, 50)

        // Disable mousemove event once bait has been thrown
        if (isThrowing) {
            window.removeEventListener('mousemove', handleMouseMoveThrottle, false)
        } else {
            window.addEventListener('mousemove', handleMouseMoveThrottle, false)
        }
        
        return () => window.removeEventListener('mousemove', handleMouseMoveThrottle, false)
    }, [playerCoordinates, changeRodDirection, isThrowing])

    // Prepare throw
    useEffect(() => {
        function prepare (timestamp: number): void {
            if (isPreparingThrow) {
                if (gaugeValueRef.current < 100) {
                    let nextValue = gaugeValueRef.current + gaugeValueRef.current/20 + .5
                    if (nextValue > 100) nextValue = 100
                    gaugeValueRef.current = nextValue //= Math.min(timestamp, gaugeValueRef.current + 1)
                    setGaugeValue(gaugeValueRef.current)
                    requestRef.current = requestAnimationFrame(prepare)
                } else {
                    // Value has reached max: set down to zero and cancel throw
                    gaugeValueRef.current = 0
                    setGaugeValue(0)  
                    setIsPreparingThrow(false)
                }
            }
        }
        if (isPreparingThrow) {
            // Prepare throw
            requestRef.current = requestAnimationFrame(prepare)
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
                requestRef.current = null
            }
        }

        return () => cancelAnimationFrame(requestRef.current)
    }, [isPreparingThrow, confirmThrow])

    const gaugeMessage = useMemo((): ReactNode => {
        if (!gaugeValueRef) return null
        if (gaugeValueRef.current === null || gaugeValueRef.current < 5) return <span className={`${styles.gaugeMSG} ${styles.pushHere}`}>Push</span>
        if (gaugeValueRef.current >= 5 && gaugeValueRef.current < 50) return <span className={styles.gaugeMSG}>Hold</span>
        if (gaugeValueRef.current >= 50 && gaugeValueRef.current < 80) return <span className={`${styles.gaugeMSG} ${styles.high}`}>Release</span>
        if (gaugeValueRef.current >= 80) return <span className={`${styles.gaugeMSG} ${styles.optimal}`}>Now</span>
    }, [gaugeValueRef.current])

    // Hide menu when player is throwing fishing line
    if (isThrowing) return null

    return <nav className={`${styles.navigation} menu`}>
        <button
            className={`btn btn-cancel ${styles.cancelBTN}`}
            onClick={goBack}
        >
            Cancel
        </button>
        <div className={`${styles.gauge} ${isPushing && isPreparingThrow ? styles.userPush : ''}`} ref={gaugeRef}>
            <ProgressCircle
                value={gaugeValue}
                trackClass={styles.track}
                centerClass={styles.center}
            >
                {gaugeMessage}
            </ProgressCircle>
        </div>
    </nav>
}) as React.FC<Props>