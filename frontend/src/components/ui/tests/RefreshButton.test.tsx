// RefreshButton.test.tsx
import {describe, expect, it, vi} from 'vitest'
import {render} from 'vitest-browser-react'
import {RefreshButton} from '../RefreshButton.tsx'
import {DarkModeContext} from '@/context/DarkModeContext.tsx'

describe('RefreshButton', () => {
    it('renders a tactile refresh button and triggers onClick callback when clicked', async () => {
        const mockRefresh = vi.fn()

        const {container} = render(
            <DarkModeContext.Provider value={{dark: false, toggleDarkMode: vi.fn()}}>
                <RefreshButton onClick={mockRefresh} ariaLabel="Refresh Pokemon Data" title="Refresh Pokemon Data"/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button')
        expect(button).toBeTruthy()
        expect(button?.getAttribute('aria-label')).toBe('Refresh Pokemon Data')
        expect(button?.getAttribute('title')).toBe('Refresh Pokemon Data')

        const svg = container.querySelector('svg')
        expect(svg).toBeTruthy()

        button?.click()
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it('applies dark mode themed styling in dark mode', () => {
        const {container} = render(
            <DarkModeContext.Provider value={{dark: true, toggleDarkMode: vi.fn()}}>
                <RefreshButton/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-slate-950')

        const knob = button?.querySelector('span')
        expect(knob?.className).toContain('from-amber-300')
    })

    it('applies light mode themed styling in light mode', () => {
        const {container} = render(
            <DarkModeContext.Provider value={{dark: false, toggleDarkMode: vi.fn()}}>
                <RefreshButton/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button')
        expect(button?.className).toContain('bg-red-950')

        const knob = button?.querySelector('span')
        expect(knob?.className).toContain('from-slate-200')
    })

    it('respects disabled state', () => {
        const mockRefresh = vi.fn()
        const {container} = render(
            <DarkModeContext.Provider value={{dark: false, toggleDarkMode: vi.fn()}}>
                <RefreshButton onClick={mockRefresh} disabled={true}/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button') as HTMLButtonElement
        expect(button.disabled).toBe(true)
        button.click()
        expect(mockRefresh).not.toHaveBeenCalled()
    })
})
