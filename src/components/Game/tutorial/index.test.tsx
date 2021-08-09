import { LoadTutorial } from './index'
import { render } from '@testing-library/react'

describe('Tutorial components', () => {
    describe('LoadTutorial', () => {
        it('should return null when passed tutorial entry does not exist', () => {
            const Tutorial = render(<LoadTutorial entry="random string" />)
            expect(Tutorial).toBe(null)
        })
    })
})