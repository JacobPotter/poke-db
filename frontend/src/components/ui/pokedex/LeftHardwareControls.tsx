import {FC, ReactNode} from "react";
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon} from "@heroicons/react/24/solid";

export interface DPadProps {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
}

export const DPad: FC<DPadProps> = ({
                                        onUp,
                                        onDown,
                                        onLeft,
                                        onRight,
                                        disabled = false,
                                        className = "",
                                        ariaLabel = "Directional Pad"
                                    }) => {
    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={`relative grid grid-cols-3 grid-rows-3 w-20 h-20 sm:w-24 sm:h-24 lg:w-[104px] lg:h-[104px] bg-transparent select-none ${className}`}
        >
            {/* Unified Solid Matte Molded Cross Background */}
            <div
                className="absolute inset-x-1/3 inset-y-0 bg-slate-900 border-2 border-slate-950 rounded-md shadow-inner pointer-events-none"/>
            <div
                className="absolute inset-y-1/3 inset-x-0 bg-slate-900 border-2 border-slate-950 rounded-md shadow-inner pointer-events-none"/>
            <div className="absolute inset-1/3 bg-slate-900 pointer-events-none"/>

            {/* Up Button */}
            <button
                type="button"
                aria-label="D-Pad Up"
                disabled={disabled || !onUp}
                onClick={onUp}
                className="col-start-2 row-start-1 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-t-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow"/>
            </button>

            {/* Left Button */}
            <button
                type="button"
                aria-label="D-Pad Left"
                disabled={disabled || !onLeft}
                onClick={onLeft}
                className="col-start-1 row-start-2 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-l-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow"/>
            </button>

            {/* Center Pivot Indicator */}
            <div
                className="col-start-2 row-start-2 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 m-auto rounded-full bg-slate-900 border-2 border-slate-950 shadow-inner flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 shadow-sm"/>
            </div>

            {/* Right Button */}
            <button
                type="button"
                aria-label="D-Pad Right"
                disabled={disabled || !onRight}
                onClick={onRight}
                className="col-start-3 row-start-2 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-r-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow"/>
            </button>

            {/* Down Button */}
            <button
                type="button"
                aria-label="D-Pad Down"
                disabled={disabled || !onDown}
                onClick={onDown}
                className="col-start-2 row-start-3 z-10 w-full h-full flex items-center justify-center text-slate-400 hover:text-amber-300 active:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-b-md active:bg-slate-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow"/>
            </button>
        </div>
    );
};

export interface StatusDisplayProps {
    text?: string;
    label?: string;
    className?: string;
}

export const StatusDisplay: FC<StatusDisplayProps> = ({
                                                          text = "READY",
                                                          label = "Status",
                                                          className = ""
                                                      }) => {
    return (
        <div className={`flex flex-col items-start ${className}`}>
            {label && (
                <span
                    className="text-[9px] font-mono font-bold tracking-wider text-slate-700 dark:text-red-300 uppercase mb-0.5">
                    {label}
                </span>
            )}
            <div
                role="status"
                aria-label={`Status: ${text}`}
                className="w-full min-w-[100px] sm:min-w-[130px] max-w-[200px] h-8 sm:h-9 px-2.5 py-1 bg-gradient-to-b from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 border-2 border-emerald-800 dark:border-emerald-950 rounded-md shadow-inner flex items-center justify-center select-none"
            >
                <span
                    className="font-mono font-bold text-xs sm:text-sm text-slate-950 tracking-wider truncate drop-shadow-sm">
                    {text}
                </span>
            </div>
        </div>
    );
};

export interface PillButtonProps {
    color?: "red" | "cyan" | "slate";
    onClick?: () => void;
    disabled?: boolean;
    ariaLabel?: string;
    label?: string;
    className?: string;
}

