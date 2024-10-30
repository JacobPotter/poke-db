import {createContext, FC, PropsWithChildren, useState} from "react";

export const DarkModeContext = createContext<{ dark: boolean, toggleDarkMode: VoidFunction }>({
    dark: false,
    toggleDarkMode: () => {
    }
})


export const DarkModeProvider: FC<PropsWithChildren> = ({children}) => {

    const [dark, setDark] = useState(false)

    const toggleDarkMode = () => {
        setDark(prevState => !prevState)
    }

    return (
        <DarkModeContext.Provider value={{dark, toggleDarkMode}}>
            {children}
        </DarkModeContext.Provider>
    )
}