import type {Meta, StoryObj} from '@storybook/react';

import {PokemonPage} from './PokemonPage.tsx';
import {delay, http, HttpResponse} from "msw";
import pokemon from "../../fixtures/pokemon.json";
import {reactRouterParameters, withRouter} from "storybook-addon-remix-react-router";


const meta = {
    component: PokemonPage,
    decorators: [withRouter],
    parameters: {
        reactRouter: reactRouterParameters({
            location: {
                pathParams: {id: '1'},
            },
            routing: {path: '/pokemon/:id'}
        }),
    },

} satisfies Meta<typeof PokemonPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('/api/v1/pokemon', async () => {
                    return HttpResponse.json(pokemon);
                }),
            ],
        },
    },
};

export const WithLoading: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get('/api/v1/pokemon', async () => {
                    await delay(800)
                    return HttpResponse.json(pokemon);
                }),
            ],
        },
    },
};