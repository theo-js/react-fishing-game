import React, { Dispatch, SetStateAction, useRef, useEffect } from 'react'
import gameProcesses from '../index.json'
import { FishData } from '../../../../interfaces/fishes'
import { FishRodLevel } from '../../../../interfaces/evolution'

// Redux
import { connect } from 'react-redux'
import {
    hookedFishSelector,
    lineTensionSelector,
    isPullingSelector
} from '../../../../store/selectors/fishing'
import { rodLevelSelector } from '../../../../store/selectors/game'
import {
    setLineTensionAction,
    setIsPullingAction,
    catchNewFishAction
} from '../../../../store/actions/fishing'
import { setGameProcessAction } from '../../../../store/actions/game'

interface Props {
    baitDistance: number,
    // Redux
    hookedFish?: FishData,
    lineTension?: number,
    isFishPulling?: boolean,
    setLineTension?: Dispatch<SetStateAction<number>>,
    setIsFishPulling?: Dispatch<SetStateAction<boolean>>,
    fishRodLevel?: FishRodLevel,
    setGameProcess?: Dispatch<SetStateAction<string>>,
    catchNewFish?: Dispatch<SetStateAction<string>>
}


const BattleProcess: React.FC<Props> = ({
    baitDistance,
    // Redux
    hookedFish,
    lineTension,
    isFishPulling,
    setLineTension,
    setIsFishPulling,
    fishRodLevel,
    setGameProcess,
    catchNewFish
}) => {
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

    // Win if player managed to reel in the fish to the shore
    useEffect(() => {
        if (baitDistance <= 0) {
            setGameProcess(gameProcesses.INITIAL)
            catchNewFish(hookedFish.fish._id)
        }
    }, [baitDistance])

    return <div>
        <button onClick={() => setLineTension(lineTension - 10)} style={{position: 'fixed', top: '3rem', left: '1rem' }}>-</button>
        <button onClick={() => setLineTension(lineTension + 10)} style={{position: 'fixed', top: '3rem', left: '2rem' }}>+</button>
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
    setLineTension: (newTension: number) => dispatch(setLineTensionAction(newTension)),
    setIsFishPulling: (isPulling: boolean) => dispatch(setIsPullingAction(isPulling)),
    setGameProcess: (nextProcess: string) => dispatch(setGameProcessAction(nextProcess)),
    catchNewFish: (fishID: string) => dispatch(catchNewFishAction(fishID))
})
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BattleProcess)