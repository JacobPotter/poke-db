import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import Layout from './components/layout/Layout.tsx'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './index.css'
import {DarkModeProvider} from "./context/DarkModeContext.tsx";
import {PokemonPage} from "./components/pages/PokemonPage.tsx";
import {EvolutionsPage} from "./components/pages/EvolutionsPage.tsx";
import {TypesPage} from "./components/pages/TypesPage.tsx";
import {MovesPage} from "./components/pages/MovesPage.tsx";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <PokemonPage/>
            },
            {
                path: 'pokemon',
                element: <PokemonPage/>,
                children: [
                    {
                        path: ':id',
                        element: <PokemonPage/>
                    }
                ]
            },
            {
                path: 'evolutions',
                element: <EvolutionsPage/>
            },
            {
                path: 'types',
                element: <TypesPage/>
            },
            {
                path: 'moves',
                element: <MovesPage/>
            }
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <DarkModeProvider>
            <RouterProvider router={router}/>
        </DarkModeProvider>
    </StrictMode>,
)
