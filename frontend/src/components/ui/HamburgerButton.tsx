import {useState} from "react";

interface HamburgerButtonProps {
    onClick: () => void;
}


export function HamburgerButton({onClick}: HamburgerButtonProps) {
    const [active, setActive] = useState(false)

    const handleClick = () => {
        setActive(prevActive => !prevActive)
        onClick()
    }

    return <div className={"md:hidden mt-1"}>
        <button
            className={`z-40 block hamburger md:hidden focus:outline-none ${active ? "open" : ""}`}
            onClick={handleClick}>
            <span className={`hamburger-top bg-red-950 dark:bg-red-50`}></span>
            <span className={`hamburger-middle bg-red-950 dark:bg-red-50`}></span>
            <span className={`hamburger-bottom bg-red-950 dark:bg-red-50`}></span>
        </button>
    </div>;
}