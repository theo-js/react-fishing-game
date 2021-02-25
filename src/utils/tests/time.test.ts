import { minsToHrsMins } from '../time'

describe('time module', () => {
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
})