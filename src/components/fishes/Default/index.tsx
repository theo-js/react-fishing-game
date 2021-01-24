import React, { useCallback, ReactNode, useState, useMemo, useEffect, useRef } from 'react'
import { Coordinates, Path, Map } from '../../../interfaces/position'
import { Item } from '../../../interfaces/items'
import { Fish, FishData } from '../../../interfaces/fishes'
import { randomIntFromInterval, probability, toDeg } from '../../../utils/math'
import { getNextCoordinatesOfPath, areCoordinatesInPath, getAngleFromVerticalAxis } from '../../../utils/position'
import { takeBaitAnim } from '../../Game/animations'
import { FaHeart, FaTimes } from 'react-icons/fa'
import styles from './index.module.sass'
import gameProcesses from '../../Game/processes/index.json'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { mapSelector, baitLakeCoordsSelector } from '../../../store/selectors/position'
import { isBaitAvailableSelector, baitFoodSelector, hookedFishSelector } from'../../../store/selectors/fishing'
import { makeBaitAvailableAction, setHookedFishAction } from '../../../store/actions/fishing'
import { setGameProcessAction } from '../../../store/actions/game'

interface Props {
    fish?: Fish, // fish stats template from json file
    groupID: string, // fish group id
    _id: string, // fish id
    size?: number, // Size of the fish in px; width = 1em
    area?: Path, // Path of the area the fish belongs to
    detectionScope?: number, // Number of pixels around fish where it can detect the bait,
    roamingInterval?: number, // Interval in milliseconds between fish moves when it's roaming
    roamingDistance?: number, // Distance in px that fish travels when it's roaming
    edibleFoods?: string[], // What foods the fish likes
    biteChance: number, // Probability that the fish will take the bait if it's attracted to it (min: 0; max: 1)
    catchTimeLapse: number[] // Interval of time in which player is able to hook the fish after it took the bait; first n is the delay after the bait was taken, second is the duration
    className?: string,
    children?: ReactNode,
    // Redux
    map?: Map,
    baitLakeCoords?: Coordinates
}

