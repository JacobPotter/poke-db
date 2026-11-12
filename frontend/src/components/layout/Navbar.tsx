import {DarkModeButton} from "../ui/DarkModeButton.tsx";
import {HamburgerButton} from "../ui/HamburgerButton.tsx";
import Logo from "../../assets/pokedex.svg?react"
import {useState} from "react";
import {NavLink} from "react-router-dom";
import {NavbarItem} from "./NavbarItem.tsx";
import {XMarkIcon} from "@heroicons/react/24/outline";


/**
 * Navbar component that contains the logo, navigation links, dark mode toggle, and a hamburger menu button.
 * It adjusts its layout based on the screen size, showing a hamburger menu on smaller screens and inline
 * navigation links on larger screens.
 *
 * @return {JSX.Element} The JSX representation of the Navbar component.
 */
export function Navbar() {

    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
    const [resetHamburgerMenu, setResetHamburgerMenu] = useState(false)

    const handleHamburgerClick = () => {
        setShowHamburgerMenu(prevState => !prevState)
    }


    const clearHamburgerMenu = () => {
        setResetHamburgerMenu(true)
        setTimeout(() => setResetHamburgerMenu(false), 500)
        setShowHamburgerMenu(false)
    };
    return <>
        <header
            className="sticky top-0 z-30 backdrop-blur-md bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 mb-3 sm:mb-4">
            <nav className={"flex items-center justify-between px-3 py-1.5 max-w-7xl mx-auto"}>
                <div className={"flex items-center justify-center space-x-2 z-40 font-mono"}>
                    <Logo className={"py-1 h-11"}/>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">PokeDB</h1>
                    <div className="hidden h-10 md:flex md:space-x-6 items-center justify-center text-center pl-8">
                        <NavbarItem path={'/pokemon'} text={'Pokemon'}/>
                        <NavbarItem path={'/types'} text={'Types'}/>
                        <NavbarItem path={'/evolutions'} text={'Evolutions'}/>
                        <NavbarItem path={'/moves'} text={'Moves'}/>
                    </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                    <DarkModeButton/>
                    <HamburgerButton reset={resetHamburgerMenu} onClick={handleHamburgerClick}/>
                </div>
            </nav>
        </header>
        {/*Mobile Menu*/}
        <div id="menu"
             onClick={clearHamburgerMenu}
             className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col justify-start items-center transition-all ${!showHamburgerMenu ? "hidden" : ""}`}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-11/12 max-w-md mx-auto mt-20 p-6 flex flex-col items-center bg-red-800/95 dark:bg-red-950/95 rounded-2xl shadow-2xl border border-red-700/60 dark:border-red-900 text-white">
                <button
                    onClick={clearHamburgerMenu}
                    aria-label="Close navigation menu"
                    className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                    <XMarkIcon className="w-6 h-6"/>
                </button>
                <div className="text-xs font-semibold tracking-widest uppercase text-red-200 dark:text-red-300 mb-6">
                    Navigation
                </div>
                <div className="grid grid-cols-2 justify-center items-center gap-3 w-full">
                    <NavLink data-testid="mobile-pokemon-menu-item" onClick={clearHamburgerMenu} to={"/pokemon"}
                             className={({isActive}) =>
                                 `py-3 px-4 rounded-xl shadow text-center font-bold tracking-wider uppercase transition-all ${
                                     isActive
                                         ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                                         : "bg-red-600 dark:bg-red-900/80 hover:bg-red-500 dark:hover:bg-red-800 text-white"
                                 }`
                             }>Pokemon</NavLink>
                    <NavLink data-testid="mobile-types-menu-item" onClick={clearHamburgerMenu} to={"/types"}
                             className={({isActive}) =>
                                 `py-3 px-4 rounded-xl shadow text-center font-bold tracking-wider uppercase transition-all ${
                                     isActive
                                         ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                                         : "bg-red-600 dark:bg-red-900/80 hover:bg-red-500 dark:hover:bg-red-800 text-white"
                                 }`
                             }>Types</NavLink>
                    <NavLink data-testid="mobile-evolutions-menu-item" onClick={clearHamburgerMenu} to={"/evolutions"}
                             className={({isActive}) =>
                                 `py-3 px-4 rounded-xl shadow text-center font-bold tracking-wider uppercase transition-all ${
                                     isActive
                                         ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                                         : "bg-red-600 dark:bg-red-900/80 hover:bg-red-500 dark:hover:bg-red-800 text-white"
                                 }`
                             }>Evolutions</NavLink>
                    <NavLink data-testid="mobile-moves-menu-item" onClick={clearHamburgerMenu} to={"/moves"}
                             className={({isActive}) =>
                                 `py-3 px-4 rounded-xl shadow text-center font-bold tracking-wider uppercase transition-all ${
                                     isActive
                                         ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                                         : "bg-red-600 dark:bg-red-900/80 hover:bg-red-500 dark:hover:bg-red-800 text-white"
                                 }`
                             }>Moves</NavLink>
                </div>
            </div>
        </div>
    </>
}

