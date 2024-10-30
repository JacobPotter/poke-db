import Logo from "../../assets/pokedex.svg?react"
import Pokedex from "../layout/Pokedex.tsx";
import {useNavigate} from "react-router-dom";


export function LandingPage() {
    const navigate = useNavigate();
    return (
        <Pokedex>
            <Pokedex.LeftScreen>
                <section
                    className={"animate-pulse flex flex-col items-center justify-center md:items-start md:px-3 md:w-1/2 space-y-6 mt-10 font-mono"}>
                    <Logo className={"py-2 h-24 md:h-32"}/>
                    <h1 className="text-5xl md:text-7xl">PokeDB</h1>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-monofett">Gotta Learn Them All</h2>
                </section>
            </Pokedex.LeftScreen>
            <Pokedex.RightScreen>
                <section>
                    <h3 className={"text-lg md:text-xl pb-2 md:pb-8 md:mt-10"}>Welcome to
                        PokeDB, your ultimate Pokemon
                        database!</h3>
                    <div className={'text-sm lg:text-base font-mono flex flex-col gap-3'}>
                        <p>Select one of the pages below to get started
                        </p>
                    </div>
                </section>
            </Pokedex.RightScreen>

            {/*Card Section*/}
            <Pokedex.KeyboardButtons size={"large"}>
                <Pokedex.KeyboardButton size={'large'}
                                        onClick={() => navigate('pokemon')}>Pokemon</Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton size={'large'} onClick={() => navigate('types')}>Types</Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton size={'large'}
                                        onClick={() => navigate('evolutions')}>Evolutions</Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton size={'large'} onClick={() => navigate('moves')}>Moves</Pokedex.KeyboardButton>
            </Pokedex.KeyboardButtons>

            <Pokedex.TabButtons>
                <Pokedex.TabButton type={'info'}/>
                <Pokedex.TabButton type={'details'}/>
                <Pokedex.TabButton type={'other'}/>
                <Pokedex.TabButton type={'refresh'}/>
            </Pokedex.TabButtons>
        </Pokedex>


    )
}