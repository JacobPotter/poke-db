import {getMoveTypes} from "@/query/api/moveType.ts";
import {getPokemon} from "@/query/api/pokemon.ts";
import {QUERY_KEYS} from "@/query/constants.ts";
import {getEvolutionChain} from "@/query/api/evolution.ts";

export const MOVE_TYPE_DEFAULT_QUERY_OPTIONS = {
    queryKey: [QUERY_KEYS.moveType],
    queryFn: () => getMoveTypes()
};
export const getPokemonQueryOptions = (page: number, pokemonName?: string, pokemonTypeId?: string) => ({
    queryKey: [QUERY_KEYS.pokemon, {page, pokemonName, pokemonTypeId}],
    queryFn: () => getPokemon(page, pokemonName, pokemonTypeId),
})

export const getEvolutionChainQueryOptions = (pokemonId: number) => ({
    queryKey: [QUERY_KEYS.evolutionChain, {pokemonId}],
    queryFn: () => getEvolutionChain(pokemonId),
})
