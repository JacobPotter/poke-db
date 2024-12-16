// DarkModeContext.test.tsx
import {FC, useContext} from 'react'
import {describe, expect, it} from 'vitest'
import {render} from '@/test/utils'
import {DarkModeContext, DarkModeProvider} from '../DarkModeContext.tsx'

describe('DarkModeProvider', () => {
    it('initializes with dark mode true and toggles on invoking toggleDarkMode', async () => {
        // Arrange
        const TestComponent: FC = () => {
            const {dark, toggleDarkMode} = useContext(DarkModeContext);
            const onClick = () => {
                toggleDarkMode();
            }
            return (<button onClick={onClick}>{dark ? 'Dark Mode' : 'Light Mode'}</button>);
        }

        // Act
        const {getByText} = render(
            <DarkModeProvider>
                <TestComponent/>
            </DarkModeProvider>,
        );


        // Assert
        expect(getByText('Dark Mode')).toBeTruthy();

        // Act
        await getByText('Dark Mode').click();

        // Assert
        expect(getByText('Light Mode')).toBeTruthy();
    });
});
