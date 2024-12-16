import axios from "axios";
import {MoveTypeResp} from "@/models/pokemon.ts";

export async function getMoveTypes() {
    const {data} = await axios.get<MoveTypeResp>("/api/v1/type");
    return data.data
}
