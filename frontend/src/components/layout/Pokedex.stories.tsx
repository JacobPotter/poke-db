import type {Meta, StoryObj} from '@storybook/react';

import Pokedex from './Pokedex.tsx';
import {FC} from "react";
import {ArrowLeftIcon, ArrowRightIcon} from "@heroicons/react/24/outline";

const meta = {
    component: Pokedex,

} satisfies Meta<typeof Pokedex>;

export default meta;

type Story = StoryObj<typeof meta>;

const MockPokeContainer: FC<{ leftLoading?: boolean, rightLoading?: boolean }> = ({leftLoading, rightLoading}) => {
    return (
        <>
            <Pokedex.LeftScreen loading={leftLoading}></Pokedex.LeftScreen>

            <Pokedex.RightScreen size={'large'} loading={rightLoading}></Pokedex.RightScreen>

            <Pokedex.TabButtons>
                <Pokedex.TabButton type={'info'}/>
                <Pokedex.TabButton type={'details'}/>
                <Pokedex.TabButton type={'other'}/>
                <Pokedex.TabButton type={'refresh'}/>
            </Pokedex.TabButtons>
            <Pokedex.KeyboardButtons>
                <Pokedex.KeyboardButton prefixIcon={<ArrowLeftIcon/>}>Previous</Pokedex.KeyboardButton>
                <Pokedex.KeyboardButton suffixIcon={<ArrowRightIcon/>}>Next</Pokedex.KeyboardButton>
            </Pokedex.KeyboardButtons>

        </>
    )
}

export const Default: Story = {
    args: {
        children: <MockPokeContainer/>
    }
};

export const Loading: Story = {
    args: {
        children: <MockPokeContainer leftLoading rightLoading/>
    }
};