import {FC} from "react";
import {MoveType} from "@/models/pokemon.ts";
import {capitalize} from "lodash";
import {useMoveTypes} from "@/query/hooks/useMoveTypes.ts";
import {BoltIcon, ShieldCheckIcon} from "@heroicons/react/24/solid";

interface TypeDetailsProps {
    moveType?: MoveType;
}

export const TypeDetails: FC<TypeDetailsProps> = ({moveType}) => {
    const allMoveTypes = useMoveTypes();

    if (!moveType) {
        return (
            <div className="flex items-center justify-center h-full">
                <h1 className="text-3xl font-bold font-mono text-sky-200">No Type Selected</h1>
            </div>
        );
    }

    const typeName = capitalize(moveType.name);

    const superEffectiveAgainst = (moveType.double_damage_to || [])
        .map(id => allMoveTypes.find(t => t.id === id)?.name)
        .filter(Boolean) as string[];

    const resistedBy = (moveType.half_damage_to || [])
        .map(id => allMoveTypes.find(t => t.id === id)?.name)
        .filter(Boolean) as string[];

    const weakAgainst = (moveType.double_damage_from || [])
        .map(id => allMoveTypes.find(t => t.id === id)?.name)
        .filter(Boolean) as string[];

    const resists = (moveType.half_damage_from || [])
        .map(id => allMoveTypes.find(t => t.id === id)?.name)
        .filter(Boolean) as string[];

    const immuneTo = (moveType.no_damage_from || [])
        .map(id => allMoveTypes.find(t => t.id === id)?.name)
        .filter(Boolean) as string[];

    return (
        <section className="flex flex-col justify-start gap-3 h-full w-full font-mono text-sky-50 p-1 sm:p-2">
            {/* Header */}
            <div className="border-b border-sky-600/50 pb-2 mb-1 flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>{typeName}</span>
                        <span className="text-sky-300 text-sm sm:text-base font-normal">Matchup Analysis</span>
                    </h1>
                </div>
                {moveType.img_url && (
                    <img src={moveType.img_url} alt={moveType.name} className="h-7 w-auto object-contain"/>
                )}
            </div>

            {/* Analysis cards */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 pr-0.5">
                {/* Offensive Profile */}
                <div
                    className="bg-sky-900/60 border border-sky-700/50 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                        <BoltIcon className="w-4 h-4"/>
                        <span>Offensive Strengths & Coverage</span>
                    </div>
                    <div className="text-xs text-sky-100">
                        <strong>Super Effective (2x):</strong>{" "}
                        {superEffectiveAgainst.length > 0
                            ? superEffectiveAgainst.map(capitalize).join(", ")
                            : "None"}
                    </div>
                    <div className="text-xs text-sky-200/80">
                        <strong>Resisted By (0.5x):</strong>{" "}
                        {resistedBy.length > 0 ? resistedBy.map(capitalize).join(", ") : "None"}
                    </div>
                </div>

                {/* Defensive Profile */}
                <div
                    className="bg-sky-900/60 border border-sky-700/50 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                        <ShieldCheckIcon className="w-4 h-4"/>
                        <span>Defensive Resistances & Vulnerabilities</span>
                    </div>
                    <div className="text-xs text-red-200">
                        <strong>Weaknesses (Takes 2x):</strong>{" "}
                        {weakAgainst.length > 0 ? weakAgainst.map(capitalize).join(", ") : "None"}
                    </div>
                    <div className="text-xs text-emerald-200">
                        <strong>Resistances (Takes 0.5x):</strong>{" "}
                        {resists.length > 0 ? resists.map(capitalize).join(", ") : "None"}
                    </div>
                    {immuneTo.length > 0 && (
                        <div className="text-xs text-fuchsia-200 font-semibold">
                            <strong>Immunities (Takes 0x):</strong> {immuneTo.map(capitalize).join(", ")}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
