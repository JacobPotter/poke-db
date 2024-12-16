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
    className={`max-h-72 min-h-64  xs:max-h-96 xs:min-h-80 md:max-h-full md:min-h-[575px] border-slate-400 border-2 md:border-4 bg-sky-700 text-sky-50 rounded-lg rounded-b-none md:rounded-b-lg p-4 md:row-span-6`}>
    {loading ? <LeftScreenLoading/> : children}
</div>;
export const RightScreenContainer: React.FC<PropsWithChildren<Sizeable & Loadable>> = ({
                                                                                           children,
                                                                                           loading = false,
                                                                                           size = 'small'
                                                                                       }) => <div
    className={`min-h-40 max-h-44 sm:max-h-60 md:max-h-full md::min-h-[575px] border-slate-400 border-2 md:border-4 bg-sky-700 text-sky-50 rounded-lg rounded-t-none md:rounded-t-lg overflow-y-auto ${size === 'small' ? "md:row-span-5" : 'md:row-span-6'}`}>
    {loading ? <RightScreenLoading/> : children}
</div>;
