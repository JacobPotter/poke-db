import {FC, useState} from "react";
import {EvolutionChainLink} from "../../models/evolution.ts";
import {Tooltip} from "../ui/Tooltip.tsx";
import {EvolutionInfo} from "./EvolutionInfo.tsx";
import {SkeletonIcon} from "@/components/ui/Skeletons.tsx";

type EvolutionChainLinkProps = {
    chainLink: Partial<EvolutionChainLink>,
    className?: string
};

export const EvolutionChainItem: FC<EvolutionChainLinkProps> = ({chainLink, className}) => {
    const pokemonSpecies = chainLink.pokemonSpecies;
    const variety = pokemonSpecies?.varieties?.[0];
    const evolutionDetails = chainLink.evolutionDetails

    const [imageLoading, setImageLoading] = useState(true)

    const body = <div data-testid={"chain-item"}
                      className={"p-1 rounded-lg bg-sky-600 border-2 border-sky-500 z-10 " + className}>
        {variety && (
            <>
                <SkeletonIcon className={`w-16 h-auto md:w-24 lg:w-32 ${imageLoading ? "block" : "hidden"}`}/>
                <img
                    className={`w-16 h-auto md:w-24 lg:w-32 ${imageLoading ? "hidden" : "inline"}`}
                    src={variety.sprite_url}
                    alt={`${pokemonSpecies?.name}_icon`}
                    onLoad={() => setImageLoading(false)}
                />
            </>
        )}
    </div>;
    return (
        <>
            {evolutionDetails ? <Tooltip position={"bottom"} body={<EvolutionInfo details={evolutionDetails}/>}>
                {body}
            </Tooltip> : body}
        </>
    )
}
