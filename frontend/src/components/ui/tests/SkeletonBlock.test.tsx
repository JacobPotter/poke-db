import {describe, expect, it} from 'vitest'
import {render} from 'vitest-browser-react'
import {SkeletonBlock} from '../Skeletons.tsx'

describe('SkeletonBlock Function', () => {
    it('renders with default props', async () => {
        const {container} = render(<SkeletonBlock/>)
        expect(container.firstElementChild?.className).toContain('px-3 py-2 w-full h-10 sm:h-12 rounded-xl bg-sky-800 opacity-80')
    })

    it('renders with thick prop', async () => {
        const {container} = render(<SkeletonBlock thick/>)
        expect(container.firstElementChild?.className).toContain('px-3 py-2 w-full h-12 sm:h-20 rounded-xl bg-sky-800 opacity-80')
    })

    it('renders with withIcon prop', async () => {
        const {container} = render(<SkeletonBlock withIcon/>)
        const divs = container.firstElementChild?.children
        expect(divs?.length).toBe(1)
        expect(divs?.[0].className).toContain('flex items-center justify-between gap-2')
    })

    it('renders with thick and withIcon prop', async () => {
        const {container} = render(<SkeletonBlock thick withIcon/>)
        const divs = container.firstElementChild?.children
        expect(divs?.length).toBe(1)
        expect(divs?.[0].className).toContain('flex items-center justify-between gap-2')
        const iconDivs = divs?.[0].children
        expect(iconDivs?.[1]?.className).toContain('mx-auto rounded-full bg-sky-600 h-8 w-8 sm:h-12 sm:w-12')
    })
})
