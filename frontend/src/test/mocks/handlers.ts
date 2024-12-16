import {http, HttpResponse, passthrough} from "msw";
import {mockMoveTypeResponse} from "@/test/mocks/moveTypes.ts";

import mockPokemonResponse from "@/test/fixtures/pokemon_page_1.json"
import mockEeveeResponse from '@/test/fixtures/eevee_chain.json'
import mockEvolutionChainResponse from "@/test/fixtures/ivysaur_chain.json"
import {EEVEE_EVOLUTIONS} from "@/constants/evolutions.ts";


export const handlers = [
    http.get("/api/v1/type", () => {
        return HttpResponse.json(mockMoveTypeResponse);
    }),
    http.get("api/v1/pokemon", () => {
        return HttpResponse.json(mockPokemonResponse);
    }),
    http.get("/api/v1/evolution/chain/:id", (responseResolver) => {
        const url = responseResolver.request.url
        const pokemonId = url.split("/").pop() ?? "1"

        if (EEVEE_EVOLUTIONS.includes(parseInt(pokemonId))) {
            return HttpResponse.json(mockEeveeResponse)
        } else {
            return HttpResponse.json(mockEvolutionChainResponse);
        }

    }),
    http.get("https://raw.githubusercontent.com/*", () => {
        return passthrough()
    })
];
