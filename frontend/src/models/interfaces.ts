import {Pokemon} from "./pokemon.ts";

export interface PokemonResponse {
    pokemon: Pokemon[]
    page: number
    pageSize: number
    total: number
}

export interface ListPokemonParams {
    pokemonName: string | null
    pokemonType: string | null
}