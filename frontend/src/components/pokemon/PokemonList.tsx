import React from "react";
import {PokemonSpecies} from "@/models/pokemon.ts";
import {PokemonListItem} from "./PokemonListItem.tsx";

interface PokemonListProps {
    pokemon: PokemonSpecies[];
    pokemonId: string | undefined;
    onPokemonSelect: (pokemonId: number) => void;
}

export const PokemonList: React.FC<PokemonListProps> = ({pokemon, pokemonId, onPokemonSelect}) => {
    return (
        <div
            className="grid grid-cols-3 gap-2 sm:gap-2.5 p-1 sm:p-2">
            {pokemon.map((p, index) => {
                const isActive = pokemonId ? p.id === parseInt(pokemonId, 10) : index === 0;
                return (
                    <PokemonListItem
                        onPokemonSelect={onPokemonSelect}
                        key={`${p.name}_${p.id}_list_item`}
                        active={isActive}
                        pokemonSpecies={p}
                    />
                );
            })}
        </div>
    );
};
