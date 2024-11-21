import {describe, expect, it} from 'vitest'
import {render} from "vitest-browser-react"
import {SummaryItem} from '../SummaryItem.tsx'

describe('SummaryItem', () => {

    it('renders without throwing', () => {
        const {getByText} = render(<SummaryItem>Hello, world!</SummaryItem>)

        expect(getByText('Hello, world!')).toBeTruthy()
    })

    it('applies className', () => {
        const {getByText} = render(
            <SummaryItem className='test-class'>Hello, world!</SummaryItem>
        )

        const element = getByText('Hello, world!')

        expect(element.element().className).toContain('test-class')
    })

    it('renders children', () => {
        const {getByText} = render(<SummaryItem>Hello, Vitest!</SummaryItem>)

        expect(getByText('Hello, Vitest!')).toBeTruthy()
    })

})
