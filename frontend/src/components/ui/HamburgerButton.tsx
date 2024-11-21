import {useEffect, useState} from "react";

interface HamburgerButtonProps {
    onClick: () => void;
    reset?: boolean
}


export function HamburgerButton({onClick, reset}: HamburgerButtonProps) {
    const [active, setActive] = useState(false)

    const handleClick = () => {
        setActive(prevActive => !prevActive)
        onClick()
    }

    useEffect(() => {
        if (reset) {
            setActive(false)
        }
    }, [reset]);

    return <div data-testid={"hamburger-button"} className={"md:hidden mt-1"}>
        <button
            className={`z-40 block hamburger md:hidden focus:outline-none ${active ? "open" : ""}`}
            onClick={handleClick}>
            <span className={`hamburger-top bg-red-950 dark:bg-red-50`}></span>
            <span className={`hamburger-middle bg-red-950 dark:bg-red-50`}></span>
            <span className={`hamburger-bottom bg-red-950 dark:bg-red-50`}></span>
        </button>
    </div>;
}
