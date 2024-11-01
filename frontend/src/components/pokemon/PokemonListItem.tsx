import {Pokemon} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {MouseEventHandler} from "react";

interface PokemonListItemProps {
    pokemon: Pokemon,
    active?: boolean,
    onPokemonSelect: (pokemonId: number) => void
}

export const PokemonListItem = ({
                                    pokemon,
                                    onPokemonSelect,
                                    active,

                                }: PokemonListItemProps) => {

    const handleSelect: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        onPokemonSelect(pokemon.id)
    }

    return (<button
        onClick={handleSelect}
        className={`flex items-center justify-between lg:space-x-3 bg-sky-500 sm:px-2 sm:py-1 md:px-4 md:py-2.5 rounded-lg shadow-lg ${!active ? "opacity-70" : ''}`}>
        <div className={'flex flex-col items-start justify-center space-y-1'}>
            <h2 className={'hidden md:block text-xs lg:text-md font-bold'}>{capitalize(pokemon.name)}</h2>
            <img className={'hidden md:block w-16 lg:w-20 h-auto'} src={pokemon.primary_type.img_url}
                 alt={pokemon.primary_type.name}/>
            {pokemon.secondary_type &&
                <img className={'hidden md:block w-16 lg:w-20 h-auto'} src={pokemon.secondary_type.img_url}
                     alt={pokemon.secondary_type.name}/>}
        </div>
        <img src={pokemon.sprite_url} alt={pokemon.name} className={'h-auto w-12 sm:w-16 mx-auto'}/>
    </button>)
}