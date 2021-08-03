import { minsToHrsMins, setVariableInterval } from '../time'

describe('time module', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    it('should format minutes to hours/minutes string', () => {
        expect(minsToHrsMins('string')).toBe('00:00')
        expect(minsToHrsMins(-1)).toBe('00:00')
        expect(minsToHrsMins(1.1)).toBe('00:01')
        expect(minsToHrsMins(1.5)).toBe('00:02')
        expect(minsToHrsMins(1.6)).toBe('00:02')
        expect(minsToHrsMins(30)).toBe('00:30')
        expect(minsToHrsMins(60)).toBe('01:00')
        expect(minsToHrsMins(61)).toBe('01:01')
        expect(minsToHrsMins(5000)).toBe('83:20')
    })

    test('setVariableInterval', () => {
        // Mock callback
        const callback = jest.fn()

        // Get next interval callback
        let nextInterval = 0
        function * genNextInterval () {
            // Interval is 1 second longer everytime
            while (true) {
                yield nextInterval += 1000
            }
        }
        const gen = genNextInterval()
        const getNextInterval = () => gen.next().value || 1000

        // Set interval
        const clearInterval = setVariableInterval(callback, getNextInterval)
        expect(callback).not.toBeCalled()

        // Stop after 10 seconds
        setTimeout(clearInterval, 10000)
        
        // After 1 second
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(2000)
        expect(callback).toHaveBeenCalledTimes(1)
        // After 2 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(2000)
        expect(callback).toHaveBeenCalledTimes(1)
        // After 3 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(3000)
        expect(callback).toHaveBeenCalledTimes(2)
        // After 4 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(3000)
        expect(callback).toHaveBeenCalledTimes(2)
        // After 5 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(3000)
        expect(callback).toHaveBeenCalledTimes(2)
        // After 6 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(4000)
        expect(callback).toHaveBeenCalledTimes(3)
        // After 7 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(4000)
        expect(callback).toHaveBeenCalledTimes(3)
        // After 8 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(4000)
        expect(callback).toHaveBeenCalledTimes(3)
        // After 9 seconds
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(4000)
        expect(callback).toHaveBeenCalledTimes(3)
        // After 10 seconds: STOP
        jest.advanceTimersByTime(1000)
        expect(nextInterval).toBe(4000)
        expect(callback).toHaveBeenCalledTimes(3)
    })
})