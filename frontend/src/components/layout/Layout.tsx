import {Outlet} from "react-router-dom";
import {useContext} from "react";
import {DarkModeContext} from "../../context/DarkModeContext.tsx";

function Layout() {
    const {dark} = useContext(DarkModeContext);
    return (
        <div
            className={`${dark ? "dark" : ""} w-full h-full h-screen h-[100dvh] max-h-screen max-h-[100dvh] min-h-screen overflow-hidden md:min-h-[580px] md:h-screen md:max-h-screen md:overflow-y-auto`}>
            <div
                className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen md:min-h-[580px] h-screen h-[100dvh] max-h-screen max-h-[100dvh] md:h-screen md:max-h-screen w-full flex flex-col justify-center items-center p-1 sm:p-1.5 md:p-1.5 lg:p-2 transition-colors overflow-hidden md:overflow-y-auto">
                <main
                    className="w-full h-full flex-grow flex items-center justify-center min-h-0 md:max-h-full max-h-full overflow-hidden">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}

export default Layout;
