import {FC, PropsWithChildren, ReactElement} from "react";
import {Sizeable} from "../../../models/general.ts";

export const KeyboardButtonContainer: FC<PropsWithChildren<Sizeable>> = ({children, size}) => <section
    className={`${size === 'small' ? 'row-span-1' : 'row-span-2'} self-center p-1 sm:p-3 bg-slate-600 rounded-lg items-center justify-center h-fit`}>
    {children}
</section>;

interface KeyboardButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    prefixIcon?: ReactElement;
    suffixIcon?: ReactElement;
    className?: string;
}

export const KeyboardButton: FC<PropsWithChildren<KeyboardButtonProps & Sizeable>> = ({
                                                                                          children,
                                                                                          onClick,
                                                                                          disabled,
                                                                                          prefixIcon,
                                                                                          suffixIcon,
                                                                                          className,
                                                                                          size = 'small'
                                                                                      }) =>
    <div
        className={`group ${className ?? ''}`}>
        <button
            onClick={onClick}
            disabled={disabled}
            className={'w-full text-center font-semibold uppercase transition-all duration-100 bg-slate-700 text-slate-50 border-b-8 border-b-slate-700 rounded-lg group-active:border-t-8 md:group-hover:border-t-8 group-active:border-b-0 md:group-hover:border-b-0 group-active:bg-slate-700 md:group-hover:bg-slate-700 group-active:border-t-slate-700 md:group-hover:border-t-slate-700  group-active:shadow-lg md:group-hover:shadow-lg'}>
            <div
                className={`flex items-center ${prefixIcon || suffixIcon ? 'justify-between' : 'justify-center'} ${size == 'small' ? 'px-2 py-1 md:px-4 md:py-2 lg:px-6 lg:py-3 text-xs md:text-sm lg:text-base' : 'px-3 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-sm md:text-base lg:text-lg'} transition-all duration-100 bg-slate-500 rounded-lg group-active:bg-slate-700 md:group-hover:bg-slate-700 `}>
                {prefixIcon && <div className="w-7 h-7">
                    {prefixIcon}
                </div>}
                {children}
                {suffixIcon && <div className="w-7 h-7">
                    {suffixIcon}
                </div>}
            </div>
        </button>
    </div>;