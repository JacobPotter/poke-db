import {Outlet} from "react-router-dom";
import {useContext} from "react";
import {DarkModeContext} from "../../context/DarkModeContext.tsx";

function Layout() {
    const {dark} = useContext(DarkModeContext);
    return (
        <div className={dark ? "dark" : ""}>
            <div
                className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen w-full flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 transition-colors">
                <main className="w-full flex-grow flex items-center justify-center">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}

export default Layout;
