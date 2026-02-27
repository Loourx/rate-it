/**
 * RatingSlider — public API surface.
 *
 * Delegates rendering to <RatingSliderDisplay /> or <RatingSliderInteractive />
 * based on the `size` prop. All constants, types and helpers live in
 * `./ratingSliderUtils.ts` so that both variants can share them.
 */
import React from 'react';
import type { RatingSliderProps } from './ratingSliderUtils';
import { RatingSliderDisplay } from './RatingSliderDisplay';
import { RatingSliderInteractive } from './RatingSliderInteractive';

export type { RatingSliderProps } from './ratingSliderUtils';

export function RatingSlider(props: RatingSliderProps) {
    if (props.size === 'display') {
        return (
            <RatingSliderDisplay
                value={props.value}
                category={props.category}
                layout={props.layout}
                exactScoreDisplay={props.exactScoreDisplay}
            />
        );
    }

    return (
        <RatingSliderInteractive
            value={props.value}
            onValueChange={props.onValueChange}
            category={props.category}
            disabled={props.disabled}
            exactScoreDisplay={props.exactScoreDisplay}
        />
    );
}