export const PillButton: FC<PillButtonProps> = ({
                                                    color = "red",
                                                    onClick,
                                                    disabled = false,
                                                    ariaLabel,
                                                    label,
                                                    className = ""
                                                }) => {
    let colorStyles = "bg-gradient-to-b from-red-500 to-red-700 border-red-900 text-red-100 hover:from-red-400 hover:to-red-600";
    if (color === "cyan") {
        colorStyles = "bg-gradient-to-b from-sky-400 to-sky-600 border-sky-900 text-sky-100 hover:from-sky-300 hover:to-sky-500";
    } else if (color === "slate") {
        colorStyles = "bg-gradient-to-b from-slate-500 to-slate-700 border-slate-900 text-slate-100 hover:from-slate-400 hover:to-slate-600";
    }

    const buttonAria = ariaLabel || label || `${color} switch`;

    return (
        <button
            type="button"
            aria-label={buttonAria}
            title={buttonAria}
            disabled={disabled}
            onClick={onClick}
            className={`w-10 h-3 sm:w-12 sm:h-3.5 lg:w-14 lg:h-4 rounded-full border-2 shadow-md active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-amber-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${colorStyles} ${className}`}
        />
    );
};

export interface BlackButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    ariaLabel?: string;
    label?: string;
    className?: string;
    children?: ReactNode;
}

export const BlackButton: FC<BlackButtonProps> = ({
                                                      onClick,
                                                      disabled = false,
                                                      ariaLabel = "Action Button",
                                                      label,
                                                      className = "",
                                                      children
                                                  }) => {
    const accessibleLabel = ariaLabel || label;
    return (
        <button
            type="button"
            aria-label={accessibleLabel}
            title={accessibleLabel}
            disabled={disabled}
            onClick={onClick}
            className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-2 border-slate-950 shadow-lg active:scale-95 active:shadow-inner hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all flex items-center justify-center text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {children || <div className="w-2.5 h-2.5 rounded-full bg-slate-600 shadow-inner"></div>}
        </button>
    );
};

export interface LeftHardwareControlsProps {
    dpad?: DPadProps;
    statusText?: string;
    statusLabel?: string;
    onBlackButtonClick?: () => void;
    blackButtonLabel?: string;
    onRedPillClick?: () => void;
    redPillLabel?: string;
    onCyanPillClick?: () => void;
    cyanPillLabel?: string;
    className?: string;
    children?: ReactNode;
}

export const LeftHardwareControls: FC<LeftHardwareControlsProps> = ({
                                                                        dpad,
                                                                        statusText = "READY",
                                                                        statusLabel,
                                                                        onBlackButtonClick,
                                                                        blackButtonLabel = "Action",
                                                                        onRedPillClick,
                                                                        redPillLabel = "Option A",
                                                                        onCyanPillClick,
                                                                        cyanPillLabel = "Option B",
                                                                        className = "",
                                                                        children
                                                                    }) => {
    return (
        <div
            data-testid="left-hardware-controls"
            className={`w-full bg-slate-800/90 md:bg-slate-800/95 dark:bg-slate-900/90 dark:md:bg-slate-950 p-2 sm:p-2.5 rounded-xl border-2 border-slate-700/80 dark:border-slate-800 shadow-inner flex items-center justify-between gap-2 sm:gap-3 ${className}`}
        >
            {children || (
                <>
                    {/* Left Section: Circular Black Button */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <BlackButton
                            onClick={onBlackButtonClick}
                            ariaLabel={blackButtonLabel}
                        />
                        <span
                            className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                            Audio
                        </span>
                    </div>

                    {/* Middle Section: Red/Cyan Pill Switches + Green LCD Readout */}
                    <div className="flex flex-col items-center gap-1 flex-grow max-w-[180px]">
                        <div className="flex items-center gap-2">
                            <PillButton
                                color="red"
                                onClick={onRedPillClick}
                                ariaLabel={redPillLabel}
                            />
                            <PillButton
                                color="cyan"
                                onClick={onCyanPillClick}
                                ariaLabel={cyanPillLabel}
                            />
                        </div>
                        <StatusDisplay text={statusText} label={statusLabel}/>
                    </div>

                    {/* Right Section: Tactile Black D-Pad */}
                    <div className="flex items-center justify-center shrink-0">
                        <DPad {...dpad} />
                    </div>
                </>
            )}
        </div>
    );
};
