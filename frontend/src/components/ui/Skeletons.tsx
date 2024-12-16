export function SkeletonText({thick}: { thick?: boolean }) {
    return <div
        className={`px-3 py-2 w-full ${thick ? "h-8 sm:h-12" : "h-6 sm:h-8"} rounded-xl bg-sky-600 opacity-80`}></div>;
}

export function SkeletonBlock({thick, withIcon}: { thick?: boolean, withIcon?: boolean }) {
    return <div
        className={`px-3 py-2 w-full ${thick ? "h-12 sm:h-20" : "h-10 sm:h-12"} rounded-xl bg-sky-800 opacity-80`}>
        {withIcon && <div className={'flex items-center justify-between gap-2'}>
            <div className={'hidden sm:block px-3 py-2 w-1/2 h-2 rounded-xl bg-sky-600 opacity-80'}></div>
            <div
                className={`mx-auto rounded-full bg-sky-600 ${thick ? "h-8 w-8 sm:h-12 sm:w-12" : "h-3 w-3 sm:h-4 sm:w-4"} `}></div>
        </div>}
    </div>;
}

interface SkeletonIconProps {
    className?: string
}

export function SkeletonIcon({className}: SkeletonIconProps) {
    return <div className={`rounded-full ${className || "h-20 w-20 sm:h-32 sm:w-32"} bg-sky-600 opacity-80`}></div>;
}
