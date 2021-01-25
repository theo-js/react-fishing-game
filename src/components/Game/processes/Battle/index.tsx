import React, { Dispatch, SetStateAction, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import gameProcesses from '../index.json'
import { FishData } from '../../../../interfaces/fishes'
import { FishRodLevel } from '../../../../interfaces/evolution'
import throttle from '../../../../utils/throttle'
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
    decrementLineTensionAction,
    setIsPullingAction,
    catchNewFishAction
} from '../../../../store/actions/fishing'
import { setGameProcessAction } from '../../../../store/actions/game'

interface Props {
    baitDistance: number,
    // Redux
    hookedFish?: FishData,
    setHookedFish?: Dispatch<SetStateAction<FishData>>,
    lineTension?: number,
    isFishPulling?: boolean,
    setLineTension?: Dispatch<SetStateAction<number>>,
    decrementLineTension?: Dispatch<SetStateAction<number>>,
    setIsFishPulling?: Dispatch<SetStateAction<boolean>>,
    fishRodLevel?: FishRodLevel,
    setGameProcess?: Dispatch<SetStateAction<string>>,
    catchNewFish?: Dispatch<SetStateAction<string>>
}


const BattleProcess: React.FC<Props> = ({
    baitDistance,
    // Redux
    hookedFish,
    setHookedFish,
    lineTension,
    isFishPulling,
    setLineTension,
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
    const recoverTensionIntervalDuration = useMemo((): number => {
        // Recover slower when tension is negative
        if (lineTension <= 0) return 100 * strengthRatio
        else return 50 * strengthRatio
    }, [lineTension, strengthRatio])
    useEffect(() => {
        console.log(recoverTensionIntervalDuration)
        if (
            !isPlayerReelingRef.current &&
            lineTension > -100 &&
            recoverTensionIntervalRef.current === null
        ) {
            recoverTensionIntervalRef.current = window.setInterval(() => {
                decrementLineTension(.5)
            }, recoverTensionIntervalDuration)
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
        recoverTensionIntervalDuration
    ])

    // Success if player managed to reel in the fish to the shore
    useEffect(() => {
        if (baitDistance <= 0) {
            setGameProcess(gameProcesses.INITIAL)
            catchNewFish(hookedFish.fish._id)
        }
    }, [baitDistance])

    // Cancel catching fish and keep bait
    const goBack = useCallback(
        (): void => {
            setLineTension(0)
            setGameProcess(gameProcesses.THROW_LINE)
            setHookedFish(null)
        }, []
    )

    useEffect(() => console.log(isFishPulling), [isFishPulling])


    // Decide whether fish is pulling
    useEffect(() => {
        const pullIntervalID = window.setInterval(() => {
            const willPull = probability(hookedFish.fish.pullChance)
            if (willPull) setIsFishPulling(true)
            else setIsFishPulling(false)
        }, hookedFish.fish.roamingInterval)
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
    decrementLineTension: (step: number) => dispatch(decrementLineTensionAction(step)),
    setIsFishPulling: (isPulling: boolean) => dispatch(setIsPullingAction(isPulling)),
    setGameProcess: (nextProcess: string) => dispatch(setGameProcessAction(nextProcess)),
    catchNewFish: (fishID: string) => dispatch(catchNewFishAction(fishID))
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BattleProcess)