// Lake is the referential of fish coords
const DefaultFish: React.FC<Props> = ({
    fish = null,
    _id,
    groupID,
    size = 20,
    area,
    detectionScope = 75,
    roamingInterval,
    roamingDistance,
    edibleFoods = ['Mushroom'],
    biteChance = .75,
    catchTimeLapse =  [0, 2000],
    className = '',
    children,
}) => {
    // REDUX
    const hookedFish = useSelector(hookedFishSelector)
    const baitLakeCoords: Coordinates = useSelector(baitLakeCoordsSelector)
    const map: Map = useSelector(mapSelector)
    const isBaitAvailable: boolean = useSelector(isBaitAvailableSelector)
    const baitFood: Item = useSelector(baitFoodSelector)
    const dispatch = useDispatch()
    const makeBaitAvailable = useCallback((bool: boolean): void => dispatch(makeBaitAvailableAction(bool)), [])
    const setHookedFish = useCallback((fish: FishData): void => dispatch(setHookedFishAction(fish)), [])
    const setGameProcess = useCallback((newProcess: string): void => dispatch(setGameProcessAction(newProcess)), [])
    
    // REFS
    const fishPathRef = useRef<HTMLDivElement>(null)

    // STATE
    const [fishDirection, setFishDirection] = useState<number>(randomIntFromInterval(-180, 180))
    const [isRoaming, setIsRoaming] = useState<boolean>(true)
    const [moveTransition, setMoveTransition] = useState<string>('none')
    const [wouldHookSuccessfully, setWouldHookSuccessfully] = useState<boolean>(false)
    const [canTryToCatch, setCanTryToCatch] = useState<boolean>(false)
    const [isStruggling, setIsStruggling] = useState<boolean>(false)

    // Initialize fish position somewhere inside the area/group it belongs to
    const [fishCoords, setFishCoords] = useState<Coordinates>({
        x: randomIntFromInterval(area.from.x, area.to.x),
        y: randomIntFromInterval(area.from.y, area.to.y)
    })
    const fishWidth = useMemo((): number => size, [size])
    const fishHeight = useMemo((): number => size*3/8, [size])
    const isFishHorizontal = useMemo((): boolean => (fishDirection <= 135 && fishDirection >= 45) || (fishDirection >= -135 && fishDirection <= -45), [fishDirection])
    const rectWidth = useMemo((): number => isFishHorizontal ? fishWidth : fishHeight, [isFishHorizontal, fishWidth, fishHeight])
    const rectHeight = useMemo((): number => isFishHorizontal ? fishHeight : fishWidth, [isFishHorizontal, fishWidth, fishHeight])

    const fishPath = useMemo((): Path => {
        const halfWidth: number = rectWidth/2
        const halfHeight: number = rectHeight/2
        return ({
            from: {
                x: fishCoords.x - halfWidth,
                y: fishCoords.y - halfHeight
            },
            to: {
                x: fishCoords.x + halfWidth,
                y: fishCoords.y + halfHeight
            }
        })
    }, [fishCoords, rectWidth, rectHeight])

    const detectionPath = useMemo((): Path => {
        return ({
            from: {
                x: fishPath.from.x - detectionScope,
                y: fishPath.from.y - detectionScope
            },
            to: {
                x: fishPath.to.x + detectionScope,
                y: fishPath.to.y + detectionScope
            }
        })
    }, [fishPath, detectionScope])

    // Check when bait gets within fish's detection scope
    const isInScope = useMemo((): boolean => {
        return isBaitAvailable && areCoordinatesInPath(baitLakeCoords, detectionPath)
    }, [baitLakeCoords, detectionPath, isBaitAvailable])

    // Check whether fish likes the food on the fishing hook
    const likesBait = useMemo(() => {
        if (!baitFood) return false
        return edibleFoods.includes(baitFood._id)
    }, [edibleFoods, baitFood])

    // FUNCTIONS
    const giveUpBait = useCallback(
        (): void => {
            window.clearTimeout(hookStartTimerIDRef.current)
            window.clearTimeout(hookFailTimerIDRef.current)
            window.clearTimeout(hookSucceedTimerIDRef.current)
            console.log('giving up')
            return setIsRoaming(true)
        }, []
    )

    // This function gets called when a fish takes the bait and the player reacted too late
    const handleHookFail = useCallback(
        (): void => {
            if (!isInScope || !!hookedFish) return giveUpBait()
            else {
                giveUpBait()
                //console.log('Too late ... the fish went away with your bait !')
                setWouldHookSuccessfully(false)
                setCanTryToCatch(false)
                setIsRoaming(true)
                // Go back to the shore automatically
                setGameProcess(gameProcesses.INITIAL)
            }
        }, [isInScope, giveUpBait, hookedFish]
    )

    const randomMove = useCallback(
        (): void => {
            if (typeof document.hidden === "undefined" || document.hidden === false) {
                const newAngle: number = randomIntFromInterval(-180, 180)
                const distance: number = roamingDistance || fishWidth
                const offsetCoords: Coordinates = getNextCoordinatesOfPath(newAngle, distance)
                const newCoords: Coordinates = {
                    x: fishCoords.x + offsetCoords.x,
                    y: fishCoords.y + offsetCoords.y
                }
        
                // Only move if newCoords are inside fish area
                if (areCoordinatesInPath(newCoords, area)) {
                    setFishDirection(-newAngle)
                    setFishCoords(newCoords)
                }
            }
        }, [fishCoords, fishDirection, roamingDistance, fishWidth, area, isInScope, likesBait]
    )

    const approachBait = useCallback(
        (): void => {
            // Lean towards bait from current position
            const angle: number = toDeg(getAngleFromVerticalAxis({ from: baitLakeCoords, to: fishCoords }))
            setMoveTransition('2s transform ease-in-out, 0s background ease, 0s border-color ease')
            setFishDirection(angle)
            // Handle offset
            let offsetX: number = 0
            let offsetY: number = 0

            offsetX = (angle > 0 && angle < 45) || (angle > 135 && angle <= 180) ? rectWidth/2 : offsetX
            offsetX = angle < 0 ? -rectWidth : offsetX
            offsetX = (angle < 45 && angle > -45) || angle > 135 ?  -rectHeight/2 : offsetX
            offsetY = Math.abs(angle) > 90 ? rectHeight/2 : -rectHeight/2

            setFishCoords({
                x: baitLakeCoords.x + offsetX,
                y: baitLakeCoords.y + offsetY
            })
        }, [baitLakeCoords, fishCoords, rectHeight, rectWidth]
    )

    // Handle take bait
    // Timer IDs
    const hookStartTimerIDRef = useRef<number>(null)
    const hookSucceedTimerIDRef = useRef<number>(null)
    const hookFailTimerIDRef = useRef<number>(null)
    // We need to access current values of these refs during setTimeout
    const inScopeRef = useRef<boolean>(null)
    // Map dependencies to refs
    useEffect(() => {
        inScopeRef.current = isInScope
    }, [isInScope])
    const takeBait = useCallback(
        (): void => {
             // Stop roaming and approach bait
            setIsRoaming(false)
            const [delay, duration] = catchTimeLapse
            const approachDuration = 4000
            approachBait()
            //console.log('approaching bait')
            
            hookFailTimerIDRef.current = window.setTimeout(
                handleHookFail, approachDuration + delay + duration
            )

            hookSucceedTimerIDRef.current = window.setTimeout(() => {
                if (!inScopeRef.current) return giveUpBait()
                setWouldHookSuccessfully(true)
                // Player would hook the fish successfully during this interval
            }, approachDuration + delay)

            // Fish will approach bait during x seconds before taking it
            hookStartTimerIDRef.current = window.setTimeout(() => {
                // If bait went out of scope or is unavailable, stop
                if (!inScopeRef.current) {
                    return giveUpBait()
                }
                
                setCanTryToCatch(true)
                // Prevent more than one fish at a time to get hooked
                makeBaitAvailable(false)
                takeBaitAnim(fishPathRef.current)
                // "takes bait"; if tries to hook now, too early
            }, approachDuration)
        }, [
            catchTimeLapse,
            approachBait,
            handleHookFail,
            giveUpBait
        ]
    )
    // Allow player to hook the fish during the right timelapse
    useEffect(() => {
        function handleHook (): void {
            if (isBaitAvailable) {
                if (wouldHookSuccessfully) {
                    // Hooked successfully
                    setHookedFish({ _id, fish, groupID })
                    //setGameProcess(gameProcesses.BATTLE)

                    window.clearTimeout(hookFailTimerIDRef.current)                    
                    setWouldHookSuccessfully(false)
                    setCanTryToCatch(false)

                    setIsStruggling(true)
                    setMoveTransition('none')
                } else {
                    // Too early
                    alert('Too early !')
                    makeBaitAvailable(true)
                }
            } else console.log('Tried to hook but bait is not available ...')
        }
        function handleKeyPress (e: KeyboardEvent): void {
            e.preventDefault()
            e.stopPropagation()
            switch(e.keyCode) {
                case 32: // Space
                case 13: // Enter
                    handleHook()
                    break
            }
        }
        function handleClick (e: MouseEvent): void {
            e.preventDefault()
            e.stopPropagation()
            handleHook()
        }
        function handleTouch (e: TouchEvent): void {
            e.preventDefault()
            e.stopPropagation()
            handleHook()
        }

        if (canTryToCatch) {
            document.addEventListener('keypress', handleKeyPress, true)
            document.body.addEventListener('click', handleClick, true)
            document.body.addEventListener('touchstart', handleTouch, true)
        } else {
            document.removeEventListener('keypress', handleKeyPress, true)
            document.body.removeEventListener('click', handleClick, true)
            document.body.removeEventListener('touchstart', handleTouch, true)
        }

        return () => {
            document.removeEventListener('keypress', handleKeyPress, false)
            document.body.removeEventListener('click', handleClick, true)
            document.body.removeEventListener('touchstart', handleTouch, true)
        }
    }, [wouldHookSuccessfully, canTryToCatch, isBaitAvailable, _id, groupID])

    // Default fish behaviour when it's roaming
    useEffect(() => {
        let intervalID = null
        const handleRoaming = (): void => {
            if (!isInScope || !likesBait) randomMove()
            else {
                // Decide whether to take the bait
                if (probability(biteChance)) {
                    takeBait()
                } else randomMove()
            }
        }

        if (isRoaming && !hookedFish) {
            intervalID = window.setInterval(handleRoaming, roamingInterval || randomIntFromInterval(3000, 6000))
            setMoveTransition('1s all ease')
        } else {
            window.clearInterval(intervalID)
        }

        return () => {
            window.clearInterval(intervalID)
        }
    }, [
        isRoaming,
        randomMove,
        roamingInterval,
        likesBait,
        isInScope,
        biteChance,
        takeBait,
        hookedFish
    ])

    // Make fish follow bait when it is hooked
    useEffect(() => {
        if (hookedFish && hookedFish._id === _id) {
            setFishCoords(baitLakeCoords)
        }
    }, [hookedFish, _id, baitLakeCoords])

    // All other fishes disappear when fish gets hooked
    if (hookedFish && hookedFish._id !== _id) return null

    return <><div
        className={`
            ${className} 
            ${styles.defaultFish} 
            ${isStruggling ? styles.struggling : ''} 
            ${canTryToCatch ? styles.canTryToCatch : ''} 
            ${wouldHookSuccessfully ? styles.wouldHookSuccessfully : ''}
        `}
        style={{
            fontSize: `${size}px`,
            animationDelay: `${Math.random()}s`,
            transform: `
                translate(
                    ${fishPath.from.x - (isFishHorizontal ? 0 : fishHeight/2)}px,
                     ${fishPath.from.y + (isFishHorizontal ? 0 : fishHeight)}px
                )
                 rotate(${fishDirection + 90}deg)
            `,
            left: 0,
            top: 0,
            transition: moveTransition
        }}
    >
        {children}
    </div>
    <div
        className={styles.fishPath}
        ref={fishPathRef}
        style={{
            left: fishPath.from.x,
            top: fishPath.from.y,
            width: fishPath.to.x - fishPath.from.x,
            height: fishPath.to.y - fishPath.from.y,
            transition: moveTransition
        }}
    >
        {isInScope && isRoaming && (
            /* Emoji indicating whether the fish is attracted by the bait */
            <div className={styles.likeStatus}>
                {likesBait ? <FaHeart className={styles.heart} />
                : <FaTimes className={styles.times} />}
            </div>
        )}
    </div>
    <div
        className={`
            ${styles.detectionPath}
            ${isStruggling ? styles.struggling : ''} 
        `}
        style={{
            left: detectionPath.from.x,
            top: detectionPath.from.y,
            width: detectionPath.to.x - detectionPath.from.x,
            height: detectionPath.to.y - detectionPath.from.y
        }}
    ></div>
    {hookedFish && <div className={styles.focusBG}></div>}
    </>
}

export default React.memo(DefaultFish)