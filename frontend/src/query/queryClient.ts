import {QueryClient, QueryClientConfig} from "@tanstack/react-query";

export const DEFAULT_QUERY_CLIENT_CONFIG: QueryClientConfig = {
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 10, //10 minutes,
            gcTime: 1000 * 60 * 15,
            refetchOnWindowFocus: false,
        },
    },
}
export const queryClient = new QueryClient(DEFAULT_QUERY_CLIENT_CONFIG)
