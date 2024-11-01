import React, {PropsWithChildren} from "react";

export const SummaryItem: React.FC<PropsWithChildren<{ className?: string }>> = ({children, className}) => <p
    className={`text-xxs xs:text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl border-slate-800 border-2 px-2 py-1 rounded ${className || ''}`}>{children}</p>;