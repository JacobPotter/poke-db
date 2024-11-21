import {describe, expect, it} from 'vitest'
import {render} from 'vitest-browser-react'
import {MemoryRouter} from 'react-router-dom'
import {Navbar} from '../Navbar.tsx'

describe('Navbar', () => {
    it('toggles the state on hamburger click', async () => {
        const {getByTestId} = render(
            <MemoryRouter initialEntries={['/']}>
                <Navbar/>
            </MemoryRouter>
        )
        const button = getByTestId('hamburger-button')
        await button.click()

        expect(getByTestId('mobile-pokemon-menu-item')).toBeTruthy()
        expect(getByTestId('mobile-types-menu-item')).toBeTruthy()
        expect(getByTestId('mobile-evolutions-menu-item')).toBeTruthy()
        expect(getByTestId('mobile-moves-menu-item')).toBeTruthy()
    })

    it('should clear the menu on link click', async () => {
        const {getByTestId} = render(
            <MemoryRouter initialEntries={['/']}>
                <Navbar/>
            </MemoryRouter>
        )
        const button = getByTestId('hamburger-button')
        await button.click()

        const link = getByTestId('mobile-pokemon-menu-item')
        await link.click()


        expect(getByTestId('mobile-pokemon-menu-item').element().checkVisibility()).toBe(false)
        expect(getByTestId('mobile-types-menu-item').element().checkVisibility()).toBe(false)
        expect(getByTestId('mobile-evolutions-menu-item').element().checkVisibility()).toBe(false)
        expect(getByTestId('mobile-moves-menu-item').element().checkVisibility()).toBe(false)
    })
})
