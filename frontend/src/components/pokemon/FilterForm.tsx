import {ListPokemonParams} from "../../models/interfaces.ts";
import {FormEventHandler, useContext} from "react";
import {MoveTypeContext} from "../../context/MoveTypeContext.tsx";
import {capitalize} from "lodash";

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
            pokemonName: pokemonName && (pokemonName as string).toLowerCase(),
            pokemonType: pokemonType && pokemonType as string,
        })
    };

    return <form onSubmit={handleSubmit} className={'flex flex-col gap-2 '}>
        <h1 className={'text-3xl md:text-4xl'}>Filter Pokemon</h1>
        <label htmlFor={'pokemonName'} className={'text-xl'}>Pokemon Name</label>
        <input id={'pokemonName'} name={'pokemonName'} className={'bg-sky-500 p-4 rounded-lg shadow'}/>
        <label htmlFor={'pokemonType'} className={'text-xl'}>Pokemon Type</label>
        <select id={'pokemonType'} name={'pokemonType'} className={'bg-sky-500 p-4 rounded-lg shadow'}>
            <option value={'-'}>-</option>
            {moveTypes.map((moveType) => (
                <option key={moveType.id + 'option'} value={moveType.name}>
                    {capitalize(moveType.name)}
                </option>
            ))}
        </select>
        <button className={'p-3 bg-sky-600 mt-6 rounded-lg shadow-md'}>Filter</button>
    </form>;

};