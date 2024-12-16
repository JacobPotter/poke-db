import {PropsWithChildren} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {DEFAULT_QUERY_CLIENT_CONFIG} from "@/query/queryClient.ts";

export const createQueryClientWrapper = () => {
    const queryClient = generateQueryClient()
    return ({children}: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
export const generateQueryClient = () => {
    const queryClientConfig = {...DEFAULT_QUERY_CLIENT_CONFIG};
    queryClientConfig.defaultOptions = {
        ...queryClientConfig.defaultOptions,
        queries: {
            ...queryClientConfig?.defaultOptions?.queries,
            retry: false
        }
    }
    return new QueryClient(queryClientConfig);
}
