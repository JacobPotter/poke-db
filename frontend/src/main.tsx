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
import {PokemonSummary} from "./components/pokemon/PokemonSummary.tsx";
import {EvolutionChainSummary} from "./components/pokemon/EvolutionChainSummary.tsx";
import {ComingSoon} from "./components/ui/ComingSoon.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./query/queryClient.ts";
import {loader as pokemonLoader} from "./loaders/pokemon.ts";
import {loader as evolutionChainLoader} from "./loaders/evolutionChain.ts";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";


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
                loader: pokemonLoader(queryClient),
                children: [
                    {
                        index: true,
                        element: <Navigate to={"summary"}/>
                    },
                    {
                        path: 'summary',
                        element: <PokemonSummary/>
                    },
                    {
                        path: 'evolutions',
                        loader: evolutionChainLoader(queryClient),
                        element: <EvolutionChainSummary/>
                    },
                    {
                        path: 'stats',
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
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router}/>
                <ReactQueryDevtools/>
            </QueryClientProvider>
        </DarkModeProvider>
    </StrictMode>,
)
