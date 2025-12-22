import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CardInfo, ParsedReplay } from "@/features/api/types";
import { cn } from "@/lib/utils";
import { CardGrid } from "./card-grid";

type NavigationItem = {
  label: string;
  sublabel?: string;
};

export type PlayerFilter = "both" | "player" | "opponent";
export type BatchFilter = "both" | "player1" | "player2";

type ReplayViewProps = {
  replay: ParsedReplay;
  navigation?: {
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    items?: NavigationItem[];
    onSelect?: (index: number) => void;
  };
  playerLinks?: {
    player1Id?: string;
    player2Id?: string;
  };
  playerFilter?: {
    focusedPlayerName: string;
    value: PlayerFilter;
    onChange: (value: PlayerFilter) => void;
  };
  batchFilter?: {
    value: BatchFilter;
    onChange: (value: BatchFilter) => void;
  };
};

type PlayerNameProps = {
  name: string;
  playerId?: string;
};

const PlayerName = ({ name, playerId }: PlayerNameProps) => {
  if (playerId) {
    return (
      <Link
        className="hover:text-primary hover:underline"
        params={{ "player-id": playerId }}
        to="/players/$player-id"
      >
        {name}
      </Link>
    );
  }
  return <>{name}</>;
};

type ReplayNavigationProps = {
  current: number;
  total: number;
  items?: NavigationItem[];
  onPrev: () => void;
  onNext: () => void;
  onSelect?: (index: number) => void;
};

