import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CardInfo } from "@/features/api/types";

type CardGridProps = {
  cards: CardInfo[];
  maxPerCard?: number;
  minTotalSlots?: number;
  columns?: 8 | 12;
};

const getCardImageUrl = (cardId: number) =>
  `https://images.duelingbook.com/low-res/${cardId}.jpg`;

const getCardTypeOrder = (cardType: string): number => {
  const type = cardType.toLowerCase();
  if (type.includes("monster")) {
    return 0;
  }
  if (type.includes("spell")) {
    return 1;
  }
  if (type.includes("trap")) {
    return 2;
  }
  return 3;
};

const sortCards = (cards: CardInfo[]): CardInfo[] =>
  [...cards].sort((a, b) => {
    const typeOrderA = getCardTypeOrder(a.card_type);
    const typeOrderB = getCardTypeOrder(b.card_type);
    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB;
    }
    return a.card_name.localeCompare(b.card_name);
  });

type ExpandedCard = {
  card_id: number;
  card_name: string;
  index: number;
};

const expandCards = (
  cards: CardInfo[],
  maxPerCard?: number
): ExpandedCard[] => {
  const sortedCards = sortCards(cards);
  const expanded: ExpandedCard[] = [];

  for (const card of sortedCards) {
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

const MIN_SLOTS_8 = 32;
const MIN_SLOTS_12 = 48;

export const CardGrid = ({
  cards,
  maxPerCard,
  minTotalSlots,
  columns = 8,
}: CardGridProps) => {
  const expandedCards = expandCards(cards, maxPerCard);
  const defaultMinSlots = columns === 12 ? MIN_SLOTS_12 : MIN_SLOTS_8;
  const minSlots = Math.max(
    defaultMinSlots,
    minTotalSlots ?? 0,
    expandedCards.length
  );
  const totalSlots = Math.ceil(minSlots / columns) * columns;
  const emptySlots = totalSlots - expandedCards.length;

  const gridClass =
    columns === 12
      ? "grid grid-cols-6 gap-[3px] sm:grid-cols-9 md:grid-cols-12"
      : "grid grid-cols-4 gap-[3px] sm:grid-cols-6 md:grid-cols-8";

  return (
    <div className={gridClass}>
      {expandedCards.map((card) => (
        <Tooltip key={`${card.card_id}-${card.index}`}>
          <TooltipTrigger asChild>
            <img
              alt={card.card_name}
              className="aspect-[421/614] w-full border border-white/[0.06] transition-colors hover:border-white/20"
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
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          className="aspect-[421/614] border border-white/[0.04] transition-colors hover:border-white/10"
          // biome-ignore lint/suspicious/noArrayIndexKey: empty placeholder slots
          key={i}
        />
      ))}
    </div>
  );
};
