import {EvolutionDetails} from "../../models/evolution.ts";
import {FC, ReactElement} from "react";
import {capitalize} from "lodash"

type EvolutionDetailProps = { detail: EvolutionDetails };
export const EvolutionDetail: FC<EvolutionDetailProps> = ({detail}) => {

    let content: ReactElement = <></>

    switch (detail.trigger?.name) {
        case "level-up":
            content = (
                <>
                    <h1><strong>Evolution Trigger:</strong> Level-Up</h1>
                    {detail.minLevel !== 0 &&
                        <h2><strong>Min Level to Evolve:</strong> <span>{detail.minLevel}</span></h2>}
                    {detail.timeOfDay !== "" && <h2><strong>Day/Night: </strong>{detail.timeOfDay}</h2>}
                    {detail.minAffection && <h2><strong>Min Affection:</strong> {detail.minAffection}</h2>}
                    {detail.location && <h2><strong>Location:</strong> {detail.location.name}</h2>}
                    {detail.heldItem && <h2><strong>Holding item:</strong> {detail.heldItem.name}</h2>}
                    {detail.genderId &&
                        <h2><strong>Required Gender:</strong> {detail.genderId === 1 ? "Male" : "Female"}</h2>}
                    {detail.minHappiness && <h2><strong>Min Happiness:</strong> {detail.minHappiness}</h2>}
                    {detail.minBeauty && <h2><strong>Min Beauty:</strong> {detail.minBeauty}</h2>}
                    {detail.knownMove && <h2><strong>Known Move:</strong> {detail.knownMove.name}</h2>}
                    {detail.knownMoveType && <h2><strong>Known Move Type:</strong> {detail.knownMoveType.name}</h2>}
                    {detail.partySpecies && <h2><strong>Species in Party:</strong> {detail.partySpecies.name}</h2>}
                    {detail.partyType && <h2><strong>Species in Party with Type:</strong> {detail.partyType.name}</h2>}
                </>
            )
            break
        case "trade":
            content = (<>
                <h1><strong>Evolution Trigger:</strong> Trade</h1>
                {detail.tradeSpecies && <><h2><strong>Trade Species:</strong> {detail.tradeSpecies.name}</h2><img
                    src={detail.tradeSpecies.varieties[0].sprite_url}
                    alt=""/></>}
                {detail.heldItem && <>
                    <h2><strong>Holding item:</strong> {detail.heldItem.name}</h2>
                    <img src={detail.heldItem?.spriteUrl}
                         alt=""/></>}
            </>)
            break
        case "use-item":
            content = (
                <>
                    <h1><strong>Evolution Trigger:</strong> Use Item</h1>
                    <h2><strong>Item: </strong> <span>{capitalize(detail.item?.name)}</span></h2>
                    <img src={detail.item?.spriteUrl} alt=""/>
                </>
            )
            break
        case "shed":
            break
        case "spin":
            break
        case "tower-of-darkness":
            break
        case "tower-of-waters":
            break
        case "three-critical-hits":
            break
        case "take-damage":
            break
        case "other":
            break
        case "agile-style-move":
            break
        case "strong-style-move":
            break
        case "recoil-damage":
            break
        default:
            break
    }
    return (
        <div className={"flex flex-col gap-2 items-start bg-gray-800 px-2 py-1"}>
            {content}
        </div>
    )
};
