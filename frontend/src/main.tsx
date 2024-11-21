import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import Layout from './components/layout/Layout.tsx'
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import './index.css'
import {DarkModeProvider} from "./context/DarkModeContext.tsx";
import {PokemonPage} from "./components/pages/PokemonPage.tsx";
import {EvolutionsPage} from "./components/pages/EvolutionsPage.tsx";
import {TypesPage} from "./components/pages/TypesPage.tsx";
import {MovesPage} from "./components/pages/MovesPage.tsx";
import {MoveTypeProvider} from "./context/MoveTypeContext.tsx";
import {PokemonSummary} from "./components/pokemon/PokemonSummary.tsx";
import {EvolutionChainSummary} from "./components/pokemon/EvolutionChainSummary.tsx";
import {ComingSoon} from "./components/ui/ComingSoon.tsx";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        children: [
            {
                index: true,
                element: <Navigate to={'pokemon/1/summary'}/>
            },
            {
                path: 'pokemon',
                element: <PokemonPage/>,
                children: [
                    {
                        index: true,
                        element: <Navigate to={"1/summary"}/>
                    },
                    {
                        path: ":id/",
                        element: <PokemonSummary/>,
                    },
                    {
                        path: ":id",
                        element: <PokemonSummary/>,
                    },
                    {
                        path: ':id/summary',
                        element: <PokemonSummary/>
                    },
                    {
                        path: ':id/evolutions',
                        element: <EvolutionChainSummary/>
                    },
                    {
                        path: ':id/stats',
                        element: <ComingSoon/>
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
            <MoveTypeProvider>
                <RouterProvider router={router}/>
            </MoveTypeProvider>
        </DarkModeProvider>
    </StrictMode>,
)
