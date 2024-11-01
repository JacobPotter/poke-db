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
                    className={`flex items-center justify-between bg-sky-500 p-1 xs:px-3 xs:py-2 md:px-4 md:py-2.5 rounded-lg shadow-lg ${!active ? "opacity-70" : ''}`}>
        <h2
            className={'text-xs sm:text-sm lg:text-base font-bold'}>{capitalize(type.name)}</h2>
        <img src={type.img_url} alt={type.name} className={'h-auto w-12 sm:w-16 lg:w-20'}/>
    </button>)
}