import React, { Dispatch, SetStateAction, useCallback, useRef, useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import gameProcesses from '../index.json'
import { Coordinates, Map } from '../../../../interfaces/position'
import throttle from '../../../../utils/throttle'
import { FaFish, IoClose, GiLightBackpack } from 'react-icons/all'
import styles from './index.module.sass'

// Redux
import { isMainMenuOpenSelector, isMainMenuClosingSelector } from '../../../../store/selectors/game'
import { baitFoodSelector } from '../../../../store/selectors/fishing'
import { openMainMenuAction, closeMainMenuAction } from '../../../../store/actions/game'

interface Props {
    setProcess: Dispatch<SetStateAction<string>>,
    playerCoordinates: Coordinates,
    setPlayerCoordinates: Dispatch<SetStateAction<Coordinates>>,
    scrollToPlayer: (behavior?: 'smooth' | 'auto' | undefined) => void,
    shoreRef: any,
    map: Map,
    setIsBarometerVisible: Dispatch<SetStateAction<boolean>>,
    isBarometerVisible: boolean,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    setRodAngle: Dispatch<SetStateAction<number>>,
    setBaitType: Dispatch<SetStateAction<string>>
}

enum Direction {
    LEFT = 'LEFT',
    RIGHT = "RIGHT"
}

export default (({
    setProcess,
    playerCoordinates,
    setPlayerCoordinates,
    scrollToPlayer,
    shoreRef,
    map,
    isBarometerVisible,
    setIsBarometerVisible,
    setBaitOffset,
    setRodAngle,
    setBaitType
}) => {
    // REDUX
    const dispatch = useDispatch()
    const openMainMenu = useCallback(
        (): void => dispatch(openMainMenuAction()), []
    )
    const closeMainMenu = useCallback(
        (): void => dispatch(closeMainMenuAction()), []
    )
    const isMainMenuOpen = useSelector(isMainMenuOpenSelector)
    const isMainMenuClosing = useSelector(isMainMenuClosingSelector)
    const baitFood = useSelector(baitFoodSelector)

    // STATE
    const [isPlayerMoving, setIsPlayerMoving] = useState<boolean>(false)
    const lastTouchX = useRef<number>(null)

    const movePlayer = useCallback(
        (direction: Direction, value: number): void => {
            // Set isPlayerMoving if it's not already
            if (!isPlayerMoving)setIsPlayerMoving(true)

            if (direction === Direction.LEFT) {
                // Prevent player from leaving map, left side
                if (playerCoordinates.x - value < 0) {
                    return setPlayerCoordinates({ ...playerCoordinates, x: 0 })
                }
                setPlayerCoordinates({ ...playerCoordinates, x: playerCoordinates.x - value })
            } else if (direction === Direction.RIGHT) {
                // Prevent player from leaving map, right side
                if (map.width - playerCoordinates.x < value + playerCoordinates.width) {
                    return setPlayerCoordinates({ ...playerCoordinates, x: map.width - playerCoordinates.width })
                }
                setPlayerCoordinates({ ...playerCoordinates, x: playerCoordinates.x + value })
            }
            scrollToPlayer('auto')
        }, [playerCoordinates]
    )

    // Initialize scroll position at player's position and bait at 0,0
    useLayoutEffect(() => {
        scrollToPlayer('auto')
        setBaitOffset({ x: 0, y: 0 })
        setRodAngle(0)
        setBaitType('default')
    }, [])

    // Hide barometer
    useEffect(() => {
        if (isBarometerVisible) {
            setIsBarometerVisible(false)
        }
    }, [])

    const throwLine = useCallback(
        (): void => {
            if (!isPlayerMoving && !isMainMenuOpen && baitFood) {
                setProcess(gameProcesses.THROW_LINE)
            }
        }, [isPlayerMoving, isMainMenuOpen, baitFood]
    )

    // Attach event listeners
    useEffect(() => {
        function handleKeyDown (e: KeyboardEvent): void {
            const { keyCode } = e
            switch (keyCode) {
                case 37: // Left
                    e.preventDefault()
                    movePlayer(Direction.LEFT, 40)
                    break
                case 38: // Top
                    e.preventDefault()
                    break
                case 39: // Right
                    e.preventDefault()
                    movePlayer(Direction.RIGHT, 40)
                    break
                case 40: // Bottom
                    e.preventDefault()
                    break
                case 32: // Space
                case 13: // Enter
                    e.preventDefault()
                    throwLine()
                    break
            }
        }
        const handleKeyDownThrottle = throttle(handleKeyDown, 100)
        function preventVerticalScroll (e: KeyboardEvent): void {
            const { keyCode } = e
            switch (keyCode) {
                case 38: // Top
                    e.preventDefault()
                    break
                case 40: // Bottom
                    e.preventDefault()
                    break
            }
        }
        function handleKeyUp (e: KeyboardEvent): void {
            setIsPlayerMoving(false)
        }
        function handleClick (e: any): void {
            const { layerX } = e
            const difference = layerX - playerCoordinates.x
            movePlayer(difference >= 0 ? Direction.RIGHT : Direction.LEFT, Math.abs(difference))
            setIsPlayerMoving(false)
        }
        function handleTouchMove (e: TouchEvent) {
            const currentTouchX = e.touches[0].clientX
            if (lastTouchX.current !== null) {
                if (currentTouchX < lastTouchX.current) {
                    // Swipe left
                    movePlayer(Direction.RIGHT, 20)
                } else if (currentTouchX > lastTouchX.current) {
                    // Swipe right
                    movePlayer(Direction.LEFT, 20)
                }
            }
            lastTouchX.current = currentTouchX
        }
        const handleTouchMoveThrottle = throttle(handleTouchMove, 100)
        function handleTouchEnd (e: TouchEvent) {
            setIsPlayerMoving(false)
        }

        if (!isMainMenuOpen) {
            document.addEventListener('keydown', handleKeyDownThrottle, false)
            document.addEventListener('keydown', preventVerticalScroll, true)
            document.addEventListener('keyup', handleKeyUp, false)
            if (shoreRef && shoreRef.current) {
                shoreRef.current.addEventListener('click', handleClick, false)
            }
            document.addEventListener('touchmove', handleTouchMoveThrottle, false)
            document.addEventListener('touchend', handleTouchEnd, false)
        }

        return (): void => {
            document.removeEventListener('keydown', handleKeyDownThrottle, false)
            document.removeEventListener('keydown', preventVerticalScroll, true)
            document.removeEventListener('keyup', handleKeyUp, false)
            if (shoreRef && shoreRef.current) {
                shoreRef.current.removeEventListener('click', handleClick, false)
            }
            document.removeEventListener('touchmove', handleTouchMoveThrottle, false)
            document.removeEventListener('touchend', handleTouchEnd, false)
        }
    }, [playerCoordinates, isMainMenuOpen])

    if (!isPlayerMoving) {
        return <nav className={`menu ${styles.navigation} ${isMainMenuOpen && !isMainMenuClosing ? styles.open : ''}`}>
            <button
                className={`btn ${styles.openMainMenuBTN}`}
                onClick={isMainMenuOpen ? closeMainMenu : openMainMenu}
            >
                {isMainMenuOpen ? <IoClose /> : <GiLightBackpack />}
            </button>
            {baitFood && (
                <button 
                    className={`btn btn-primary ${styles.fishBTN}`}
                    onClick={throwLine}
                >
                    Fish here ? <FaFish />
                </button>
            )}
        </nav>
    }

    return null
}) as React.FC<Props>