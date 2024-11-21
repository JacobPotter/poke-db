// DarkModeButton.test.tsx
import {describe, expect, it, vi} from 'vitest'
import {render} from 'vitest-browser-react'
import {DarkModeButton} from '../DarkModeButton.tsx'
import {DarkModeContext} from '../../../context/DarkModeContext.tsx'

describe('DarkModeButton', async () => {
    it('renders a dark mode button and responds to a click event by toggling theme', async () => {
        const toggleDarkMode = vi.fn()

        const {container} = render(
            <DarkModeContext.Provider value={{dark: false, toggleDarkMode}}>
                <DarkModeButton/>
            </DarkModeContext.Provider>,
        )

        const button = container.querySelector('button')


        expect(button).toBeTruthy()

        const lightIcon = container.querySelector('#theme-toggle-light-icon')
        const darkIcon = container.querySelector('#theme-toggle-dark-icon')

        // Check correct light theme icon is displayed
        expect(lightIcon).toBeTruthy()
        expect(darkIcon).not.toBeTruthy()

        // Simulate button click
        button?.click()

        // Check if toggleDarkMode is called upon clicking the button
        expect(toggleDarkMode).toHaveBeenCalled()
    })
})
