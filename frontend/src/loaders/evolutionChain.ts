import {QueryClient} from "@tanstack/react-query";
import {LoaderFunctionArgs} from "react-router-dom";
import {getEvolutionChainQueryOptions} from "@/query/keyFactories.ts";
import {EvolutionChainLink} from "@/models/evolution.ts";
import {EEVEE_EVOLUTIONS} from "@/constants/evolutions.ts";
import {getImagesQueryOptions} from "@/query/api/images.ts";

export const loader = (queryClient: QueryClient) => async ({request}: LoaderFunctionArgs) => {
    const url = new URL(request.url)
    let pokemonId = url.searchParams.get("pokemonId") ?? "1"

    if (EEVEE_EVOLUTIONS.includes(parseInt(pokemonId))) {
        pokemonId = "133"
    }

    const evolutionData = queryClient.getQueryData<EvolutionChainLink>(getEvolutionChainQueryOptions(parseInt(pokemonId)).queryKey) ?? (await queryClient.fetchQuery(getEvolutionChainQueryOptions(parseInt(pokemonId))));

    if (evolutionData) {
        const imageUrls: string[] = []

        if (evolutionData.evolvesFrom?.pokemonSpecies?.varieties &&
            evolutionData.evolvesFrom?.pokemonSpecies?.varieties.length > 0 &&
            evolutionData.evolvesFrom?.pokemonSpecies?.varieties[0].sprite_url) {
            imageUrls.push(evolutionData.evolvesFrom.pokemonSpecies.varieties[0].sprite_url)
        }

        if (evolutionData.evolvesTo && evolutionData.evolvesTo.length > 0) {
            const tempUrls = evolutionData.evolvesTo.map(e => {
                if (e.pokemonSpecies.varieties && e.pokemonSpecies.varieties[0].sprite_url) {
                    return e.pokemonSpecies.varieties[0].sprite_url
                } else {
                    return
                }
            }).filter(i => i !== undefined)

            imageUrls.push(...tempUrls)

        }

        await queryClient.prefetchQuery(getImagesQueryOptions(imageUrls))

    }

    return evolutionData
}
