import {MoveType} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {MouseEventHandler} from "react";

interface TypeListItemProps {
    type: MoveType,
    active?: boolean,
    index: number
    onTypeSelect: (index: number) => void
}

export const TypeListItem = ({
                                 type,
                                 active,
                                 index,
                                 onTypeSelect
                             }: TypeListItemProps) => {


    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        onTypeSelect(index);
    }

    return (<button onClick={handleClick}
                    className={`flex items-center justify-between bg-sky-500 px-3 py-2 rounded-lg shadow-lg ${!active ? "opacity-70" : ''}`}>
        <div className={'flex flex-col items-start justify-center'}>
            <h2
                className={'text-sm md:text-base font-bold'}>{capitalize(type.name)}</h2>
        </div>
        <img src={type.img_url} alt={type.name} className={'h-auto w-16 md:w-20'}/>
    </button>)
}