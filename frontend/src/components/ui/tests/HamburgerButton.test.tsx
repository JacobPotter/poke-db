import {render} from 'vitest-browser-react';
import {describe, expect, it, vi} from 'vitest';
import {HamburgerButton} from '../HamburgerButton.tsx';

describe('HamburgerButton', () => {
    it('toggles active class on click', async () => {
        const mockOnClick = vi.fn();
        const {getByRole} = render(<HamburgerButton onClick={mockOnClick} reset={false}/>);
        const button = getByRole('button');

        await button.click();
        expect(button.element().className).toContain('open');
        expect(mockOnClick).toHaveBeenCalled();

        await button.click();
        expect(button.element().className).not.toContain('open');
        expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('resets active state when reset prop changes', async () => {
        const mockOnClick = vi.fn();
        const {getByRole, rerender} = render(<HamburgerButton onClick={mockOnClick} reset={false}/>);
        const button = getByRole('button');

        await button.click();

        expect(button.element().className).toContain('open');

        rerender(<HamburgerButton onClick={mockOnClick} reset={true}/>);

        expect(button.element().className).not.toBeNull();
        expect(button.element().className).not.toContain('open');
    });
});
