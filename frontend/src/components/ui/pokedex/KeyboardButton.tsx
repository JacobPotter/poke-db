import {FC, PropsWithChildren, ReactElement} from "react";
import {Sizeable} from "../../../models/general.ts";

export const KeyboardButtonContainer: FC<PropsWithChildren<Sizeable>> = ({children, size}) => (
    <section
        className={`${size === 'small' ? 'row-span-1' : 'row-span-2'} self-center p-1 sm:p-2.5 bg-slate-800/90 dark:bg-slate-950/80 border border-slate-700/60 rounded-xl items-center justify-center h-fit shadow-md w-full`}>
        {children}
    </section>
);

interface KeyboardButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    prefixIcon?: ReactElement;
    suffixIcon?: ReactElement;
    className?: string;
    label?: string;
    ariaLabel?: string;
}

export const KeyboardButton: FC<PropsWithChildren<KeyboardButtonProps & Sizeable>> = ({
                                                                                          children,
                                                                                          onClick,
                                                                                          disabled = false,
                                                                                          prefixIcon,
                                                                                          suffixIcon,
                                                                                          className,
                                                                                          label,
                                                                                          ariaLabel,
                                                                                          size = 'small'
                                                                                      }) => {
    const accessibleLabel = ariaLabel || label || (typeof children === "string" ? children : undefined);

    return (
        <div className={`group ${className ?? ''}`}>
            <button
                type="button"
                aria-label={accessibleLabel}
                title={accessibleLabel}
                onClick={onClick}
                disabled={disabled}
                className={`w-full text-center font-semibold uppercase transition-all duration-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    disabled
                        ? "opacity-30 cursor-not-allowed bg-slate-700 text-slate-400 border-b-4 border-b-slate-800 pointer-events-none"
                        : "bg-slate-700 text-slate-50 border-b-4 md:border-b-6 border-b-slate-900 active:border-b-0 active:translate-y-1 hover:brightness-110 active:shadow-inner cursor-pointer"
                }`}
            >
                <div
                    className={`flex items-center ${prefixIcon || suffixIcon ? 'justify-between' : 'justify-center'} ${
                        size === 'small'
                            ? 'px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm'
                            : 'px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base'
                    } transition-all duration-100 bg-slate-600/90 rounded-md group-hover:bg-slate-500/90 group-active:bg-slate-700`}
                >
                    {prefixIcon && <div className="w-5 h-5 flex items-center justify-center">{prefixIcon}</div>}
                    {children}
                    {suffixIcon && <div className="w-5 h-5 flex items-center justify-center">{suffixIcon}</div>}
                </div>
            </button>
        </div>
    );
};