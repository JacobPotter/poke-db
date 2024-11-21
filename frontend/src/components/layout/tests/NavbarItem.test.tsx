import {render} from 'vitest-browser-react'
import {describe, expect, it} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {NavbarItem} from '../NavbarItem.tsx'

describe('NavbarItem', () => {
    it('renders with the correct text', async () => {
        const {getByText} = render(
            <MemoryRouter initialEntries={['/home']}>
                <NavbarItem path="/home" text="Home"/>
            </MemoryRouter>
        )
        const linkElement = getByText("Home")
        expect(linkElement).not.toBeNull()
    })

    it('renders with the correct path', async () => {
        const {getByText} = render(
            <MemoryRouter initialEntries={['/home']}>
                <NavbarItem path="/home" text="Home"/>
            </MemoryRouter>
        )
        const linkElement = getByText("Home")
        const actualPath = linkElement.element().getAttribute('href')
        expect(actualPath).toBe('/home')
    })
})
