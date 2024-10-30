import {MoveType} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {SummaryItem} from "../ui/SummaryItem.tsx";

export const TypesSummary = ({moveType}: { moveType?: MoveType }) => {
    return moveType ?
        <div className={'flex flex-col h-full items-center justify-evenly md:justify-between font-mono'}>
            <div className="flex flex-row md:flex-col gap-6 justify-center items-center mb-2 md:mb-0 md:space-y-16"><h1
                className="text-xl md:text-3xl lg:text-5xl">Type: {capitalize(moveType.name)}</h1>
                <img src={moveType.img_url} alt={moveType.name}
                     className={'animate-pulse h-auto md:w-80'}/></div>
            <div className="grid grid-cols-2 gap-2">
                <SummaryItem className={'bg-emerald-700 col-start-1'}>
                    Double Damage to: {moveType.double_damage_to?.length ?? 0} types
                </SummaryItem>
                <SummaryItem className={'bg-amber-500 col-start-1'}>
                    Half Damage to: {moveType.half_damage_to?.length ?? 0} types
                </SummaryItem>
                <SummaryItem className={'bg-slate-900 col-start-1'}>
                    No Effect to: {moveType.no_damage_from?.length ?? 0} types
                </SummaryItem>
                <SummaryItem className={'bg-red-600 col-start-2 row-start-1'}>
                    Double Damage from: {moveType.double_damage_from?.length ?? 0} types
                </SummaryItem>
                <SummaryItem className={'bg-indigo-500 col-start-2 row-start-2'}>
                    Half Damage from: {moveType.half_damage_from?.length ?? 0} types
                </SummaryItem>
                <SummaryItem className={'bg-fuchsia-700 col-start-2 row-start-3'}>
                    No Effect from: {moveType.no_damage_from?.length ?? 0} types
                </SummaryItem>
            </div>
        </div> : <h1 className={'text-7xl'}>No Type Data</h1>
};