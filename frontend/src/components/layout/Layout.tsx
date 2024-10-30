import {Outlet} from "react-router-dom";
import {useContext} from "react";
import {DarkModeContext} from "../../context/DarkModeContext.tsx";
import {Navbar} from "./Navbar.tsx";

function Layout() {
    const {dark} = useContext(DarkModeContext)
    return (
        <div className={dark ? "dark" : ""}>
            <div className="bg-red-50 dark:bg-red-950 text-red-950 dark:text-red-50 h-screen">
                <Navbar/>
                <Outlet/>
            </div>
        </div>
    )
}

export default Layout
