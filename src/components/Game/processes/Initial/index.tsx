import React, { Dispatch, SetStateAction, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { gameProcesses } from '../../index'
import { Coordinates, Map } from '../../../../interfaces/position'
import throttle from '../../../../utils/throttle.ts'
import { FaFish } from 'react-icons/fa'
import styles from './index.module.sass'

interface Props {
    setProcess: Dispatch<SetStateAction<string>>,
    playerCoordinates: Coordinates,
    setPlayerCoordinates: Dispatch<SetStateAction<Coordinates>>,
    scrollToPlayer: (behavior?: 'smooth' | 'auto' | undefined) => void,
    shoreRef: any,
    map: Map
}

enum Direction {
    LEFT = 'LEFT',
    RIGHT = "RIGHT"
}

export default (({ setProcess, playerCoordinates, setPlayerCoordinates, scrollToPlayer, shoreRef, map }) => {
    const [isPlayerMoving, setIsPlayerMoving] = useState<boolean>(false)

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

    // Initialize scroll position at player's position
    useLayoutEffect(() => {
        scrollToPlayer('auto')
    }, [])

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
                    if (!isPlayerMoving) setProcess(gameProcesses.THROW_LINE)
                    break
            }
        }
        const handleKeyDownThrottle = throttle(handleKeyDown, 1000)
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
        function handleClick (e: MouseEvent): void {
            const { layerX } = e
            const difference = layerX - playerCoordinates.x
            movePlayer(difference >= 0 ? Direction.RIGHT : Direction.LEFT, Math.abs(difference))
            setIsPlayerMoving(false)
        }
        document.addEventListener('keydown', handleKeyDownThrottle, false)
        document.addEventListener('keydown', preventVerticalScroll, true)
        document.addEventListener('keyup', handleKeyUp, false)
        if (shoreRef && shoreRef.current) {
            shoreRef.current.addEventListener('click', handleClick, false)
        }

        return (): void => {
            document.removeEventListener('keydown', handleKeyDownThrottle, false)
            document.removeEventListener('keydown', preventVerticalScroll, true)
            document.removeEventListener('keyup', handleKeyUp, false)
            if (shoreRef && shoreRef.current) {
                shoreRef.current.removeEventListener('click', handleClick, false)
            }
        }
    }, [playerCoordinates])

    if (!isPlayerMoving) {
        return <nav className={`${styles.navigation} menu`}>
            <button 
                className={`btn btn-primary`}
                onClick={e => setProcess(gameProcesses.THROW_LINE)}
            >
                Fish here ? <FaFish />
            </button>
        </nav>
    }

    return null
}) as React.FC<Props>