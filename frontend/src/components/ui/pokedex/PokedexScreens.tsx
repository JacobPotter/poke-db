import React, {PropsWithChildren} from "react";
import {Sizeable} from "@/models/general.ts";
import {Loadable} from "@/models/interfaces.ts";
import {SkeletonIcon, SkeletonText} from "../Skeletons.tsx";

const LeftScreenLoading: React.FC = () => {
    return <div
        className="flex flex-col space-y-4 sm:space-y-6 md:space-y-8 items-center justify-center animate-pulse py-2">
        <SkeletonText thick/>
        <SkeletonIcon/>
        <div className="grid grid-cols-2 gap-2 md:gap-4 w-full justify-stretch">
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
        </div>
    </div>
}

const RightScreenLoading: React.FC = () => {
    return (
        <div
            className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 p-1 sm:p-2 md:p-2.5 animate-pulse items-center justify-center h-full">
            {/* Mobile: 3 skeleton tiles (< md) */}
            <div className="contents md:hidden">
                {Array.from({length: 3}).map((_, i) => (
                    <div key={`mob-${i}`}
                         className="aspect-square w-full rounded-xl bg-sky-800/80 dark:bg-slate-800/80 p-1 sm:p-1.5 flex items-center justify-center shadow-inner min-w-0 min-h-0">
                        <SkeletonIcon className="w-8 h-8 sm:w-10 sm:h-10 rounded-full opacity-60"/>
                    </div>
                ))}
            </div>
            {/* Desktop: 6 skeleton tiles (>= md) */}
            <div className="contents hidden md:contents">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={`desk-${i}`}
                         className="aspect-square w-full rounded-xl bg-sky-800/80 dark:bg-slate-800/80 p-1.5 md:p-2 flex items-center justify-center shadow-inner min-w-0 min-h-0">
                        <SkeletonIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full opacity-60"/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LeftScreenContainer: React.FC<PropsWithChildren<Loadable>> = ({children, loading}) => {
    return (
        <div data-testid="left-screen-container"
             className="flex flex-col justify-between w-full h-full min-h-0 flex-1 flex-grow">
            {/* Unified Screen Housing: Johto Upper Lid on mobile (< md), Kanto White Beveled Housing on desktop (>= md) */}
            <div
                className="flex flex-col justify-between bg-slate-800/90 md:bg-slate-200 dark:bg-slate-800/90 dark:md:bg-slate-300 border-2 md:border-4 border-slate-700 md:border-slate-400 rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 shadow-xl min-h-[140px] sm:min-h-[160px] md:min-h-0 max-h-[280px] sm:max-h-[320px] md:max-h-none flex-1 flex-grow relative h-full">
                {/* Desktop Top Bezel Sensor Dots (>= md) */}
                <div className="hidden md:flex justify-center items-center gap-4 pb-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-800 shadow-sm"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-800 shadow-sm"></div>
                </div>

                {/* Inner Screen Viewport */}
                <div
                    className="flex-grow flex-1 flex flex-col justify-between md:border-2 md:border-sky-800/80 dark:md:border-slate-700/80 bg-sky-700 dark:bg-slate-900/95 text-sky-50 md:shadow-inner md:rounded-xl p-1.5 sm:p-2 md:p-2.5 overflow-y-auto overflow-x-hidden min-h-0">
                    {loading ? <LeftScreenLoading/> : children}
                </div>

                {/* Desktop Bottom Bezel Controls (>= md) */}
                <div className="hidden md:flex justify-between items-center pt-1.5 px-1 shrink-0">
                    {/* Lower-left pulsing red LED indicator */}
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-400 animate-pulse border border-black/40 shadow-md"></div>
                        <span
                            className="text-[10px] font-mono font-bold tracking-wider text-slate-700 uppercase">Signal</span>
                    </div>

                    {/* Center Speaker Slits */}
                    <div className="flex flex-col gap-1 w-12 sm:w-16">
                        <div className="h-1 bg-slate-600/80 rounded-full shadow-inner"></div>
                        <div className="h-1 bg-slate-600/80 rounded-full shadow-inner"></div>
                        <div className="h-1 bg-slate-600/80 rounded-full shadow-inner"></div>
                    </div>

                    {/* Bottom-right acoustic speaker grille */}
                    <div className="flex flex-col gap-0.5 w-10">
                        <div className="h-0.5 bg-slate-700/70 rounded-full"></div>
                        <div className="h-0.5 bg-slate-700/70 rounded-full"></div>
                        <div className="h-0.5 bg-slate-700/70 rounded-full"></div>
                        <div className="h-0.5 bg-slate-700/70 rounded-full"></div>
                    </div>
                </div>

                {/* Mobile Screen Status Dots (< md) */}
                <div
                    className="md:hidden flex justify-center items-center gap-2 pt-1 border-t border-sky-700/50 dark:border-slate-800/80 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 border border-emerald-600 shadow-sm"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-600 shadow-sm"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 border border-rose-700 shadow-sm"></div>
                </div>
            </div>
        </div>
    );
};

export const RightScreenContainer: React.FC<PropsWithChildren<Sizeable & Loadable>> = ({
                                                                                           children,
                                                                                           loading = false,
                                                                                           size = 'small'
                                                                                       }) => (
    <div
        data-testid="right-screen-container"
        className={`min-h-[110px] sm:min-h-[130px] md:min-h-0 max-h-[280px] md:max-h-none border-slate-600/80 dark:border-slate-700/80 border-2 md:border-4 bg-sky-700 dark:bg-slate-900/95 text-sky-50 shadow-inner rounded-xl md:rounded-2xl overflow-y-auto overflow-x-hidden p-1.5 sm:p-2 md:p-2.5 lg:p-3 flex-1 flex-grow flex flex-col justify-between min-h-0 w-full h-full ${size === 'small' ? "md:row-span-5" : 'md:row-span-6'}`}>
        {loading ? <RightScreenLoading/> : children}
    </div>
);

LeftScreenContainer.displayName = "LeftScreenContainer";
RightScreenContainer.displayName = "RightScreenContainer";
