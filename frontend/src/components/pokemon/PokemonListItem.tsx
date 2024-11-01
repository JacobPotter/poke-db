import {PokemonSpecies} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {MouseEventHandler} from "react";

interface PokemonListItemProps {
    pokemonSpecies: PokemonSpecies,
    active?: boolean,
    onPokemonSelect: (pokemonId: number) => void
}

export const PokemonListItem = ({
                                    pokemonSpecies,
                                    onPokemonSelect,
                                    active,

                                }: PokemonListItemProps) => {


    const pokemon = pokemonSpecies.varieties[0];


    const handleSelect: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        pokemon ? onPokemonSelect(pokemon.id) : console.error("No default variety found")

    }

    return (<button
        onClick={handleSelect}
        className={`flex items-center justify-between lg:space-x-3 bg-sky-500 sm:px-2 sm:py-1 md:px-3 rounded-lg shadow-lg ${!active ? "opacity-70" : ''}`}>
        <h2 className={'hidden md:block text-xs lg:text-md font-bold'}>{capitalize(pokemon?.name)}</h2>
        <img src={pokemon?.sprite_url} alt={pokemon?.name} className={'h-auto w-12 sm:w-16 md:w-[4.75rem] mx-auto'}/>
    </button>)
}