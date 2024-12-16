import {QueryClient} from "@tanstack/react-query";
import {LoaderFunctionArgs} from "react-router-dom";
import {MoveType, PokemonSpecies} from "@/models/pokemon.ts";
import {getPokemonQueryOptions, MOVE_TYPE_DEFAULT_QUERY_OPTIONS} from "@/query/keyFactories.ts";
import {getImagesQueryOptions} from "@/query/api/images.ts";

export const loader =
    (queryClient: QueryClient) =>
        async ({request}: LoaderFunctionArgs) => {
            const url = new URL(request.url)
            const page = url.searchParams.get("page") ?? "1"
            const pokemonName = url.searchParams.get("pokemonName") ?? undefined
            const pokemonTypeId = url.searchParams.get("pokemonTypeId") ?? undefined
            const pokemonId = url.searchParams.get("pokemonId") ?? undefined


            const pokemonData = queryClient.getQueryData<{
                    pokemon: PokemonSpecies[],
                    total: number,
                    pageSize: number
                }>(getPokemonQueryOptions(parseInt(page), pokemonName, pokemonTypeId).queryKey) ??
                (await queryClient.fetchQuery(getPokemonQueryOptions(parseInt(page), pokemonName, pokemonTypeId)));

            if (pokemonData?.pokemon && pokemonData.pokemon.length > 0 && pokemonId) {
                let imageUrls = pokemonData.pokemon.map(p => {
                    if (p.varieties && p.varieties[0].sprite_url) {
                        return p.varieties[0].sprite_url;
                    } else {
                        return
                    }
                })

                imageUrls = imageUrls.filter(i => i !== undefined)

                await queryClient.prefetchQuery(getImagesQueryOptions(imageUrls as string[]))

            }


            const moveTypesData = queryClient.getQueryData<MoveType[]>(MOVE_TYPE_DEFAULT_QUERY_OPTIONS.queryKey) ??
                (await queryClient.fetchQuery(MOVE_TYPE_DEFAULT_QUERY_OPTIONS));


            return {moveTypesData, pokemonData}
        }
