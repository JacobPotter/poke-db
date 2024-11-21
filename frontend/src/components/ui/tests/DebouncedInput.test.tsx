import {render} from 'vitest-browser-react'
import {userEvent} from '@vitest/browser/context'
import {describe, expect, it, vi} from 'vitest'
import DebouncedInput from '../DebouncedInput.tsx'

describe('DebouncedInput Component', () => {
    it('correctly delays onChange', async () => {
        let value = 0
        const {getByTestId} = render(<DebouncedInput
            value={value}
            onChange={v => {
                value = v
            }}
            className="test-input"
        />)

        const input = getByTestId('debounce-input')

        await userEvent.fill(input, '123')

        // Wait for less than our debounce time
        await vi.waitFor(() => expect(value).toBe(0), {timeout: 300})

        // After debounce time
        await vi.waitFor(() => expect(value).toBe(123), {timeout: 700})
    })

    it('inputs initial value correctly', () => {
        const initialValue = 999

        const {container} = render(<DebouncedInput
            value={initialValue}
            onChange={() => {
            }}
            className="test-input"
        />)

        const input = container.querySelector('input')!
        expect(input.getAttribute('value')).toBe(String(initialValue))
    })
})
