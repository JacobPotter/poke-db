import {getMoveTypes} from "@/query/api/moveType.ts";
import {DEFAULT_PAGE_SIZE, getPokemon, normalizePageSize} from "@/query/api/pokemon.ts";
import {QUERY_KEYS} from "@/query/constants.ts";
import {getEvolutionChain} from "@/query/api/evolution.ts";

export const MOVE_TYPE_DEFAULT_QUERY_OPTIONS = {
    queryKey: [QUERY_KEYS.moveType],
    queryFn: () => getMoveTypes()
};
export const getPokemonQueryOptions = (
    page: number,
    pokemonName?: string,
    pokemonTypeId?: string,
    pageSize: number = DEFAULT_PAGE_SIZE
) => {
    const validatedPageSize = normalizePageSize(pageSize);
    return {
        queryKey: [QUERY_KEYS.pokemon, {page, pokemonName, pokemonTypeId, pageSize: validatedPageSize}],
        queryFn: () => getPokemon(page, pokemonName, pokemonTypeId, validatedPageSize),
    };
};

export const getEvolutionChainQueryOptions = (pokemonId: number) => ({
    queryKey: [QUERY_KEYS.evolutionChain, {pokemonId}],
    queryFn: () => getEvolutionChain(pokemonId),
})
