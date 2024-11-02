import {FormEventHandler, useContext} from "react";
import {MoveTypeContext} from "../../context/MoveTypeContext.tsx";
import {capitalize} from "lodash";
import {ListPokemonParams} from "../../models/pokemon.ts";

export const FilterForm = ({onSubmit}: { onSubmit: (params: ListPokemonParams) => void }) => {

    const {moveTypes} = useContext(MoveTypeContext)

    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const pokemonName = formData.get('pokemonName');
        let pokemonType = formData.get('pokemonType');

        if (pokemonType === '-') {
            pokemonType = null
        }

        onSubmit({
            pokemonName: pokemonName !== "" ? (pokemonName as string).toLowerCase() : null,
            pokemonTypeId: moveTypes.find(moveType => moveType.name.toLowerCase() === pokemonType?.toString().toLowerCase())?.id ?? null,
        })
    };

    return <form onSubmit={handleSubmit} className={'flex flex-col gap-2 '}>
        <h1 className={'hidden sm:block text-2xl md:text-4xl'}>Filter Pokemon</h1>
        <label htmlFor={'pokemonName'} className={'text-sm sm:text-xl'}>Pokemon Name</label>
        <input id={'pokemonName'} name={'pokemonName'} className={'bg-sky-500 md:p-4 rounded-lg shadow'}/>
        <label htmlFor={'pokemonType'} className={'text-sm sm:text-xl'}>Pokemon Type</label>
        <select id={'pokemonType'} name={'pokemonType'} className={'bg-sky-500 md:p-4 rounded-lg shadow'}>
            <option value={'-'}>-</option>
            {moveTypes.map((moveType) => (
                <option key={moveType.id + 'option'} value={moveType.name}>
                    {capitalize(moveType.name)}
                </option>
            ))}
        </select>
        <button
            className={'py-1 sm:p-3 bg-sky-600 md:mt-6 rounded-lg shadow-md active:bg-sky-500 hover:bg-sky-500'}>Filter
        </button>
    </form>;

};