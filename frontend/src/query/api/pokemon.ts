import axios from "axios";
import {ListPokemonResponse} from "@/models/pokemon.ts";

export const getPokemon = async (page: number, pokemonName?: string, pokemonTypeId?: string) => {
    const {data} = await axios.get<ListPokemonResponse>(`/api/v1/pokemon`, {
        params: {
            page,
            pokemonName,
            pokemonTypeId,
            pageSize: 12
        }
    });

    return {
        pokemon: data?.pokemon ?? [],
        total: data?.total ?? 0,
        pageSize: data?.pageSize ?? 12,
        pokemonName: data?.params?.pokemonName,
        pokemonTypeId: data?.params?.pokemonTypeId
    };
}
