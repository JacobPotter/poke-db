import {createContext, FC, PropsWithChildren, useEffect, useState} from "react";

export const DarkModeContext = createContext<{ dark: boolean, toggleDarkMode: VoidFunction }>({
    dark: true,
    toggleDarkMode: () => {
    }
})

const getInitialTheme = (): boolean => {
    if (typeof window !== "undefined") {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") return true;
        if (storedTheme === "light") return false;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return true;
        }
    }
    return true;
};

export const DarkModeProvider: FC<PropsWithChildren> = ({children}) => {
    const [dark, setDark] = useState<boolean>(getInitialTheme);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("theme", dark ? "dark" : "light");
            if (dark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }, [dark]);

    const toggleDarkMode = () => {
        setDark(prevState => !prevState)
    }

    return (
        <DarkModeContext.Provider value={{dark, toggleDarkMode}}>
            {children}
        </DarkModeContext.Provider>
    )
}