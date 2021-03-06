import React, { Dispatch, SetStateAction, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import gameProcesses from '../index.json'
import { FishData, UniqueFish } from '../../../../interfaces/fishes'
import { FishRodLevel } from '../../../../interfaces/evolution'
import { Coordinates } from '../../../../interfaces/position'
import { probability } from '../../../../utils/math'
import { BsArrowRepeat } from 'react-icons/bs'
import styles from './index.module.sass'

// Redux
import { connect } from 'react-redux'
import {
    hookedFishSelector,
    lineTensionSelector,
    isPullingSelector
} from '../../../../store/selectors/fishing'
import { rodLevelSelector } from '../../../../store/selectors/game'
import {
    setHookedFishAction,
    setLineTensionAction,
    incrementLineTensionAction,
    decrementLineTensionAction,
    setIsPullingAction,
    catchNewFishAction
} from '../../../../store/actions/fishing'
import { setGameProcessAction } from '../../../../store/actions/game'

interface Props {
    baitDistance: number,
    baitOffset: Coordinates,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    lineLength: number,
    scrollToBait: () => void,
    setRodAngle: Dispatch<SetStateAction<number>>,
    // Redux
    hookedFish?: FishData,
    setHookedFish?: Dispatch<SetStateAction<FishData>>,
    lineTension?: number,
    isFishPulling?: boolean,
    setLineTension?: Dispatch<SetStateAction<number>>,
    incrementLineTension?: Dispatch<SetStateAction<number>>,
    decrementLineTension?: Dispatch<SetStateAction<number>>,
    setIsFishPulling?: Dispatch<SetStateAction<boolean>>,
    fishRodLevel?: FishRodLevel,
    setGameProcess?: Dispatch<SetStateAction<string>>,
    catchNewFish?: Dispatch<SetStateAction<UniqueFish>>
}


const BattleProcess: React.FC<Props> = ({
    baitDistance,
    baitOffset,
    setBaitOffset,
    lineLength,
    scrollToBait,
    setRodAngle,
    // Redux
    hookedFish,
    setHookedFish,
    lineTension,
    isFishPulling,
    setLineTension,
    incrementLineTension,
    decrementLineTension,
    setIsFishPulling,
    fishRodLevel,
    setGameProcess,
    catchNewFish
}) => {
    // Audio
    const reelingSE = useMemo((): HTMLAudioElement => {
        const audio = new Audio()
        const src = require('../../../../assets/audio/se/reeling.mp3').default
        audio.src = src
        audio.loop = true
        return audio
    }, [])

    // State
    const [isPlayerReeling, setIsPlayerReeling] = useState<boolean>(false)

    /*
        Map state to refs to be able to access current values
        from asynchronous functions
    */
    const lineTensionRef = useRef<number>(lineTension)
    useEffect(() => {
        lineTensionRef.current = lineTension
    }, [lineTension])
    const isFishPullingRef = useRef<boolean>(isFishPulling)
    useEffect(() => {
        isFishPullingRef.current = isFishPulling
    }, [isFishPulling])
    const isPlayerReelingRef = useRef<boolean>(isPlayerReeling)
    useEffect(() => {
        isPlayerReelingRef.current = isPlayerReeling
    }, [isPlayerReeling])

    // COMPUTED
    // The stronger the fish, the smaller the ratio
    const strengthRatio = useMemo((): number => fishRodLevel.strength / hookedFish.fish.strength, [fishRodLevel, hookedFish])

    // Slowly recover line tension when player is not reeling in
    const recoverTensionIntervalRef = useRef<number|null>(null)
    let recoverTensionValue = useMemo((): number => {
        // Recover slower when tension is negative
        if (lineTension <= 0) {
            if (strengthRatio >= 1) {
                // Player is stronger than fish
                return strengthRatio  * 3/4
            } else {
                // Fish is stronger than player
                return strengthRatio
            }
        }
        else {
            if (strengthRatio >= 1) {
                // Player is stronger than fish
                return strengthRatio**2
            } else {
                // Fish is stronger than player
                return strengthRatio*2
            }
        }
    }, [lineTension, strengthRatio])
    useEffect(() => {
        const willRecover = () => {
            // Only set interval once
            if (recoverTensionIntervalRef.current !== null) return false
            // Don't get looser than -100
            else if (lineTension <= -100) {
                setLineTension(-100)
                return false
            }
            // Don't recover when player is reeling
            else if (isPlayerReelingRef.current) return false

            // When fish is pulling
            else if (isFishPullingRef.current) {
                // If fish is stronger
                if (strengthRatio < 1) {
                    // Slow down recovery (will slow down more if fish is a lot stronger)
                    recoverTensionValue *= strengthRatio
                // If fish is weaker or as strong as player
                } else {
                    // Slow down recovery (will slow down more if player is not so much stronger)
                    recoverTensionValue *= (1 - (1/strengthRatio))
                }
                // Tension cannot go straight from positive to negative, has to be 0 first
                if (lineTensionRef.current > 0 && lineTensionRef.current - recoverTensionValue < 0) {
                    recoverTensionValue = lineTensionRef.current
                }

                return true
            }
            
            else return true 
        }
        if (willRecover()) {
            recoverTensionIntervalRef.current = window.setInterval(() => {
                decrementLineTension(recoverTensionValue)
            }, 100)
        } else {
            window.clearInterval(recoverTensionIntervalRef.current)
            recoverTensionIntervalRef.current = null
        }

        return () => {
            window.clearInterval(recoverTensionIntervalRef.current)
            recoverTensionIntervalRef.current = null
        }
    }, [
        lineTension,
        isPlayerReeling,
        isFishPulling,
        recoverTensionValue,
        strengthRatio
    ])

    // Reel in line with fish
    const move = useCallback(
        (moveDistance: number) => {
            if (moveDistance > 0) {
                // Get closer to the shore
                // Find out angle
                const angleRadians: number = Math.atan(baitOffset.x/baitOffset.y)
                const angleDegrees: number = angleRadians*180/Math.PI
                // Find out next offset coords from angle and hypotenuse
                const hypotenuse: number = lineLength - moveDistance
                const opposite: number = Math.sin(angleRadians) * hypotenuse
                const adjacent: number = Math.cos(angleRadians) * hypotenuse
                // Apply translation and lean fishrod towards target
                setBaitOffset({ x: opposite, y: adjacent })
                setRodAngle(-angleDegrees)
                // Scroll to new position
                scrollToBait()
            } else {
                // Go away from the shore
            }
        }, [baitOffset, setBaitOffset, lineLength]
    )

    // Handle reeling and fish pulling interactions
    useEffect(() => {
        console.log('inside useffect')
        // Find out where the bait will move and how it affects line tension
        let intervalID = null
        const step = 10 // move length const in pixels
        const intervalDuration = 100 // move duration const in mls
        let inertia = strengthRatio
        let moveDistance = 0 // Actual distance that the bait will travel; if negative, bait moves away
        let addedTension = 0 // Line tension that will be added during this interval

        if (isPlayerReelingRef.current) {
            // Player is reeling in
            if (isFishPullingRef.current) {
                // Fish is pulling on line
                moveDistance = step * inertia * (3/4 + (1/4* fishRodLevel.resistance/100))
                addedTension = (1/inertia)**2
            } else {
                // Fish is not pulling on line
                moveDistance = step * inertia 
                addedTension = (1/inertia)*2
            }
        } else {
            // Player is not reeling in
            addedTension = 0 // Tension won't increase
            if (isFishPullingRef.current) {
                // Fish is pulling on line
                moveDistance = - Math.abs(
                    step * 1/inertia
                )
            } else {
                // Fish is not pulling
                moveDistance = 0
            }
        }

        if (!isPlayerReelingRef.current && !isFishPullingRef.current) {
            // Player is not reeling in and fish not pulling on line
            if (intervalID !== null) {
                window.clearInterval(intervalID)
                intervalID = null
            }
        }  else {
            // Apply new distance and tension periodically
            intervalID = window.setInterval(() => {
                console.log(addedTension)
                if (addedTension > 0) incrementLineTension(addedTension)
                if (moveDistance > 0 || moveDistance < 0) move(moveDistance)
            }, intervalDuration)
        }

        return () => {
            window.clearInterval(intervalID)
            intervalID = null
        }
    }, [isFishPulling, isPlayerReeling, strengthRatio, fishRodLevel, move])
    // Handle reeling alone
    useEffect(() => {
        // Play reeling sound effect
        if (isPlayerReeling) {
            reelingSE.play()
        } else {
            reelingSE.pause()
        }
    }, [isPlayerReeling])

    // Success if player managed to reel in the fish to the shore
    useEffect(() => {
        if (baitDistance <= 0) {
            catchNewFish(hookedFish.fish)
            goBack()
            setGameProcess(gameProcesses.INITIAL)            
        }
    }, [baitDistance])

    // Cancel catching fish and keep bait
    const goBack = useCallback(
        (): void => {
            setLineTension(0)
            setGameProcess(gameProcesses.THROW_LINE)
            setHookedFish(null)
            reelingSE.pause()
        }, []
    )

    // Decide whether fish is pulling
    useEffect(() => {
        const pullIntervalID = window.setInterval(() => {
            const willPull = probability(hookedFish.fish.pullChance)
            if (willPull) setIsFishPulling(true)
            else setIsFishPulling(false)
        }, hookedFish.fish.roamingInterval)

        return () => window.clearInterval(pullIntervalID)
    }, [])

    // Player controls
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
        function handleSpaceDown (e: KeyboardEvent): void {
            switch(e.keyCode) {
                case 32: // Space
                case 13: // Enter
                    e.preventDefault()
                    if (!isPlayerReelingRef.current) {
                        setIsPlayerReeling(true)
                    }
                    break
            }
        }
        function handleSpaceUp (e: KeyboardEvent): void {
            switch (e.keyCode) {
                case 32: // Space
                case 13: // Enter
                    // Stop reeling
                    if (isPlayerReelingRef.current) {
                        setIsPlayerReeling(false)
                    }
                    break
            }
        } 
        
        document.addEventListener('keydown', handleSpaceDown, true)
        document.addEventListener('keyup', handleSpaceUp, false)
        return () => {
            document.removeEventListener('keydown', handleSpaceDown, true)
            document.removeEventListener('keyup', handleSpaceUp, false)
        }
    }, [])
    // Mousedown/up
    useEffect(() => {
        function handleMouseDown (e: MouseEvent): void {
            setIsPlayerReeling(true)
        }
        function handleMouseUp (e: MouseEvent) : void {
            setIsPlayerReeling(false)
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

    return <div>
        <button onClick={() => setLineTension(lineTension - 10)} style={{position: 'fixed', top: '3rem', left: '1rem' }}>-</button>
        <button onClick={() => setLineTension(lineTension + 10)} style={{position: 'fixed', top: '3rem', left: '2rem' }}>+</button>
        <nav className={styles.navigation}>
        <button
            className={`btn btn-cancel ${styles.repeatBTN}`}
            onClick={goBack}
        >
            <BsArrowRepeat />
        </button>
    </nav>
    </div>
}


// Connect to Redux
const mapStateToProps = state => ({
    hookedFish: hookedFishSelector(state),
    lineTension: lineTensionSelector(state),
    isFishPulling: isPullingSelector(state),
    fishRodLevel: rodLevelSelector(state)
})
const mapDispatchToProps = dispatch => ({
    setHookedFish: (hookedFish: FishData) => dispatch(setHookedFishAction(hookedFish)),
    setLineTension: (newTension: number) => dispatch(setLineTensionAction(newTension)),
    incrementLineTension: (step: number) => dispatch(incrementLineTensionAction(step)),
    decrementLineTension: (step: number) => dispatch(decrementLineTensionAction(step)),
    setIsFishPulling: (isPulling: boolean) => dispatch(setIsPullingAction(isPulling)),
    setGameProcess: (nextProcess: string) => dispatch(setGameProcessAction(nextProcess)),
    catchNewFish: (fish: UniqueFish) => dispatch(catchNewFishAction(fish))
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BattleProcess)