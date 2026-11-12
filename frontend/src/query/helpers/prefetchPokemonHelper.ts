import {QueryClient} from "@tanstack/react-query";
import {getPokemonQueryOptions} from "@/query/keyFactories.ts";
import {getImagesQueryOptions} from "@/query/api/images.ts";
import {DEFAULT_PAGE_SIZE, normalizePageSize} from "@/query/api/pokemon.ts";

export function prefetchPokemonHelper(
    queryClient: QueryClient,
    newPage: number,
    pokemonName: string | undefined,
    pokemonTypeId: string | undefined,
    pageSize: number = DEFAULT_PAGE_SIZE
) {
    const validatedPageSize = normalizePageSize(pageSize);
    queryClient.fetchQuery({
        ...getPokemonQueryOptions(newPage, pokemonName, pokemonTypeId, validatedPageSize),
        queryKey: getPokemonQueryOptions(newPage, pokemonName, pokemonTypeId, validatedPageSize).queryKey,
    }).then(data => {
        if (data.pokemon && data.pokemon.length > 0) {
            const imageUrls = data.pokemon.map(p => {
                if (p.varieties && p.varieties[0]?.sprite_url) {
                    return p.varieties[0].sprite_url;
                }
                return undefined;
            });

            const validImageUrls = imageUrls.filter((i): i is string => i !== undefined);

            if (validImageUrls.length > 0) {
                queryClient.prefetchQuery(getImagesQueryOptions(validImageUrls));
            }
        }
    });
}
