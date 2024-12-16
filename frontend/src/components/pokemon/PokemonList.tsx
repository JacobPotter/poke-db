import React from "react";
import {PokemonSpecies} from "../../models/pokemon.ts";
import {PokemonListItem} from "./PokemonListItem.tsx";

interface PokemonListProps {
    pokemon: PokemonSpecies[];
    pokemonId: string | undefined;
    onPokemonSelect: (pokemonId: number) => void;
}

export const PokemonList: React.FC<PokemonListProps> = ({pokemon, pokemonId, onPokemonSelect}) => {

    return (<div
        className={`grid grid-cols-4 md:grid-cols-2 items-center justify-center gap-0.5 xs:gap-2 sm:gap-x-3 sm:gap-y-1.5 md:gap-3 lg:gap-5 xl:gap-6 2xl:gap-8 p-1 sm:p-2 md:p-3 lg:p-4 xl:p-6 2xl:p-8`}>
        {pokemon.map((pokemon, index) => {
            return <PokemonListItem onPokemonSelect={onPokemonSelect} key={`${pokemon.name}_list_item`}
                                    active={pokemonId ? pokemon.id === parseInt(pokemonId) : index === 0}
                                    pokemonSpecies={pokemon}/>
        })}
    </div>)
}
