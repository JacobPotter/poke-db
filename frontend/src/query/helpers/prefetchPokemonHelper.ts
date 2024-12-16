import {QueryClient} from "@tanstack/react-query";
import {getPokemonQueryOptions} from "@/query/keyFactories.ts";
import {getImagesQueryOptions} from "@/query/api/images.ts";

export function prefetchPokemonHelper(queryClient: QueryClient, newPage: number, pokemonName: string | undefined, pokemonTypeId: string | undefined) {
    queryClient.fetchQuery({
        ...getPokemonQueryOptions(newPage, pokemonName, pokemonTypeId),
        queryKey: getPokemonQueryOptions(newPage, pokemonName, pokemonTypeId).queryKey,
    }).then(data => {
        if (data.pokemon && data.pokemon.length > 0) {
            let imageUrls = data.pokemon.map(p => {
                if (p.varieties && p.varieties[0].sprite_url) {
                    return p.varieties[0].sprite_url;
                } else {
                    return
                }
            })

            imageUrls = imageUrls.filter(i => i !== undefined)

            queryClient.prefetchQuery(getImagesQueryOptions(imageUrls as string[]))
        }
    })
}
