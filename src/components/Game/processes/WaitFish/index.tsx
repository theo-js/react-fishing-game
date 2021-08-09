import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { LoadTutorial } from '../../tutorial/index'
import { GameProcess, GameProcessComponent, TutorialEntry } from '../../../../interfaces/game'
import { Coordinates } from '../../../../interfaces/position'
import throttle from '../../../../utils/throttle'
import useLazyAudio from '../../../../hooks/useLazyAudio'
import { BsArrowRepeat } from 'react-icons/bs'
import styles from './index.module.sass'

import { useDispatch, useSelector } from 'react-redux'
import { makeBaitAvailableAction } from '../../../../store/actions/fishing'
import { isBaitAvailableSelector } from '../../../../store/selectors/fishing'

interface Props {
    baitOffset: Coordinates,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    baitDistance: number,
    lineLength: number,
    setBaitType: Dispatch<SetStateAction<string>>,
    setProcess: Dispatch<SetStateAction<GameProcess>>,
    setRodAngle: Dispatch<SetStateAction<number>>,
    scrollToPlayer: (behavior?: 'smooth' | 'auto' | undefined) => void,
    scrollToBait: (behavior?: 'smooth' | 'auto' | undefined) => void,
    setIsBarometerVisible: Dispatch<SetStateAction<boolean>>,
    isBarometerVisible: boolean
}

const WaitFish: GameProcessComponent<Props> = ({
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
    const reelingSE = useLazyAudio({ src: 'se/reeling.mp3', volume: 1/16, loop: true })

    // Redux
    const dispatch = useDispatch()
    const makeBaitAvailable = useCallback(
        (bool: boolean) => dispatch(makeBaitAvailableAction(bool)), [dispatch]
    )
    const isBaitAvailable = useSelector(isBaitAvailableSelector)
    // Fishes can only detect/interact with the bait during this process
    useEffect(() => {
        makeBaitAvailable(true)
        return () => makeBaitAvailable(false)
    }, [])

    // State
    const [isReeling, setIsReeling] = useState<boolean>(false)
    const [isMouseDown, setIsMouseDown] = useState<boolean | null>(null)
    const [processFrozen, setProcessFrozen] = useState<boolean>(false)

    // Go back to previous process (retry throwing line)
    const goBack = useCallback(
        (): void => {
            if (processFrozen) return
            setBaitType('default')
            scrollToPlayer('smooth')
            setProcess(GameProcess.THROW_LINE)
        }, [scrollToPlayer, setProcess, setBaitType, processFrozen]
    )

    const reelIn = useCallback(
        ():void => {
            if (processFrozen) return
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
        }, [lineLength, isReeling, baitDistance, goBack, processFrozen]
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
            switch(e.key) {
                case 'Backspace':
                case 'Delete':
                case '0':
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
            switch(e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault()
                    reelIn()
                    break
            }
        }
        const handleSpaceThrottle = throttle(handleSpace, 1000)
        function handleSpaceUp (e: KeyboardEvent): void {
            switch (e.key) {
                case ' ':
                case 'Enter':
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
            if (processFrozen) return
            setIsMouseDown(true)
        }
        function handleMouseUp (e: MouseEvent) : void {
            if (processFrozen) return
            setIsMouseDown(false)
        }
        document.body.addEventListener('pointerdown', handleMouseDown, false)
        document.body.addEventListener('pointerup', handleMouseUp, false)

        return () => {
            document.body.removeEventListener('pointerdown', handleMouseDown, false)
            document.body.removeEventListener('pointerup', handleMouseUp, false)
        }
    }, [processFrozen])
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
            switch(e.key) {
                case 'ArrowLeft': // Left
                case 'ArrowUp': // Top
                case 'ArrowRight': // Right
                case 'ArrowDown': // Bottom
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
        <LoadTutorial
            entry={TutorialEntry.THROWN}
            onLoad={() => {
                // Freeze WaitFish scene during tutorial
                if (!processFrozen) setProcessFrozen(true)
                if (isReeling) setIsReeling(false)
                if (isMouseDown) setIsMouseDown(false)
                if (isBaitAvailable) makeBaitAvailable(false)
            }}
            afterComplete={() => {
                setProcessFrozen(false)
                makeBaitAvailable(true)
            }}
         />
    </nav>
}
WaitFish.GameProcess = GameProcess.WAIT_FISH

export default WaitFish