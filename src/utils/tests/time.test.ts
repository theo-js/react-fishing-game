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

    /*test('setVariableInterval', () => {
        // Mock callback
        const callback = jest.fn()

        // Get next interval callback
        let nextInterval = 0
        function * genNextInterval () {
            while (true) {
                yield nextInterval += 1000
            }
        }
        const gen = genNextInterval()
        const getNextInterval = () => gen.next().value || 1000

        // Set interval
        const clearInterval = setVariableInterval(callback, getNextInterval)
        expect(callback).not.toBeCalled()

        // Stop after 12 seconds
        setTimeout(clearInterval, 12000)
        
        jest.runAllTimers()

        //expect(nextInterval).toBe(10000)
        expect(callback).toHaveBeenCalledTimes(4)
    })*/
})