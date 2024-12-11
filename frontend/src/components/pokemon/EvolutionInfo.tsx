import {FC} from "react";
import {EvolutionDetails} from "../../models/evolution.ts";

import {EvolutionDetail} from "./EvolutionDetail.tsx";

export const EvolutionInfo: FC<{ details: EvolutionDetails[] | undefined }> = ({details}) => {
    return (<div className={"flex justify-evenly items-stretch gap-1.5 bg-white"}>
        {details?.map((detail) => (
            <EvolutionDetail detail={detail}/>
        ))}
    </div>)

};
