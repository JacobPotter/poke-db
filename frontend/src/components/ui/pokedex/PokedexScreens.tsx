import React, {PropsWithChildren} from "react";
import {Sizeable} from "../../../models/general.ts";
import {Loadable} from "../../../models/interfaces.ts";
import {SkeletonBlock, SkeletonIcon, SkeletonText} from "../Skeletons.tsx";

const LeftScreenLoading: React.FC = () => {
    return <div
        className="flex flex-col space-y-6 md:space-y-16 items-center justify-center animate-pulse">
        <SkeletonText thick/>
        <SkeletonIcon/>
        <div className="grid grid-cols-2 gap-2 md:gap-6 w-full justify-stretch">
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
            <SkeletonText/>
        </div>
    </div>
}
const RightScreenLoading: React.FC = () => {
    return <div className="grid grid-cols-4 md:grid-cols-2 gap-1 sm:gap-4 animate-pulse items-center justify-center">
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
        <SkeletonBlock thick withIcon/>
    </div>
}
export const LeftScreenContainer: React.FC<PropsWithChildren<Loadable>> = ({children, loading}) => <div
    className={`min-h-[380px] sm:min-h-[440px] md:min-h-[640px] lg:min-h-[680px] xl:min-h-[720px] md:max-h-full border-slate-700/90 dark:border-slate-800 border-2 md:border-4 bg-sky-800/90 dark:bg-slate-900/95 text-sky-50 shadow-inner rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-7 md:row-span-6 flex flex-col justify-between`}>
    {loading ? <LeftScreenLoading/> : children}
</div>;
export const RightScreenContainer: React.FC<PropsWithChildren<Sizeable & Loadable>> = ({
                                                                                           children,
                                                                                           loading = false,
                                                                                           size = 'small'
                                                                                       }) => <div
    className={`min-h-[320px] max-h-[520px] md:min-h-[640px] lg:min-h-[680px] xl:min-h-[720px] md:max-h-full border-slate-700/90 dark:border-slate-800 border-2 md:border-4 bg-sky-800/90 dark:bg-slate-900/95 text-sky-50 shadow-inner rounded-xl md:rounded-2xl overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 ${size === 'small' ? "md:row-span-5" : 'md:row-span-6'}`}>
    {loading ? <RightScreenLoading/> : children}
</div>;
