import React from "react";
import {Pokemon} from "../../models/pokemon.ts";
import {PokemonListItem} from "./PokemonListItem.tsx";

interface PokemonListProps {
    pokemon: Pokemon[];
    pokemonId: string | undefined;
    onPokemonSelect: (pokemonId: number) => void;
}

export const PokemonList: React.FC<PokemonListProps> = ({pokemon, pokemonId, onPokemonSelect}) => {

    return (<div
        className={`grid grid-cols-4 md:grid-cols-2 items-center justify-center gap-x-3 gap-y-1.5 md:gap-y-3`}>
        {pokemon.map((pokemon, index) => {
            return <PokemonListItem onPokemonSelect={onPokemonSelect} key={`${pokemon.name}_list_item`}
                                    active={pokemonId ? pokemon.id === parseInt(pokemonId) : index === 0}
                                    pokemon={pokemon}/>
        })}
    </div>)
}