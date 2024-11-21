import {SkeletonIcon} from "../Skeletons.tsx";
import {expect, test} from 'vitest'
import {render} from "vitest-browser-react";

test('renders the SkeletonIcon correctly', () => {
    const {container} = render(<SkeletonIcon/>)
    const classes = ['rounded-full', 'h-20', 'w-20', 'sm:h-32', 'sm:w-32', 'bg-sky-600', 'opacity-80'];
    classes.forEach(cls => expect(container.firstElementChild?.classList).toContain(cls));
});
