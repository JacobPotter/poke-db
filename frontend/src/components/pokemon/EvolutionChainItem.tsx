import {FC, useState} from "react";
import {EvolutionChainLink, EvolutionDetails} from "../../models/evolution.ts";
import {Tooltip} from "../ui/Tooltip.tsx";
import {EvolutionInfo} from "./EvolutionInfo.tsx";
import {SkeletonIcon} from "@/components/ui/Skeletons.tsx";
import {capitalize} from "lodash";

export interface EvolutionChainItemProps {
    chainLink: Partial<EvolutionChainLink>;
    isActive?: boolean;
    onSelect?: (pokemonId: number) => void;
    className?: string;
    compact?: boolean;
    showTriggerBadge?: boolean;
}

function formatEvolutionTrigger(details?: EvolutionDetails[]): string | null {
    if (!details || details.length === 0) return null;
    const detail = details[0];
    if (!detail) return null;

    if (detail.trigger?.name === "level-up") {
        if (detail.minLevel && detail.minLevel > 0) {
            return `Lv. ${detail.minLevel}`;
        }
        if (detail.minHappiness) {
            if (detail.timeOfDay) {
                return `Friend (${capitalize(detail.timeOfDay)})`;
            }
            return `Friendship`;
        }
        if (detail.minAffection) {
            return `Affection`;
        }
        if (detail.location?.name) {
            return capitalize(detail.location.name.replace(/-/g, " "));
        }
        if (detail.heldItem?.name) {
            return `Hold ${capitalize(detail.heldItem.name.replace(/-/g, " "))}`;
        }
        if (detail.knownMove?.name) {
            return `Move: ${capitalize(detail.knownMove.name.replace(/-/g, " "))}`;
        }
        if (detail.timeOfDay) {
            return `Lv. Up (${capitalize(detail.timeOfDay)})`;
        }
        return `Level-Up`;
    }

    if (detail.trigger?.name === "use-item") {
        if (detail.item?.name) {
            return capitalize(detail.item.name.replace(/-/g, " "));
        }
        return `Use Item`;
    }

    if (detail.trigger?.name === "trade") {
        if (detail.heldItem?.name) {
            return `Trade (${capitalize(detail.heldItem.name.replace(/-/g, " "))})`;
        }
        if (detail.tradeSpecies?.name) {
            return `Trade (${capitalize(detail.tradeSpecies.name)})`;
        }
        return `Trade`;
    }

    if (detail.trigger?.name) {
        return capitalize(detail.trigger.name.replace(/-/g, " "));
    }

    return null;
}

export const EvolutionChainItem: FC<EvolutionChainItemProps> = ({
                                                                    chainLink,
                                                                    isActive = false,
                                                                    onSelect,
                                                                    className = "",
                                                                    compact = false,
                                                                    showTriggerBadge = true
                                                                }) => {
    const pokemonSpecies = chainLink.pokemonSpecies;
    const variety = pokemonSpecies?.varieties?.[0];
    const evolutionDetails = chainLink.evolutionDetails;
    const speciesId = pokemonSpecies?.id ?? chainLink.pokemonSpeciesId;
    const speciesName = pokemonSpecies?.name ? capitalize(pokemonSpecies.name) : "Pokemon";
    const triggerBadge = formatEvolutionTrigger(evolutionDetails);

    const [imageLoading, setImageLoading] = useState(true);

    const handleClick = () => {
        if (onSelect && speciesId) {
            onSelect(speciesId);
        }
    };

    const sizeClasses = compact
        ? "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12"
        : "w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20";

    const body = (
        <div
            data-testid="chain-item"
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (onSelect && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleClick();
                }
            }}
            aria-label={`${speciesName} (ID: #${speciesId})`}
            className={`group relative flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-xl border-2 transition-all duration-200 select-none ${
                onSelect ? "cursor-pointer" : ""
            } ${
                isActive
                    ? "ring-2 ring-amber-400 bg-gradient-to-b from-sky-600 to-sky-800 dark:from-slate-800 dark:to-slate-900 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105 z-20"
                    : "bg-sky-800/80 dark:bg-slate-900/90 border-sky-600/60 dark:border-slate-700/80 hover:border-amber-400/80 hover:bg-sky-700/90 dark:hover:bg-slate-800 shadow-md hover:scale-102 z-10"
            } ${className}`}
        >
            {/* National ID Pill Badge */}
            {speciesId && (
                <span
                    className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-sky-200 dark:text-sky-300 px-1.5 py-0.2 rounded-full bg-sky-950/80 dark:bg-slate-950/80 border border-sky-700/50 mb-0.5">
                    #{String(speciesId).padStart(3, "0")}
                </span>
            )}

            {/* Sprite Container */}
            <div className={`relative flex items-center justify-center ${sizeClasses}`}>
                {variety && (
                    <>
                        <SkeletonIcon
                            className={`w-full h-full rounded-full opacity-60 ${imageLoading ? "block" : "hidden"}`}
                        />
                        <img
                            className={`w-full h-full object-contain [image-rendering:pixelated] transition-transform duration-200 group-hover:scale-110 ${
                                imageLoading ? "hidden" : "inline"
                            }`}
                            src={variety.sprite_url}
                            alt={`${pokemonSpecies?.name}_icon`}
                            onLoad={() => setImageLoading(false)}
                        />
                    </>
                )}
            </div>

            {/* Species Name */}
            <span
                className="text-[10px] sm:text-[11px] font-mono font-bold tracking-tight text-white truncate max-w-[80px] sm:max-w-[95px] text-center mt-0.5">
                {speciesName}
            </span>

            {/* Inline Evolution Trigger Chip */}
            {showTriggerBadge && triggerBadge && (
                <span
                    className="mt-1 text-[8px] sm:text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 rounded-full px-1.5 py-0.2 max-w-[90px] truncate text-center shadow-sm">
                    {triggerBadge}
                </span>
            )}
        </div>
    );

    return (
        <>
            {evolutionDetails && evolutionDetails.length > 0 ? (
                <Tooltip position="bottom" body={<EvolutionInfo details={evolutionDetails}/>}>
                    {body}
                </Tooltip>
            ) : (
                body
            )}
        </>
    );
};
