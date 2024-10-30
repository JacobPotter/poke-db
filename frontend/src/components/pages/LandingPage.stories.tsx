import type {Meta, StoryObj} from '@storybook/react';

import {LandingPage} from './LandingPage.tsx';
import {MemoryRouter} from "react-router-dom";

const meta = {
    component: LandingPage,
    decorators: [(Story) => (
        <div className={'h-screen'}>
            <MemoryRouter initialEntries={['/']}>
                <Story/>
            </MemoryRouter>
        </div>
    )]
} satisfies Meta<typeof LandingPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};