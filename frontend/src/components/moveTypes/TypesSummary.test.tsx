import {render} from 'vitest-browser-react';
import {TypesSummary} from './TypesSummary';
import {describe, expect, it} from 'vitest';
import {MoveType} from "../../models/pokemon.ts";

describe('TypesSummary', () => {
    it('should display No Type Data when moveType is undefined', () => {
        const {container} = render(<TypesSummary/>);
        expect(container.textContent).toBe('No Type Data');
    });

    it('should display information about moveType when moveType is defined', () => {
        const exampleMoveType: MoveType = {
            id: 7,
            name: 'Flying',
            double_damage_to: [2, 4],
            half_damage_to: [6, 8, 9],
            no_damage_to: [],
            double_damage_from: [3, 5],
            half_damage_from: [1],
            img_url: 'someImageUrl',
            no_damage_from: [],
        };

        const {getByText, getByAltText} = render(<TypesSummary moveType={exampleMoveType}/>);

        expect(getByText('Type: Flying').element()).toBeInTheDocument();
        expect(getByAltText('Flying').element()).toBeInTheDocument();

    });
});
