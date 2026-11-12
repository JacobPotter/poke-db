import {useEffect, useState} from "react";

interface HamburgerButtonProps {
    onClick: () => void;
    reset?: boolean;
}

export function HamburgerButton({onClick, reset}: HamburgerButtonProps) {
    const [active, setActive] = useState(false);

    const handleClick = () => {
        setActive(prevActive => !prevActive);
        onClick();
    };

    useEffect(() => {
        if (reset) {
            setActive(false);
        }
    }, [reset]);

    return (
        <div data-testid={"hamburger-button"} className={"md:hidden mt-1"}>
            <button
                aria-label="Toggle navigation menu"
                aria-expanded={active}
                className={`z-40 block hamburger md:hidden focus:outline-none p-1 rounded-lg ${active ? "open" : ""}`}
                onClick={handleClick}
            >
                <span className={`hamburger-top bg-slate-900 dark:bg-slate-100`}></span>
                <span className={`hamburger-middle bg-slate-900 dark:bg-slate-100`}></span>
                <span className={`hamburger-bottom bg-slate-900 dark:bg-slate-100`}></span>
            </button>
        </div>
    );
}
