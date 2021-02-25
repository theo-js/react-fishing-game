import { Coordinates, Path } from '../interfaces/position'
import { toRad } from './math'

export const pxToM = (px: number): number => px/60
export const mToPx = (m: number): number => m*60

// Format
export const formatMeters = (meters: number): string => {
    if (meters < 1) return meters*100 + 'cm'

    return meters + 'm'
}

// Geometry
export const getVectorLength = (path: Path): number => {
    return Math.sqrt(
        (path.to.x - path.from.x)**2 + (path.to.y - path.from.y)**2
    )
}

export const getNextCoordinatesOfPath = (angleDeg: number, hypotenuse: number): Coordinates => {
    const angleRad: number = toRad(angleDeg)
    const opposite: number = Math.sin(angleRad) * hypotenuse
    const adjacent: number = Math.cos(angleRad) * hypotenuse
    return { x: opposite, y: adjacent }
}

export const areCoordinatesInPath = (coords: Coordinates, path: Path): boolean => {
    return (coords.x >= path.from.x && coords.y >= path.from.y) && (coords.x <= path.to.x && coords.y <= path.to.y)
}

export const getAngleFromVerticalAxis = (
    hypotenuse: Path
): number => {
    const hypotenuseLength: number = getVectorLength(hypotenuse)
    const opposite: Path = {
        from: hypotenuse.from,
        to: { x: hypotenuse.to.x, y: hypotenuse.from.y }
    }
    const oppositeLength = getVectorLength(opposite)
    const sin: number = oppositeLength / hypotenuseLength
    const angle: number = Math.asin(sin)
    let result = angle
    
    // Find out direction
    //if (hypotenuse.from.y < hypotenuse.to.y) result += Math.PI/2
    if (hypotenuse.from.x > hypotenuse.to.x) result *= -1

    return result
}