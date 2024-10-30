import React from "react";
import {Pokemon} from "../../models/pokemon.ts";
import {PokemonListItem} from "./PokemonListItem.tsx";

interface PokemonListProps {
    pokemon: Pokemon[];
    listIndex: number;
    onPokemonSelect: (index: number) => void;
}

export const PokemonList: React.FC<PokemonListProps> = ({pokemon, listIndex, onPokemonSelect}) => {

    return (<div
        className={`grid grid-cols-3 md:grid-cols-2 items-stretch justify-center gap-x-3 gap-y-2 md:gap-y-3`}>
        {pokemon.map((pokemon, index) => {
            return <PokemonListItem onPokemonSelect={onPokemonSelect} key={`${pokemon.name}_list_item`} index={index}
                                    active={index === listIndex} pokemon={pokemon}/>
        })}
    </div>)
}