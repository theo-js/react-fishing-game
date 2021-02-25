import {
    toRad, toDeg,
    randomIntFromInterval,
    probability,
    countDecimals
} from '../math'

describe('math module', () => {
    test ('should convert angles correctly', () => {
        expect(toRad(0)).toBe(0)
        expect(toDeg(0)).toBe(0)
        expect(toRad(180)).toBe(3.141592653589793)
        expect(toDeg(Math.PI)).toBe(180)
    })

    test('randomIntFromInterval', () => {
        const output1 = randomIntFromInterval(-5, 5)
        expect(typeof output1 === 'number').toBe(true)
        expect(output1).toBeGreaterThanOrEqual(-5)
        expect(output1).toBeLessThanOrEqual(5)
    })

    test('probability', () => {
        expect(typeof probability(.5) === 'boolean').toBe(true)
        expect(probability(0)).toBe(false)
        expect(probability(1)).toBe(true)
    })

    test('countDecimals', () => {
        expect(countDecimals(1)).toBe(0)
        expect(countDecimals(-1)).toBe(0)
        expect(countDecimals(0)).toBe(0)
        expect(countDecimals(1.1)).toBe(1)
        expect(countDecimals(1.01)).toBe(2)
        expect(countDecimals(-1.01)).toBe(2)
    })
})