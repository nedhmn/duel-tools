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

export const CardGrid = ({ cards, maxPerCard }: CardGridProps) => {
  const displayCards = maxPerCard
    ? cards.map((card) => ({
        ...card,
        card_amount: Math.min(card.card_amount, maxPerCard),
      }))
    : cards;

  return (
    <div className="flex flex-wrap gap-1">
      {displayCards.map((card) => (
        <Tooltip key={card.card_id}>
          <TooltipTrigger asChild>
            <div className="relative">
              <img
                alt={card.card_name}
                className="h-16 w-auto rounded"
                height={64}
                loading="lazy"
                src={getCardImageUrl(card.card_id)}
                width={44}
              />
              {card.card_amount > 1 && (
                <span className="absolute right-0 bottom-0 rounded-tl bg-black/70 px-1 text-white text-xs">
                  x{card.card_amount}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{card.card_name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
