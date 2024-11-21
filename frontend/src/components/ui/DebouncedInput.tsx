import {ChangeEventHandler, FC, useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';

interface DebouncedInputProps {
    value: number; // Prop from parent component to set the initial and current value.
    onChange: (value: number) => void; // Callback function to notify parent of the debounced value.
    className?: string;
}

const DebouncedInput: FC<DebouncedInputProps> = ({value, onChange, className}) => {
    const [internalValue, setInternalValue] = useState<number>(value); // Internal state to manage input value.
    const [debouncedValue] = useDebounce(internalValue, 500); // Create a debounced version of internalValue.

    useEffect(() => {
        onChange(debouncedValue); // Call onChange with debounced value after the delay.
    }, [debouncedValue, onChange]);

    // Handle input changes immediately.
    const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
        e.preventDefault();
        setInternalValue(parseInt(e.target.value, 10) || 0); // Ensure internalValue updates immediately.
    };

    // Initial value synchronization from prop
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    return (
        <input
            type="number"
            id="selection"
            data-testid={"debounce-input"}
            className={className}
            value={internalValue} // Set the value of the input field to internalValue.
            onChange={handleChange} // Handle input changes.
        />
    );
};

export default DebouncedInput;
