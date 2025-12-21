import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CardInfo } from "@/features/api/types";

type CardGridProps = {
  cards: CardInfo[];
  maxPerCard?: number;
};

const getCardImageUrl = (cardId: number) =>
  `https://images.duelingbook.com/low-res/${cardId}.jpg`;

type ExpandedCard = {
  card_id: number;
  card_name: string;
  index: number;
};

const expandCards = (
  cards: CardInfo[],
  maxPerCard?: number
): ExpandedCard[] => {
  const expanded: ExpandedCard[] = [];

  for (const card of cards) {
    const count = maxPerCard
      ? Math.min(card.card_amount, maxPerCard)
      : card.card_amount;

    for (let i = 0; i < count; i++) {
      expanded.push({
        card_id: card.card_id,
        card_name: card.card_name,
        index: i,
      });
    }
  }

  return expanded;
};

export const CardGrid = ({ cards, maxPerCard }: CardGridProps) => {
  const expandedCards = expandCards(cards, maxPerCard);

  return (
    <div className="grid grid-cols-8 gap-[3px]">
      {expandedCards.map((card) => (
        <Tooltip key={`${card.card_id}-${card.index}`}>
          <TooltipTrigger asChild>
            <img
              alt={card.card_name}
              className="w-full rounded"
              height={614}
              loading="lazy"
              src={getCardImageUrl(card.card_id)}
              width={421}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{card.card_name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
