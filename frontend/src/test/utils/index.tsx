// ** FOR TESTING CUSTOM HOOKS ** //
// from https://tkdodo.eu/blog/testing-react-query#for-custom-hooks

// RenderRouteWithOutletContext.tsx
// @ts-expect-error weird directory issue
import React, {ReactElement} from 'react';
import {createMemoryRouter, Outlet, RouterProvider} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {generateQueryClient} from "./client.tsx";
import {ComponentRenderOptions, render as VBRRender} from "vitest-browser-react";
import {QueryClientLoaderFunction} from "@/query/types";

function getRouter(ui: ReactElement, client: QueryClient, loader?: QueryClientLoaderFunction, urlParams?: Record<string, string>, context?: unknown) {


    console.log("Loader?", !!loader)
    let initialPath = `/`;

    if (urlParams) {
        initialPath += "?";
        initialPath += Object.entries(urlParams).map(([key, value]) => `${key}=${value}`).join("&");
    }

    return createMemoryRouter([
        {
            path: "/",
            element: <Outlet context={context}/>,
            loader: loader && loader(client),
            children: [
                {
                    index: true,
                    element: ui
                },
                {
                    path: "*",
                    element: ui
                }
            ]
        }
    ], {initialEntries: [initialPath]})
}

function customRender(ui: ReactElement, options?: ComponentRenderOptions, loader?: QueryClientLoaderFunction, urlParams?: Record<string, string>, context?: unknown) {
    const queryClient = generateQueryClient()
    return VBRRender(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={getRouter(ui, queryClient, loader, urlParams, context)}/>
        </QueryClientProvider>, options
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export * from "vitest-browser-react"

export {customRender as render}

