import {createContext, FC, PropsWithChildren, useState} from "react";

export const DarkModeContext = createContext<{ dark: boolean, toggleDarkMode: VoidFunction }>({
    dark: true,
    toggleDarkMode: () => {
    }
})


export const DarkModeProvider: FC<PropsWithChildren> = ({children}) => {

    const [dark, setDark] = useState(true)

    const toggleDarkMode = () => {
        setDark(prevState => !prevState)
    }

    return (
        <DarkModeContext.Provider value={{dark, toggleDarkMode}}>
            {children}
        </DarkModeContext.Provider>
    )
}