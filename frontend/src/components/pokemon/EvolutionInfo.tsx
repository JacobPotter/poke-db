import {FC} from "react";
import {EvolutionDetails} from "../../models/evolution.ts";

import {EvolutionDetail} from "./EvolutionDetail.tsx";

export const EvolutionInfo: FC<{ details: EvolutionDetails[] | undefined }> = ({details}) => {

    if (!details) return <></>

    return (<div key={details[0]?.chainLinkId} className={"flex justify-evenly items-stretch gap-1.5 bg-white"}>
        {details?.map((detail) => (
            <EvolutionDetail detail={detail}/>
        ))}
    </div>)

};
