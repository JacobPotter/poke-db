import {MoveType} from "../../models/pokemon.ts";
import {capitalize} from "lodash";
import {useMoveTypes} from "@/query/hooks/useMoveTypes.ts";
import {FC} from "react";

interface DamageGroupProps {
    title: string;
    multiplier: string;
    typeIds?: number[];
    allTypes: MoveType[];
    bgColor: string;
    badgeBg: string;
}

const DamageGroup: FC<DamageGroupProps> = ({
                                               title,
                                               multiplier,
                                               typeIds = [],
                                               allTypes,
                                               bgColor,
                                               badgeBg
                                           }) => {
    const matchedTypes = (typeIds || [])
        .map(id => allTypes.find(t => t.id === id))
        .filter((t): t is MoveType => Boolean(t));

    return (
        <div className={`flex flex-col gap-1.5 p-2 rounded-xl ${bgColor} text-white shadow-sm border border-white/10`}>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span>{title}</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 text-[11px] font-mono">{multiplier}</span>
            </div>
            {matchedTypes.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5 max-h-20 overflow-y-auto">
                    {matchedTypes.map((type) => (
                        <span
                            key={type.id}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badgeBg} text-white shadow-xs truncate`}
                        >
                            {capitalize(type.name)}
                        </span>
                    ))}
                </div>
            ) : (
                <span className="text-[11px] text-white/60 italic font-mono">None (0 types)</span>
            )}
        </div>
    );
};

export const TypesSummary = ({moveType}: { moveType?: MoveType }) => {
    const allMoveTypes = useMoveTypes();

    if (!moveType) {
        return (
            <div className="flex items-center justify-center h-full">
                <h1 className="text-4xl sm:text-6xl font-bold font-mono text-sky-200">No Type Data</h1>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-between font-mono text-sky-50 p-1 sm:p-2">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-sky-600/50 pb-2 mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>Type: {capitalize(moveType.name)}</span>
                </h1>
                <div className="flex items-center justify-center">
                    <img
                        src={moveType.img_url}
                        alt={moveType.name}
                        className="h-7 sm:h-9 w-auto object-contain drop-shadow"
                    />
                </div>
            </div>

            {/* Damage Relations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-[460px] pr-0.5">
                {/* Attacking / Damage To */}
                <div className="flex flex-col gap-2">
                    <span
                        className="text-xs uppercase font-bold tracking-wider text-sky-300">Offensive (Attacking)</span>
                    <DamageGroup
                        title="Double Damage To"
                        multiplier="2x"
                        typeIds={moveType.double_damage_to}
                        allTypes={allMoveTypes}
                        bgColor="bg-emerald-800/80"
                        badgeBg="bg-emerald-600"
                    />
                    <DamageGroup
                        title="Half Damage To"
                        multiplier="0.5x"
                        typeIds={moveType.half_damage_to}
                        allTypes={allMoveTypes}
                        bgColor="bg-amber-800/80"
                        badgeBg="bg-amber-600"
                    />
                    <DamageGroup
                        title="No Effect To"
                        multiplier="0x"
                        typeIds={moveType.no_damage_to}
                        allTypes={allMoveTypes}
                        bgColor="bg-slate-800/90"
                        badgeBg="bg-slate-700"
                    />
                </div>

                {/* Defending / Damage From */}
                <div className="flex flex-col gap-2">
                    <span
                        className="text-xs uppercase font-bold tracking-wider text-sky-300">Defensive (Defending)</span>
                    <DamageGroup
                        title="Double Damage From"
                        multiplier="2x"
                        typeIds={moveType.double_damage_from}
                        allTypes={allMoveTypes}
                        bgColor="bg-red-800/80"
                        badgeBg="bg-red-600"
                    />
                    <DamageGroup
                        title="Half Damage From"
                        multiplier="0.5x"
                        typeIds={moveType.half_damage_from}
                        allTypes={allMoveTypes}
                        bgColor="bg-indigo-800/80"
                        badgeBg="bg-indigo-600"
                    />
                    <DamageGroup
                        title="No Effect From"
                        multiplier="0x"
                        typeIds={moveType.no_damage_from}
                        allTypes={allMoveTypes}
                        bgColor="bg-fuchsia-900/80"
                        badgeBg="bg-fuchsia-700"
                    />
                </div>
            </div>
        </div>
    );
};
