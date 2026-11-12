// DarkModeButton.test.tsx
import {describe, expect, it, vi} from 'vitest'
import {render} from 'vitest-browser-react'
import {DarkModeButton} from '../DarkModeButton.tsx'
import {DarkModeContext} from '../../../context/DarkModeContext.tsx'

describe('DarkModeButton', () => {
    it('renders a dark mode icon when in light mode and triggers toggle on click', async () => {
        const toggleDarkMode = vi.fn()

        const {container} = render(
            <DarkModeContext.Provider value={{dark: false, toggleDarkMode}}>
                <DarkModeButton/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button')
        expect(button).toBeTruthy()
        expect(button?.getAttribute('aria-label')).toBe('Switch to dark mode')

        const lightIcon = container.querySelector('#theme-toggle-light-icon')
        const darkIcon = container.querySelector('#theme-toggle-dark-icon')

        // In light mode, show dark/moon icon to allow switching to dark
        expect(darkIcon).toBeTruthy()
        expect(lightIcon).toBeNull()

        // Simulate button click
        button?.click()
        expect(toggleDarkMode).toHaveBeenCalledTimes(1)
    })

    it('renders a light mode icon when in dark mode', async () => {
        const toggleDarkMode = vi.fn()

        const {container} = render(
            <DarkModeContext.Provider value={{dark: true, toggleDarkMode}}>
                <DarkModeButton/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button')
        expect(button).toBeTruthy()
        expect(button?.getAttribute('aria-label')).toBe('Switch to light mode')

        const lightIcon = container.querySelector('#theme-toggle-light-icon')
        const darkIcon = container.querySelector('#theme-toggle-dark-icon')

        // In dark mode, show sun/light icon to allow switching to light
        expect(lightIcon).toBeTruthy()
        expect(darkIcon).toBeNull()
    })
})
