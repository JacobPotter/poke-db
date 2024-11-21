import type {Meta, StoryObj} from '@storybook/react';
import {delay, http, HttpResponse} from 'msw';
import types from '../../../../test/fixtures/types.json'

import {TypesPage} from '../TypesPage.tsx';
import {MoveTypeProvider} from "../../../context/MoveTypeContext.tsx";

const meta = {
    component: TypesPage,
    decorators: [(Story) => (
        <MoveTypeProvider>
            <Story/>
        </MoveTypeProvider>
    )]
} satisfies Meta<typeof TypesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('/api/v1/type', async () => {
                    return HttpResponse.json(types);
                }),
            ],
        },
    },
};

export const WithLoading: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('/api/v1/type', async () => {
                    await delay(800)
                    return HttpResponse.json(types);
                }),
            ],
        },
    },
};
