import {FC, PropsWithChildren, ReactElement} from "react";
import {Sizeable} from "@/models/general.ts";

export const DualPillVents: FC<{ className?: string }> = ({className = ""}) => (
    <div
        data-testid="dual-pill-vents"
        aria-hidden="true"
        className={`flex flex-col gap-1 items-center justify-center select-none ${className}`}
    >
        <div
            className="w-10 sm:w-12 lg:w-14 h-1.5 sm:h-2 rounded-full bg-slate-950 border border-slate-800 shadow-inner"></div>
        <div
            className="w-10 sm:w-12 lg:w-14 h-1.5 sm:h-2 rounded-full bg-slate-950 border border-slate-800 shadow-inner"></div>
    </div>
);

export const KeyboardButtonContainer: FC<PropsWithChildren<Sizeable & { className?: string }>> = ({
                                                                                                      children,
                                                                                                      size,
                                                                                                      className = ""
                                                                                                  }) => (
    <section
        data-testid="keyboard-button-container"
        className={`${size === 'small' ? 'row-span-1' : 'row-span-2'} p-2 sm:p-2.5 bg-slate-800/90 md:bg-slate-800/95 dark:bg-slate-950/90 border-2 border-slate-700/80 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-inner w-full ${className}`}
    >
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
    variant?: "default" | "silver" | "dial";
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
                                                                                          variant = "default",
                                                                                          size = 'small'
                                                                                      }) => {
    const accessibleLabel = ariaLabel || label || (typeof children === "string" ? children : undefined);

    let variantStyles = "bg-gradient-to-b from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-slate-100 border border-slate-500/80 border-b-3 md:border-b-4 border-b-slate-950 rounded-lg";
    if (variant === "silver") {
        variantStyles = "bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 hover:from-white hover:to-slate-200 text-slate-900 border border-slate-300/80 border-b-3 md:border-b-4 border-b-slate-600 rounded-lg shadow-md";
    } else if (variant === "dial") {
        variantStyles = "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 border-2 border-amber-600 border-b-3 md:border-b-4 border-b-amber-800 rounded-full shadow-lg ring-2 ring-amber-500/40";
    }

    return (
        <div className={`group ${className ?? ''}`}>
            <button
                type="button"
                aria-label={accessibleLabel}
                title={accessibleLabel}
                onClick={onClick}
                disabled={disabled}
                className={`w-full text-center font-bold uppercase transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-amber-400 select-none shadow-md ${variantStyles} ${
                    disabled
                        ? "opacity-30 cursor-not-allowed bg-slate-700 text-slate-400 border-b-2 border-b-slate-800 pointer-events-none"
                        : "active:border-b-1 active:translate-y-0.5 hover:brightness-105 active:shadow-inner cursor-pointer"
                }`}
            >
                <div
                    className={`flex items-center ${prefixIcon || suffixIcon ? 'justify-between' : 'justify-center'} ${
                        size === 'small'
                            ? 'px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm'
                            : 'px-3 py-1.5 md:px-4 md:py-2.5 text-xs md:text-sm'
                    } rounded-md`}
                >
                    {prefixIcon &&
                        <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-1">{prefixIcon}</div>}
                    {children}
                    {suffixIcon &&
                        <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center ml-1">{suffixIcon}</div>}
                </div>
            </button>
        </div>
    );
};

DualPillVents.displayName = "DualPillVents";
KeyboardButtonContainer.displayName = "KeyboardButtonContainer";
KeyboardButton.displayName = "KeyboardButton";
