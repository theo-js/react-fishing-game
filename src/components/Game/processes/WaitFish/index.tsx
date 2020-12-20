import React, { FC, useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react'
import { gameProcesses } from '../../index'
import { Coordinates } from '../../../../interfaces/position'
import styles from './index.module.sass'

interface Props {
    baitOffset: Coordinates,
    setBaitOffset: Dispatch<SetStateAction<Coordinates>>,
    baitDistance: number,
    setBaitType: Dispatch<SetStateAction<string>>,
    setProcess: Dispatch<SetStateAction<string>>,
    scrollToPlayer: () => void
}

const WaitFish: FC<Props> = ({
    baitOffset,
    setBaitOffset,
    baitDistance,
    setBaitType,
    setProcess,
    scrollToPlayer
}) => {
    useEffect(() => console.log('Cool'))
    // Go back to previous process (retry throwing line)
    const goBack = useCallback(
        (): void => {
            setBaitType('default')
            scrollToPlayer('smooth')
            setProcess(gameProcesses.THROW_LINE)
        }, [scrollToPlayer, setProcess, setBaitType]
    )
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
    // Reel in line
    useEffect(() => {
        function handleSpace (e: KeyboardEvent): void {
            switch(e.keyCode) {
                case 32: // Space
                case 13: // Enter
                    e.preventDefault()
                    break
            }
        }
        document.addEventListener('keydown', handleSpace, false)
        return () => document.removeEventListener('keydown', handleSpace, false)
    }, [])
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

    return <nav className={`${styles.navigation} menu`}>
        <p className={styles.baitDistance}>{baitDistance}m</p>
    </nav>
}

export default WaitFish