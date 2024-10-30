import {DarkModeButton} from "../ui/DarkModeButton.tsx";
import {HamburgerButton} from "../ui/HamburgerButton.tsx";
import Logo from "../../assets/pokedex.svg?react"
import {useState} from "react";
import {NavLink} from "react-router-dom";
import {NavbarItem} from "./NavbarItem.tsx";


/**
 * Navbar component that contains the logo, navigation links, dark mode toggle, and a hamburger menu button.
 * It adjusts its layout based on the screen size, showing a hamburger menu on smaller screens and inline
 * navigation links on larger screens.
 *
 * @return {JSX.Element} The JSX representation of the Navbar component.
 */
export function Navbar() {

    const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)

    const handleHamburgerClick = () => {
        setShowHamburgerMenu(prevState => !prevState)
    }
    return <>
        <nav className={"flex items-center justify-between px-3"}>
            <div className={"flex items-center justify-center space-x-2 z-40 font-mono"}>
                <Logo className={"py-2 h-12"}/>
                <h1 className="text-3xl">PokeDB</h1>
                <div className="hidden h-10 md:flex md:space-x-6 items-center justify-center text-center pl-10">
                    <NavbarItem path={'pokemon'} text={'Pokemon'}/>
                    <NavbarItem path={'types'} text={'Types'}/>
                    <NavbarItem path={'evolutions'} text={'Evolutions'}/>
                    <NavbarItem path={'moves'} text={'Moves'}/>

                </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
                <DarkModeButton/>
                <HamburgerButton onClick={handleHamburgerClick}/>
            </div>
        </nav>
        {/*Mobile Menu*/}
        <div id="menu"
             className={`absolute top-0 bottom-0 left-0 flex-col self-end w-full min-h-screen pb-1 pt-40 pl-12 space-y-3 text-lg uppercase bg-red-700 dark:bg-red-900 text-white z-30 bg-opacity-85 ${showHamburgerMenu ? "flex" : "hidden"}`}>
            <NavLink to={"pokemon"} className="">Pokemon</NavLink>
            <NavLink to={"types"} className="">Types</NavLink>
            <NavLink to={"evolutions"} className="">Evolutions</NavLink>
            <NavLink to={"moves"} className="">Moves</NavLink>
        </div>
    </>
}