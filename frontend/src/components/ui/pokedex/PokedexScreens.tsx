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
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 p-1 sm:p-2 animate-pulse items-center justify-center">
            {Array.from({length: 6}).map((_, i) => (
                <div key={i}
                     className="aspect-square w-full rounded-xl bg-sky-800/80 dark:bg-slate-800/80 p-2 sm:p-2.5 flex items-center justify-center shadow-inner">
                    <SkeletonIcon className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full opacity-60"/>
                </div>
            ))}
        </div>
    );
};

export const LeftScreenContainer: React.FC<PropsWithChildren<Loadable>> = ({children, loading}) => {
    return (
        <div className="flex flex-col justify-between w-full h-full min-h-0">
            {/* Unified Screen Housing: Johto Upper Lid on mobile (< md), Kanto White Beveled Housing on desktop (>= md) */}
            <div
                className="flex flex-col justify-between bg-slate-800/90 md:bg-slate-200 dark:bg-slate-800/90 dark:md:bg-slate-300 border-2 md:border-4 border-slate-700 md:border-slate-400 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl min-h-[300px] sm:min-h-[340px] md:min-h-[360px] lg:min-h-[400px] max-h-[380px] sm:max-h-[420px] md:max-h-[460px] lg:max-h-[480px] flex-grow relative">
                {/* Desktop Top Bezel Sensor Dots (>= md) */}
                <div className="hidden md:flex justify-center items-center gap-4 pb-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-800 shadow-sm"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-800 shadow-sm"></div>
                </div>

                {/* Inner Screen Viewport */}
                <div
                    className="flex-grow flex flex-col justify-between md:border-2 md:border-sky-800/80 dark:md:border-slate-700/80 bg-sky-700 dark:bg-slate-900/95 text-sky-50 md:shadow-inner md:rounded-xl p-2 sm:p-3 md:p-4 overflow-y-auto overflow-x-hidden min-h-0">
                    {loading ? <LeftScreenLoading/> : children}
                </div>

                {/* Desktop Bottom Bezel Controls (>= md) */}
                <div className="hidden md:flex justify-between items-center pt-2 px-1 shrink-0">
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
                    className="md:hidden flex justify-center items-center gap-2 pt-2 border-t border-sky-700/50 dark:border-slate-800/80 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 border border-emerald-600 shadow-sm"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400 border border-amber-600 shadow-sm"></div>
                    <div className="w-2 h-2 rounded-full bg-rose-500 border border-rose-700 shadow-sm"></div>
                </div>
            </div>

            {/* Mobile Johto Central Horizontal Cylindrical Hinge Bar (< md) */}
            <div className="md:hidden my-3 w-full flex items-center justify-center">
                <div
                    className="relative w-full h-5 sm:h-6 rounded-md bg-gradient-to-b from-slate-700 via-slate-900 to-slate-800 border-y-2 border-slate-950 shadow-inner flex items-center justify-between px-3">
                    <div
                        className="w-6 h-3.5 rounded-sm bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-900 shadow"></div>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
                    </div>
                    <div
                        className="w-6 h-3.5 rounded-sm bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border border-slate-900 shadow"></div>
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
        className={`min-h-[240px] sm:min-h-[280px] md:min-h-[300px] lg:min-h-[340px] max-h-[380px] lg:max-h-[420px] border-slate-600/80 dark:border-slate-700/80 border-2 md:border-4 bg-sky-700 dark:bg-slate-900/95 text-sky-50 shadow-inner rounded-xl md:rounded-2xl overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4 lg:p-5 flex-grow ${size === 'small' ? "md:row-span-5" : 'md:row-span-6'}`}>
        {loading ? <RightScreenLoading/> : children}
    </div>
);

LeftScreenContainer.displayName = "LeftScreenContainer";
RightScreenContainer.displayName = "RightScreenContainer";
