import type {Meta, StoryObj} from '@storybook/react';

import {PokemonPage} from './PokemonPage.tsx';
import {delay, http, HttpResponse} from "msw";
import pokemon_page_1 from "../../fixtures/pokemon_page_1.json";
import pokemon_page_2 from "../../fixtures/pokemon_page_2.json";
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
                    return HttpResponse.json(pokemon_page_1);
                }),
                http.get('/api/v1/pokemon?page=2&pageSize=12', async () => {
                    return HttpResponse.json(pokemon_page_2);
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
                    await delay(2800)
                    return HttpResponse.json(pokemon_page_1);
                }),
            ],
        },
    },
};