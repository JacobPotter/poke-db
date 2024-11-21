import {ErrorScreen} from '../ErrorScreen.tsx';
import {render} from 'vitest-browser-react';
import axios from 'axios';
import {ERROR_MESSAGES} from '../../../constants/messages.ts';
import {describe, expect, it} from 'vitest';

interface TestError extends Error {
    status?: number;
}

describe('ErrorScreen', () => {

    it('displays an Axios error message', async () => {
        const error: TestError = new axios.AxiosError('Axios error occurred');
        error.status = 500;
        const {getByText} = render(<ErrorScreen error={error}/>);
        expect(getByText(ERROR_MESSAGES[error.status])).toBeTruthy();
    });

    it('displays a standard error message', async () => {
        const errorMessage = 'Standard error occurred';
        const error = new Error(errorMessage);
        const {getByText} = render(<ErrorScreen error={error}/>);
        expect(getByText(errorMessage)).toBeTruthy();
    });
});
