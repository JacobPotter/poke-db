import {FC, useState} from "react";
import {useMoveTypes} from "@/query/hooks/useMoveTypes.ts";
import {capitalize} from "lodash";

export const TypesChart: FC = () => {
    const moveTypes = useMoveTypes();
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

    const standardTypes = moveTypes.filter(
        t => !["unknown", "shadow", "stellar"].includes(t.name.toLowerCase())
    );

    const getMultiplier = (attackerId: number, defenderId: number): { label: string; bg: string } => {
        const attacker = moveTypes.find(t => t.id === attackerId);
        if (!attacker) return {label: "1", bg: "bg-sky-950/40 text-sky-300/60"};

        if (attacker.double_damage_to?.includes(defenderId)) {
            return {label: "2x", bg: "bg-emerald-600 text-white font-bold"};
        }
        if (attacker.half_damage_to?.includes(defenderId)) {
            return {label: "½", bg: "bg-amber-600 text-white font-bold"};
        }
        if (attacker.no_damage_to?.includes(defenderId)) {
            return {label: "0", bg: "bg-slate-950 text-slate-400 font-bold"};
        }
        return {label: "1", bg: "bg-sky-900/40 text-sky-200/70"};
    };

    return (
        <section className="flex flex-col justify-between h-full w-full font-mono text-sky-50 p-1 sm:p-2">
            {/* Header */}
            <div className="border-b border-sky-600/50 pb-2 mb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>Type Effectiveness Matrix</span>
                    </h1>
                </div>
                <div className="text-xs text-sky-300 font-normal">
                    Attacker (Rows) vs Defender (Cols)
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mb-2 text-[11px] font-bold">
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white">2x Super Effective</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white">½x Resisted</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">0x Immune</span>
            </div>

            {/* Matrix Table */}
            <div
                className="overflow-auto flex-1 min-h-0 border border-sky-700/60 rounded-xl bg-sky-950/60 shadow-inner">
                <table className="w-full text-center border-collapse text-[10px] sm:text-xs">
                    <thead>
                    <tr className="sticky top-0 bg-sky-900 text-white z-10 border-b border-sky-700">
                        <th className="p-1 sm:p-1.5 font-bold sticky left-0 bg-sky-900 z-20">Atk \ Def</th>
                        {standardTypes.map(defType => (
                            <th key={defType.id} className="p-1 sm:p-1.5 font-bold truncate max-w-[36px]"
                                title={capitalize(defType.name)}>
                                {defType.name.slice(0, 3).toUpperCase()}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {standardTypes.map(atkType => {
                        const isSelected = selectedTypeId === atkType.id;
                        return (
                            <tr
                                key={atkType.id}
                                onClick={() => setSelectedTypeId(prev => prev === atkType.id ? null : atkType.id)}
                                className={`cursor-pointer transition-colors ${
                                    isSelected ? "bg-sky-800/80 ring-1 ring-amber-400" : "hover:bg-sky-800/40"
                                }`}
                            >
                                <td
                                    className={`p-1 font-bold sticky left-0 z-10 text-left pl-2 ${
                                        isSelected ? "bg-sky-800 text-amber-300" : "bg-sky-950/90 text-sky-200"
                                    }`}
                                >
                                    {capitalize(atkType.name)}
                                </td>
                                {standardTypes.map(defType => {
                                    const {label, bg} = getMultiplier(atkType.id, defType.id);
                                    return (
                                        <td key={defType.id} className="p-0.5">
                                            <div className={`w-full py-0.5 sm:py-1 rounded ${bg}`}>
                                                {label}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
