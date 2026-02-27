/**
 * Card — composable card sub-component system.
 *
 * Usage:
 *   import { Card } from '@/components/card';
 *   <Card.Container onPress={…}>
 *     <Card.Image uri={…} />
 *     <Card.Title title="…" subtitle="…" />
 *     <Card.Meta category="movie" badges={['Action']} />
 *     <Card.Rating score={8.5} category="movie" />
 *     <Card.Actions isLiked onLike={…} />
 *   </Card.Container>
 */
export { CardContainer } from './CardContainer';
export { CardImage } from './CardImage';
export { CardTitle } from './CardTitle';
export { CardMeta } from './CardMeta';
export { CardRating } from './CardRating';
export { CardActions } from './CardActions';

import { CardContainer } from './CardContainer';
import { CardImage } from './CardImage';
import { CardTitle } from './CardTitle';
import { CardMeta } from './CardMeta';
import { CardRating } from './CardRating';
import { CardActions } from './CardActions';

export const Card = {
    Container: CardContainer,
    Image: CardImage,
    Title: CardTitle,
    Meta: CardMeta,
    Rating: CardRating,
    Actions: CardActions,
} as const;
