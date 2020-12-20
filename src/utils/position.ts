import { Coordinates, Path } from '../interfaces/position'

export const getVectorLength = (path: Path): number => {
    return path.to.x - path.from.x + path.to.y - path.from.y
}

export const getNextCoordinatesOfPath = (angleDeg: number, hypotenuse: number): Coordinates => {
    const angleRad = angleDeg * Math.PI/180
    const opposite = Math.sin(angleRad) * hypotenuse
    const adjacent = Math.cos(angleRad) * hypotenuse
    return { x: opposite, y: adjacent }
}