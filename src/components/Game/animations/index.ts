import { Coordinates } from '../../../interfaces/position'
import styles from './index.module.sass'

// Water splash
export const splashAnim = (
    targetCoords?: Coordinates,
    parent: HTMLElement = document.body,
    width: number = 30,
    height: number = 20
): void => {
    try {
        const wave: HTMLDivElement = document.createElement('div')
        wave.className = styles.splashAnimWave
        wave.style.top = `${targetCoords.y - height/2}px`
        wave.style.left = `${targetCoords.x - width/2}px`
        wave.style.height = `${height}px`
        wave.style.width = `${width}px`
        
        // Append wave as a sibling of the provided element
        parent.appendChild(wave)

        // Delete element after 4.5 seconds
        window.setTimeout(() => {
            if (wave) wave.parentElement.removeChild(wave)
        }, 4500)
    } catch (err) {
        //
    }
}

// Plays when a fish takes the bait
export const takeBaitAnim = async (fishPath: HTMLElement = document.body): Promise<any> => {
    try {
        // Play sound effect
        const audio = new Audio()
        audio.src = require('../../../assets/audio/se/take-bait.mp3')
        try {
            await audio.play()
        } catch {
            console.log('Failed to play "take bait" sound effect')
        }
        
        const animated: HTMLDivElement = document.createElement('div')
        animated.className = styles.takeBaitAnim
        
        // Append animated element to fish path
        fishPath.appendChild(animated)

        // Delete element after 0.5 seconds
        window.setTimeout(() => {
            if (animated) animated.parentElement.removeChild(animated)
        }, 500)
    } catch (err) {
        console.log('Fail playing take bait anim')
    }
}