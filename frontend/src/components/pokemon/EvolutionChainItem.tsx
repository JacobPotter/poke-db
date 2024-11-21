import {FC} from "react";
import {EvolutionChainLink} from "../../models/evolution.ts";

type EvolutionChainLinkProps = {
    chainLink: Partial<EvolutionChainLink>,
    className?: string
};

export const EvolutionChainItem: FC<EvolutionChainLinkProps> = ({chainLink, className}) => {
    const pokemonSpecies = chainLink.pokemonSpecies;
    const variety = pokemonSpecies?.varieties?.[0];

    return (
        <div className={"p-1 rounded-lg bg-sky-600 border-2 border-sky-500 z-10 " + className}>
            {variety && (
                <img
                    className={"w-16 h-auto"}
                    src={variety.sprite_url}
                    alt={`${pokemonSpecies?.name}_icon`}
                />
            )}
        </div>
    )
}