const ReplayNavigation = ({
  current,
  total,
  items,
  onPrev,
  onNext,
  onSelect,
}: ReplayNavigationProps) => {
  const [open, setOpen] = useState(false);

  const currentItem = items?.[current];
  const hasCombobox = items && items.length > 0 && onSelect;

  return (
    <div className="flex items-center gap-1">
      <Button
        disabled={current === 0}
        onClick={onPrev}
        size="icon"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {hasCombobox ? (
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="w-[200px] justify-between"
              role="combobox"
              size="sm"
              variant="outline"
            >
              <span className="truncate">
                {currentItem?.label ?? `${current + 1} of ${total}`}
              </span>
              <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput placeholder="Search replays..." />
              <CommandList>
                <CommandEmpty>No replay found.</CommandEmpty>
                <CommandGroup>
                  {items.map((item, index) => (
                    <CommandItem
                      key={`${item.label}-${item.sublabel ?? index}`}
                      onSelect={() => {
                        onSelect(index);
                        setOpen(false);
                      }}
                      value={`${item.label} ${item.sublabel ?? ""}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          current === index ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        {item.sublabel ? (
                          <span className="text-muted-foreground text-xs">
                            {item.sublabel}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <span className="px-2 text-muted-foreground text-sm">
          {current + 1} of {total}
        </span>
      )}
      <Button
        disabled={current === total - 1}
        onClick={onNext}
        size="icon"
        variant="outline"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const aggregateCards = (
  games: ParsedReplay["games"],
  playerKey: "player1_cards" | "player2_cards"
): CardInfo[] => {
  const cardMap = new Map<number, CardInfo>();

  for (const game of games) {
    for (const card of game[playerKey].cards) {
      const existing = cardMap.get(card.card_id);
      if (existing) {
        existing.card_amount = Math.max(existing.card_amount, card.card_amount);
      } else {
        cardMap.set(card.card_id, { ...card });
      }
    }
  }

  return Array.from(cardMap.values());
};

const getReplayUrl = (replayId: number) =>
  `https://www.duelingbook.com/replay?id=${replayId}`;

const flipMatchResult = (result: string): string => {
  const parts = result.split("-");
  if (parts.length === 2) {
    return `${parts[1]}-${parts[0]}`;
  }
  if (parts.length === 3) {
    return `${parts[1]}-${parts[0]}-${parts[2]}`;
  }
  return result;
};

const countExpandedCards = (cards: CardInfo[], maxPerCard?: number): number =>
  cards.reduce(
    (sum, card) =>
      sum +
      (maxPerCard ? Math.min(card.card_amount, maxPerCard) : card.card_amount),
    0
  );

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

const sortCardsForYdk = (cards: CardInfo[]): CardInfo[] =>
  [...cards].sort((a, b) => {
    const typeOrderA = getCardTypeOrder(a.card_type);
    const typeOrderB = getCardTypeOrder(b.card_type);
    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB;
    }
    return a.card_name.localeCompare(b.card_name);
  });

const generateYdkContent = (cards: CardInfo[], maxPerCard = 3): string => {
  const sortedCards = sortCardsForYdk(cards);
  const lines: string[] = ["#created by duel-prep", "#main"];

  for (const card of sortedCards) {
    if (!card.serial_number) {
      continue;
    }
    const count = Math.min(card.card_amount, maxPerCard);
    for (let i = 0; i < count; i++) {
      lines.push(card.serial_number);
    }
  }

  lines.push("#extra", "", "!side", "");
  return lines.join("\n");
};

const sanitizeFilename = (name: string): string =>
  name.replace(/[/\\:*?"<>|]/g, "_");

const downloadYdk = (
  cards: CardInfo[],
  playerName: string,
  playedAt: string
): void => {
  const content = generateYdkContent(cards);
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const date = new Date(playedAt).toISOString().split("T")[0];
  const filename = `${sanitizeFilename(playerName)}_${date}.ydk`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const ReplayView = ({
  batchFilter,
  navigation,
  playerFilter,
  playerLinks,
  replay,
}: ReplayViewProps) => {
  const player1TotalCards = aggregateCards(replay.games, "player1_cards");
  const player2TotalCards = aggregateCards(replay.games, "player2_cards");
  const replayUrl = getReplayUrl(replay.replay_id);

  const focusedIsPlayer1 = playerFilter
    ? replay.player1 === playerFilter.focusedPlayerName
    : true;

  const computeShowPlayers = (): {
    showPlayer1: boolean;
    showPlayer2: boolean;
  } => {
    if (batchFilter) {
      return {
        showPlayer1:
          batchFilter.value === "both" || batchFilter.value === "player1",
        showPlayer2:
          batchFilter.value === "both" || batchFilter.value === "player2",
      };
    }
    if (playerFilter) {
      return {
        showPlayer1:
          playerFilter.value === "both" ||
          (playerFilter.value === "player" && focusedIsPlayer1) ||
          (playerFilter.value === "opponent" && !focusedIsPlayer1),
        showPlayer2:
          playerFilter.value === "both" ||
          (playerFilter.value === "player" && !focusedIsPlayer1) ||
          (playerFilter.value === "opponent" && focusedIsPlayer1),
      };
    }
    return { showPlayer1: true, showPlayer2: true };
  };

  const { showPlayer1, showPlayer2 } = computeShowPlayers();

  const shouldSwapOrder = playerFilter && !focusedIsPlayer1;

  const displayResult = shouldSwapOrder
    ? flipMatchResult(replay.match_result)
    : replay.match_result;

  const firstPlayer = shouldSwapOrder ? replay.player2 : replay.player1;
  const secondPlayer = shouldSwapOrder ? replay.player1 : replay.player2;
  const firstPlayerId = shouldSwapOrder
    ? playerLinks?.player2Id
    : playerLinks?.player1Id;
  const secondPlayerId = shouldSwapOrder
    ? playerLinks?.player1Id
    : playerLinks?.player2Id;

  const firstTotalCards = shouldSwapOrder
    ? player2TotalCards
    : player1TotalCards;
  const secondTotalCards = shouldSwapOrder
    ? player1TotalCards
    : player2TotalCards;
  const showFirst = shouldSwapOrder ? showPlayer2 : showPlayer1;
  const showSecond = shouldSwapOrder ? showPlayer1 : showPlayer2;

  const gridColsClass =
    showPlayer1 && showPlayer2 ? "md:grid-cols-2" : "md:grid-cols-1";

  const cardColumns = showPlayer1 && showPlayer2 ? 8 : 12;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">
            <PlayerName name={firstPlayer} playerId={firstPlayerId} /> vs{" "}
            <PlayerName name={secondPlayer} playerId={secondPlayerId} />
          </h2>
          {navigation ? (
            <ReplayNavigation
              current={navigation.current}
              items={navigation.items}
              onNext={navigation.onNext}
              onPrev={navigation.onPrev}
              onSelect={navigation.onSelect}
              total={navigation.total}
            />
          ) : null}
        </div>
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <span>Result: {displayResult}</span>
          <a
            className="inline-flex items-center gap-1 hover:text-foreground"
            href={replayUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {replayUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {playerFilter ? (
          <ToggleGroup
            className="justify-start"
            onValueChange={(val) => {
              if (val) {
                playerFilter.onChange(val as PlayerFilter);
              }
            }}
            type="single"
            value={playerFilter.value}
          >
            <ToggleGroupItem size="sm" value="both">
              Both
            </ToggleGroupItem>
            <ToggleGroupItem size="sm" value="player">
              {playerFilter.focusedPlayerName}
            </ToggleGroupItem>
            <ToggleGroupItem size="sm" value="opponent">
              Opponent
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
        {batchFilter ? (
          <ToggleGroup
            className="justify-start"
            onValueChange={(val) => {
              if (val) {
                batchFilter.onChange(val as BatchFilter);
              }
            }}
            type="single"
            value={batchFilter.value}
          >
            <ToggleGroupItem size="sm" value="both">
              Both
            </ToggleGroupItem>
            <ToggleGroupItem size="sm" value="player1">
              {replay.player1}
            </ToggleGroupItem>
            <ToggleGroupItem size="sm" value="player2">
              {replay.player2}
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
      </div>

      <div className="rounded-lg border border-border/50 p-4">
        <h3 className="mb-3 font-medium">Total Cards Seen</h3>
        <div className={cn("grid grid-cols-1 gap-4", gridColsClass)}>
          {(() => {
            const totalMaxCards = Math.max(
              countExpandedCards(firstTotalCards, 3),
              countExpandedCards(secondTotalCards, 3)
            );
            return (
              <>
                {showFirst ? (
                  <div>
                    <p className="mb-2 flex items-center gap-3 font-medium text-sm">
                      <span>
                        <PlayerName
                          name={firstPlayer}
                          playerId={firstPlayerId}
                        />{" "}
                        ({countExpandedCards(firstTotalCards, 3)})
                      </span>
                      <button
                        className="font-normal text-muted-foreground text-xs hover:text-foreground"
                        onClick={() =>
                          downloadYdk(
                            firstTotalCards,
                            firstPlayer,
                            replay.played_at
                          )
                        }
                        type="button"
                      >
                        Download deck
                      </button>
                    </p>
                    <CardGrid
                      cards={firstTotalCards}
                      columns={cardColumns}
                      maxPerCard={3}
                      minTotalSlots={totalMaxCards}
                    />
                  </div>
                ) : null}
                {showSecond ? (
                  <div>
                    <p className="mb-2 flex items-center gap-3 font-medium text-sm">
                      <span>
                        <PlayerName
                          name={secondPlayer}
                          playerId={secondPlayerId}
                        />{" "}
                        ({countExpandedCards(secondTotalCards, 3)})
                      </span>
                      <button
                        className="font-normal text-muted-foreground text-xs hover:text-foreground"
                        onClick={() =>
                          downloadYdk(
                            secondTotalCards,
                            secondPlayer,
                            replay.played_at
                          )
                        }
                        type="button"
                      >
                        Download deck
                      </button>
                    </p>
                    <CardGrid
                      cards={secondTotalCards}
                      columns={cardColumns}
                      maxPerCard={3}
                      minTotalSlots={totalMaxCards}
                    />
                  </div>
                ) : null}
              </>
            );
          })()}
        </div>
      </div>

      {replay.games.map((game) => {
        const firstGameCards = shouldSwapOrder
          ? game.player2_cards
          : game.player1_cards;
        const secondGameCards = shouldSwapOrder
          ? game.player1_cards
          : game.player2_cards;
        const gameMaxCards = Math.max(
          countExpandedCards(firstGameCards.cards),
          countExpandedCards(secondGameCards.cards)
        );
        return (
          <div
            className="rounded-lg border border-border/50 p-4"
            key={game.game_number}
          >
            <h3 className="mb-3 font-medium">
              Game {game.game_number}
              <span className="ml-2 font-normal text-muted-foreground text-sm">
                {game.winner ? `Winner: ${game.winner}` : "No winner"} | First:{" "}
                {game.went_first}
              </span>
            </h3>
            <div className={cn("grid grid-cols-1 gap-4", gridColsClass)}>
              {showFirst ? (
                <div>
                  <p className="mb-2 flex items-center gap-3 font-medium text-sm">
                    <span>
                      <PlayerName
                        name={firstGameCards.username}
                        playerId={firstPlayerId}
                      />{" "}
                      ({firstGameCards.card_count})
                    </span>
                    <button
                      className="font-normal text-muted-foreground text-xs hover:text-foreground"
                      onClick={() =>
                        downloadYdk(
                          firstGameCards.cards,
                          firstGameCards.username,
                          replay.played_at
                        )
                      }
                      type="button"
                    >
                      Download deck
                    </button>
                  </p>
                  <CardGrid
                    cards={firstGameCards.cards}
                    columns={cardColumns}
                    minTotalSlots={gameMaxCards}
                  />
                </div>
              ) : null}
              {showSecond ? (
                <div>
                  <p className="mb-2 flex items-center gap-3 font-medium text-sm">
                    <span>
                      <PlayerName
                        name={secondGameCards.username}
                        playerId={secondPlayerId}
                      />{" "}
                      ({secondGameCards.card_count})
                    </span>
                    <button
                      className="font-normal text-muted-foreground text-xs hover:text-foreground"
                      onClick={() =>
                        downloadYdk(
                          secondGameCards.cards,
                          secondGameCards.username,
                          replay.played_at
                        )
                      }
                      type="button"
                    >
                      Download deck
                    </button>
                  </p>
                  <CardGrid
                    cards={secondGameCards.cards}
                    columns={cardColumns}
                    minTotalSlots={gameMaxCards}
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
