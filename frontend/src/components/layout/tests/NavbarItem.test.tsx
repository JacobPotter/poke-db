import {render} from '@/test/utils'
import {describe, expect, it} from 'vitest'
import {NavbarItem} from '../NavbarItem.tsx'

describe('NavbarItem', () => {
    it('renders with the correct text', async () => {
        const {getByText} = render(
            <NavbarItem path="/home" text="Home"/>
        )
        const linkElement = getByText("Home")
        expect(linkElement).not.toBeNull()
    })

    it('renders with the correct path', async () => {
        const {getByText} = render(
            <NavbarItem path="/home" text="Home"/>
        )
        const linkElement = getByText("Home")
        const actualPath = linkElement.element().getAttribute('href')
        expect(actualPath).toBe('/home')
    })
})
