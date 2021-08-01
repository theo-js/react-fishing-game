import React, { FC, useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react'
import gameProcesses from '../index.json'
import { Coordinates } from '../../../../interfaces/position'
import throttle from '../../../../utils/throttle'
import useLazyAudio from '../../../../hooks/useLazyAudio'
import { BsArrowRepeat } from 'react-icons/bs'
import styles from './index.module.sass'

import { useDispatch } from 'react-redux'
import { makeBaitAvailableAction } from '../../../../store/actions/fishing'

interface Props {
    baitOffset: Coordinates,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    baitDistance: number,
    lineLength: number,
    setBaitType: Dispatch<SetStateAction<string>>,
    setProcess: Dispatch<SetStateAction<string>>,
    setRodAngle: Dispatch<SetStateAction<number>>,
    scrollToPlayer: (behavior?: 'smooth' | 'auto' | undefined) => void,
    scrollToBait: (behavior?: 'smooth' | 'auto' | undefined) => void,
    setIsBarometerVisible: Dispatch<SetStateAction<boolean>>,
    isBarometerVisible: boolean
}

const WaitFish: FC<Props> = ({
    baitOffset,
    setBaitOffset,
    baitDistance,
    lineLength,
    setBaitType,
    setProcess,
    setRodAngle,
    scrollToPlayer,
    scrollToBait,
    isBarometerVisible,
    setIsBarometerVisible
}) => {
    // Audio
    const reelingSE = useLazyAudio({ src: 'se/reeling.mp3', loop: true })

    // Redux
    const dispatch = useDispatch()
    const makeBaitAvailable = useCallback(
        (bool: boolean) => dispatch(makeBaitAvailableAction(bool)), [dispatch]
    )
    // Fishes can only detect/interact with the bait during this process
    useEffect(() => {
        makeBaitAvailable(true)
        return () => makeBaitAvailable(false)
    }, [])

    // State
    const [isReeling, setIsReeling] = useState<boolean>(false)
    const [isMouseDown, setIsMouseDown] = useState<boolean | null>(null)

    // Go back to previous process (retry throwing line)
    const goBack = useCallback(
        (): void => {
            setBaitType('default')
            scrollToPlayer('smooth')
            setProcess(gameProcesses.THROW_LINE)
        }, [scrollToPlayer, setProcess, setBaitType]
    )

    const reelIn = useCallback(
        ():void => {
            if (baitDistance > 0) {
                // REEL IN
                !isReeling && setIsReeling(true)
                // Line length that we need to reel in during this execution
                const step: number = 4
                // Find out angle
                const angleRadians: number = Math.atan(baitOffset.x/baitOffset.y)
                const angleDegrees: number = angleRadians*180/Math.PI
                // Find out next offset coords from angle and hypotenuse
                const hypotenuse: number = lineLength - step
                const opposite: number = Math.sin(angleRadians) * hypotenuse
                const adjacent: number = Math.cos(angleRadians) * hypotenuse
                // Apply translation and lean fishrod towards target
                setBaitOffset({ x: opposite, y: adjacent })
                setRodAngle(-angleDegrees)
                // Scroll to new position
                scrollToBait()
            } else {
                // PLAYER HAS REELED ALL THE LINE IN
                setIsReeling(false)
                goBack()
            }
        }, [lineLength, isReeling, baitDistance, goBack]
    )

    // Show barometer if it's not visible
    useEffect(() => {
        if (!isBarometerVisible) {
            setIsBarometerVisible(true)
        }
    }, [])

    // Reeling effects
    useEffect(() => {
        if (isReeling) {
            // Play sound effect
            const reelingSEPromise = reelingSE.play()
            if (typeof reelingSEPromise !== 'undefined') {
                reelingSEPromise
                .then(() => null)
                .catch(() => console.log('Failed to play reeling SE'))
            }
        } else {
            // Stop sound effect if it's playing
            if (!reelingSE.paused) {
                reelingSE.pause()
                reelingSE.currentTime = 0
            }
        }

        return () => {
            if (!reelingSE.paused) reelingSE.pause()
        }
    }, [isReeling])

    // Attach event listeners
    // Cancel event
    useEffect(() => {
        function handleBackSpace (e: KeyboardEvent): void {
            switch(e.keyCode) {
                case 8: // Backspace
                case 46: // Delete
                case 48: // 0
                    e.preventDefault()
                    goBack()
                    break
            }
        }
        document.addEventListener('keydown', handleBackSpace, true)
        return () => document.removeEventListener('keydown', handleBackSpace, true)
    }, [goBack])
    // Space/Enter keys
    useEffect(() => {
        function handleSpace (e: KeyboardEvent): void {
            switch(e.keyCode) {
                case 32: // Space
                case 13: // Enter
                    e.preventDefault()
                    reelIn()
                    break
            }
        }
        const handleSpaceThrottle = throttle(handleSpace, 1000)
        function handleSpaceUp (e: KeyboardEvent): void {
            switch (e.keyCode) {
                case 32: // Space
                case 13: // Enter
                    // Stop reeling
                    setIsReeling(false)
                    break
            }
        } 
        
        document.addEventListener('keydown', handleSpaceThrottle, true)
        document.addEventListener('keyup', handleSpaceUp, false)
        return () => {
            document.removeEventListener('keydown', handleSpaceThrottle, true)
            document.removeEventListener('keyup', handleSpaceUp, false)
        }
    }, [reelIn])
    // Mousedown/up
    useEffect(() => {
        function handleMouseDown (e: MouseEvent): void {
            setIsMouseDown(true)
        }
        function handleMouseUp (e: MouseEvent) : void {
            setIsMouseDown(false)
        }
        document.body.addEventListener('mousedown', handleMouseDown, false)
        document.body.addEventListener('mouseup', handleMouseUp, false)
        document.body.addEventListener('touchstart', handleMouseDown, false)
        document.body.addEventListener('touchend', handleMouseUp, false)

        return () => {
            document.body.removeEventListener('mousedown', handleMouseDown, false)
            document.body.removeEventListener('mouseup', handleMouseUp, false)
            document.body.removeEventListener('touchstart', handleMouseDown, false)
            document.body.removeEventListener('touchend', handleMouseUp, false)
        }
    }, [])
    useEffect(() => {
        if (isMouseDown) {
            // Mouse down
            throttle(reelIn, 1000)()
        } else if (isMouseDown === false) {
            // Mouse up
            setIsReeling(false)
            // Reinitialize isMouseDown state
            setIsMouseDown(null)
        }
    }, [isMouseDown, reelIn])

    // Disable other keys
    useEffect(() => {
        function disableKeys (e: KeyboardEvent): void {
            switch(e.keyCode) {
                case 37: // Left
                case 38: // Top
                case 39: // Right
                case 40: // Bottom
                    e.preventDefault()
                    break
            }
        }
        document.addEventListener('keydown', disableKeys, false)
        return () => document.removeEventListener('keydown', disableKeys, false)
    }, [])

    return <nav className={styles.navigation}>
        <button
            className={`btn btn-cancel ${styles.repeatBTN}`}
            onClick={goBack}
        >
            <BsArrowRepeat />
        </button>
    </nav>
}

export default WaitFish