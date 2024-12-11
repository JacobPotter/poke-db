import {FC, PropsWithChildren, ReactElement} from "react";

type TooltipProps = { body: ReactElement, position?: 'top' | 'bottom' | 'left' | 'right' };


export const Tooltip: FC<PropsWithChildren<TooltipProps>> = ({body, children, position = "bottom"}) => {

    let tooltipPositionStyle

    switch (position) {
        case "top":
            tooltipPositionStyle = "-top-16"
            break
        case "left":
            tooltipPositionStyle = "right-20"
            break
        case "right":
            tooltipPositionStyle = "left-20"
            break
        case "bottom":
        default:
            tooltipPositionStyle = "-bottom-16"
            break
    }


    return (
        <div className="group relative flex flex-col items-center justify-center">
            {children}
            <div
                className={`z-20 absolute ${tooltipPositionStyle} mx-auto min-w-max hidden scale-0 transform rounded-lg px-3 py-2 text-xs font-medium transition-all duration-500 group-hover:block group-hover:scale-100`}>
                <div className="flex flex-col items-center shadow-lg">
                    <div className="rounded bg-gray-800 p-2 text-center text-xs text-white">
                        {body}
                    </div>
                </div>
            </div>
        </div>
    );
};
