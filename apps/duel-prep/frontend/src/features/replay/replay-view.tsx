import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CardInfo, ParsedReplay } from "@/features/api/types";
import { CardGrid } from "./card-grid";

type ReplayViewProps = {
  replay: ParsedReplay;
  navigation?: {
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
  };
  playerLinks?: {
    player1Id?: string;
    player2Id?: string;
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

const countExpandedCards = (cards: CardInfo[], maxPerCard?: number): number =>
  cards.reduce(
    (sum, card) =>
      sum +
      (maxPerCard ? Math.min(card.card_amount, maxPerCard) : card.card_amount),
    0
  );

export const ReplayView = ({
  navigation,
  playerLinks,
  replay,
}: ReplayViewProps) => {
  const player1TotalCards = aggregateCards(replay.games, "player1_cards");
  const player2TotalCards = aggregateCards(replay.games, "player2_cards");
  const replayUrl = getReplayUrl(replay.replay_id);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            <PlayerName
              name={replay.player1}
              playerId={playerLinks?.player1Id}
            />{" "}
            vs{" "}
            <PlayerName
              name={replay.player2}
              playerId={playerLinks?.player2Id}
            />
          </h2>
          {navigation ? (
            <div className="flex items-center gap-2">
              <Button
                disabled={navigation.current === 0}
                onClick={navigation.onPrev}
                size="icon"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground text-sm">
                {navigation.current + 1} of {navigation.total}
              </span>
              <Button
                disabled={navigation.current === navigation.total - 1}
                onClick={navigation.onNext}
                size="icon"
                variant="outline"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <span>Result: {replay.match_result}</span>
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
      </div>

      {replay.games.map((game) => {
        const gameMaxCards = Math.max(
          countExpandedCards(game.player1_cards.cards),
          countExpandedCards(game.player2_cards.cards)
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 font-medium text-sm">
                  <PlayerName
                    name={game.player1_cards.username}
                    playerId={playerLinks?.player1Id}
                  />{" "}
                  ({game.player1_cards.card_count})
                </p>
                <CardGrid
                  cards={game.player1_cards.cards}
                  minTotalSlots={gameMaxCards}
                />
              </div>
              <div>
                <p className="mb-2 font-medium text-sm">
                  <PlayerName
                    name={game.player2_cards.username}
                    playerId={playerLinks?.player2Id}
                  />{" "}
                  ({game.player2_cards.card_count})
                </p>
                <CardGrid
                  cards={game.player2_cards.cards}
                  minTotalSlots={gameMaxCards}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="rounded-lg border border-border/50 p-4">
        <h3 className="mb-3 font-medium">Total Cards Seen</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(() => {
            const totalMaxCards = Math.max(
              countExpandedCards(player1TotalCards, 3),
              countExpandedCards(player2TotalCards, 3)
            );
            return (
              <>
                <div>
                  <p className="mb-2 font-medium text-sm">
                    <PlayerName
                      name={replay.player1}
                      playerId={playerLinks?.player1Id}
                    />{" "}
                    ({countExpandedCards(player1TotalCards, 3)})
                  </p>
                  <CardGrid
                    cards={player1TotalCards}
                    maxPerCard={3}
                    minTotalSlots={totalMaxCards}
                  />
                </div>
                <div>
                  <p className="mb-2 font-medium text-sm">
                    <PlayerName
                      name={replay.player2}
                      playerId={playerLinks?.player2Id}
                    />{" "}
                    ({countExpandedCards(player2TotalCards, 3)})
                  </p>
                  <CardGrid
                    cards={player2TotalCards}
                    maxPerCard={3}
                    minTotalSlots={totalMaxCards}
                  />
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
