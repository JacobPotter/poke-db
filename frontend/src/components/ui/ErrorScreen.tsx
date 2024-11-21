import {AxiosError} from "axios";
import {ERROR_MESSAGES} from "../../constants/messages.ts";

interface ErrorScreenProps {
    error: Error
}

export function ErrorScreen({error}: ErrorScreenProps) {
    let content: string
    if (error instanceof AxiosError) {
        console.error(error.message)

        if (error.status) {
            content = ERROR_MESSAGES[error?.status]
        } else {
            content = error.message
        }


    } else {
        console.error(error.message)
        content = error.message;
    }
    return <div className={"flex flex-col space-y-5"}>
        <h1 className="text-3xl">Error</h1>
        <p>{content}</p>
    </div>;
}
