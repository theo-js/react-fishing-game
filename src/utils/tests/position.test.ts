import {
    pxToM, mToPx,
    formatMeters,
    getVectorLength,
    getNextCoordinatesOfPath,
    areCoordinatesInPath,
    getAngleFromVerticalAxis
} from '../position'
import { Path, Coordinates } from '../../interfaces/position'

describe('position module', () => {
    test('should convert distance symetrically', () => {
        const testValue = 5
        expect(typeof mToPx(testValue) === 'number').toBe(true)
        expect(typeof pxToM(testValue) === 'number').toBe(true)
        expect(mToPx(pxToM(testValue))).toBe(testValue)
    })

    test('formatMeters', () => {
        expect(formatMeters(0)).toBe('0cm')
        expect(formatMeters(.99)).toBe('99cm')
        expect(formatMeters(1)).toBe('1m')
        expect(formatMeters(1.01)).toBe('1.01m')
        expect(formatMeters(-.5)).toBe('-50cm')
    })

    test('getVectorLength', () => {
        // Distance should be 0 when from and to are the same coordinates
        const fromEqualsTo: Path = {
            from: { x: 322, y: 185 },
            to: { x: 322, y: 185 }
        }
        expect(getVectorLength(fromEqualsTo)).toBe(0)

        // Test typical output
        const typicalPath: Path = {from: {x: 100, y: 100}, to: {x: 200, y: 200}}
        const typicalOutput: number = getVectorLength(typicalPath)
        expect(typeof typicalOutput === 'number').toBe(true)
        expect(typicalOutput).toBe(141.4213562373095)

        // Value should be absolute
        const upVector: Path = {
            from: {x: 0, y: 0},
            to: {x: 0, y: -100}
        }
        const downVector: Path = {
            from: {x: 0, y: 0},
            to: {x: 0, y: 100}
        }
        expect(getVectorLength(upVector)).toBe(getVectorLength(downVector))
    })

    test('getNextCoordinatesOfPath', () => {
        // If hypotenuse length is 0, next coordinates are current
        expect(getNextCoordinatesOfPath(90, 0)).toStrictEqual({ x: 0, y: 0 })

        // Test typical output
        expect(getNextCoordinatesOfPath(15, 100000000000000000))
        .toStrictEqual({x: 25881904510252070, y: 96592582628906830})
    })

    test('areCoordinatesInPath', () => {
        // Coordinates are outside
        expect(
            areCoordinatesInPath(
                { x: 0, y: 0 },
                {
                    from: { x: 10, y: 10 },
                    to: { x: 20, y: 20 }
                }
            )
        ).toBe(false)

        // Coordinates are inside
        expect(
            areCoordinatesInPath(
                { x: 0, y: 0 },
                {
                    from: { x: -10, y: -10 },
                    to: { x: 10, y: 10 }
                }
            )
        ).toBe(true)
    })

    test('getAngleFromVerticalAxis', () => {
        // Angle should be 0 if vector is vertical
        expect(getAngleFromVerticalAxis({
            from: { x: 0, y: 0 },
            to: { x: 0, y: 100 }
        })).toBe(0)
        expect(getAngleFromVerticalAxis({
            from: { x: 0, y: 0 },
            to: { x: 0, y: -100 }
        })).toBe(0)
        expect(getAngleFromVerticalAxis({
            from: { x: 100, y: 0 },
            to: { x: 100, y: 100 }
        })).toBe(0)

        // Test typical positive vector
        const typicalPosVector = {
            from: { x: 40, y: 20 },
            to: { x: 120, y: 50 }
        }
        expect(
            getAngleFromVerticalAxis(typicalPosVector)
            .toPrecision(4)
        ).toBe('1.212')

        // Test typical negative vector
        const typicalNegVector = {
            from: { x: 120, y: 20 },
            to: { x: 40, y: 50 }
        }
        expect(
            getAngleFromVerticalAxis(typicalNegVector)
            .toPrecision(4)
        ).toBe('-1.212')
    })
})