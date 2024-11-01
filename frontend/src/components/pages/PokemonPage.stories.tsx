import type {Meta, StoryObj} from '@storybook/react';

import {PokemonPage} from './PokemonPage.tsx';
import {delay, http, HttpResponse} from "msw";
import pokemon1_10 from "../../fixtures/pokemon1-10.json";
import pokemon11_20 from "../../fixtures/pokemon-11-20.json";
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
                http.get('/api/v1/pokemon?page=1&pageSize=12', async () => {
                    return HttpResponse.json(pokemon1_10);
                }),
                http.get('/api/v1/pokemon?page=2&pageSize=12', async () => {
                    return HttpResponse.json(pokemon11_20);
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
                    return HttpResponse.json(pokemon1_10);
                }),
            ],
        },
    },
};