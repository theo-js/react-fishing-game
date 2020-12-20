import React, { Dispatch, SetStateAction, useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { gameProcesses } from '../../index'
import { Coordinates } from '../../../../interfaces/position'
import { FishRodLevel } from '../../../../interfaces/gameProgress'
import { getVectorLength, getNextCoordinatesOfPath } from '../../../../utils/position.ts'
import throttle from '../../../../utils/throttle.ts'
import styles from './index.module.sass'

// Audio
import whooshSE from '../../../../audio/se/whip.wav'
import baitDropSE from '../../../../audio/se/bait-drop.wav'

interface Props {
    setProcess: Dispatch<SetStateAction<string>>,
    rodAngle: number,
    setRodAngle: Dispatch<SetStateAction<number>>,
    rodOffset: Coordinates,
    setRodOffset: Dispatch<SetStateAction<Coordinates>>,
    baitOffset: Coordinates,
    baitDistance: number,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    baitRef: React.Ref<HTMLDivElement>,
    setBaitType: Dispatch<SetStateAction<string>>,
    playerCoordinates: Coordinates,
    rodLevel: FishRodLevel
}

const maxAngle: number = 70
const minAngle: number = -70

export default (({
    setProcess,
    rodAngle,
    setRodAngle,
    rodOffset,
    setRodOffset,
    baitOffset,
    baitDistance,
    setBaitOffset,
    baitRef,
    setBaitType,
    playerCoordinates,
    rodLevel
 }) => {
    // State
    const [gaugeValue, setGaugeValue] = useState<number>(0)
    const [isPreparingThrow, setIsPreparingThrow] = useState<boolean>(false)
    const [isThrowing, setIsThrowing] = useState<boolean>(false)
    const [spaceFired, setSpaceFired] = useState<boolean>(false)

    // Refs
    const gaugeValueRef = useRef<number>(0)
    const requestRef = useRef<any>(null)
    const stepRef = useRef<number>(0)
    const remainingDistanceRef = useRef<number>(0)
    const whooshSERef = useRef<HTMLAudioElement>(new Audio())
    whooshSERef.current.src = whooshSE
    const baitDropSERef = useRef<HTMLAudioElement>(new Audio())
    baitDropSERef.current.src = baitDropSE

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
    }, [])

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
            // Play whip SE
            whooshSERef.current.play()
            // Initial throw speed
            stepRef.current = remainingDistanceRef.current / 15 // stepRef.current is the distance travelled in px / frame

            function move (timestamp: number): void {
                if (remainingDistanceRef.current > 0) {
                    // Bait is still moving
                    const nextCoords = getNextCoordinatesOfPath(rodAngle, stepRef.current)
                    remainingDistanceRef.current = Math.floor(remainingDistanceRef.current - stepRef.current)

                    // Apply translation and scroll
                    setBaitOffset({ x: baitOffset.x - nextCoords.x, y: baitOffset.y + Math.abs(nextCoords.y) })
                    if (baitRef.current) baitRef.current.scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'center'
                    })

                    // Ease-out
                    stepRef.current *= .75

                    window.setTimeout(move, 50)
                } else {
                    // Bait has reached the correct distance
                    console.log('reached !')
                    setIsThrowing(false)
                    setBaitType('immersed')
                    remainingDistanceRef.current = 0
                    // Play bait drop SE
                    baitDropSERef.current.play()
                    // Wait for fish
                    setProcess(gameProcesses.WAIT_FISH)
                }
            }
            move()
        }
    }, [isThrowing, rodLevel, rodAngle, baitOffset])
    useEffect(() => console.log(baitOffset), [baitOffset])

    const confirmThrow = useCallback(
        (): void => {
            if (gaugeValueRef.current >= 5) {
                const reach = Math.round(gaugeValueRef.current)/100 * rodLevel.maxLength
                remainingDistanceRef.current = reach
                setIsThrowing(true)
                setBaitOffset({ x: 0, y: 0 })
            }
            setIsPreparingThrow(false)
            gaugeValueRef.current = 0
            setGaugeValue(0)
        }, [rodLevel]
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
                        setSpaceFired(false)
                        if (isPreparingThrow) {
                            confirmThrow()
                        }
                        break
                }
            }
        }
        function handleMouseDown (e: MouseEvent): void {
            if (!isThrowing) {
                setSpaceFired(true)
                if(!isPreparingThrow) {
                    setIsPreparingThrow(true)

                }
            }
        }
        function handleMouseUp (e: MouseEvent): void {
            setSpaceFired(false)
            if (isPreparingThrow) {
                confirmThrow()
            }
        }
    
        document.addEventListener('keydown', handleKeyDown, false)
        document.addEventListener('keyup', handleKeyUp, false)
        document.addEventListener('mousedown', handleMouseDown, false)
        document.addEventListener('mouseup', handleMouseUp, false)

        return (): void => {
            document.removeEventListener('keydown', handleKeyDown, false)
            document.removeEventListener('keyup', handleKeyUp, false)
            document.removeEventListener('mousedown', handleMouseDown, false)
            document.removeEventListener('mouseup', handleMouseUp, false)
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
            const centerX = playerCoordinates.x + playerCoordinates.width/2
            const centerY = playerCoordinates.y * 3/2
            const adjacent = getVectorLength({ from: { x: centerX, y: centerY }, to: { x: centerX, y: pageY } })
            const opposite = getVectorLength({ from: { x: centerX, y: pageY }, to: { x: offsetX, y: pageY } })
            // tan(rodAngle) = opposite/adjacent
            const angleRadians = Math.atan(opposite/adjacent)
            const angleDegrees = angleRadians*180/Math.PI
            if (!Number.isNaN(angleDegrees) && angleDegrees >= minAngle && angleDegrees <= maxAngle) {
                // Move rod as angle changes
                changeRodDirection(-angleDegrees)
            }
        }
        const handleMouseMoveThrottle = throttle(handleMouseMove)

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

    // Hide menu when player is throwing fishing line
    if (isThrowing) {
        return <nav className={`${styles.navigation} menu`}>
            <p className={styles.baitDistance}>{baitDistance}m</p>
        </nav>
    }

    return <nav className={`${styles.navigation} menu`}>
        <button
            className={`btn btn-cancel ${styles.cancelBTN}`}
            onClick={goBack}
        >
            Cancel
        </button>
        <input
            readOnly={true}
            tabIndex={-1}
            type="range"
            value={gaugeValue}
            min={0}
            max={100}
            step={1}
            className={styles.gauge}
         />
    </nav>
}) as React.FC<Props>