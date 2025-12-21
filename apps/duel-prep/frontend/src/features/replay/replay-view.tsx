import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

export const ReplayView = ({ navigation, replay }: ReplayViewProps) => {
  const player1TotalCards = aggregateCards(replay.games, "player1_cards");
  const player2TotalCards = aggregateCards(replay.games, "player2_cards");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">
            {replay.player1} vs {replay.player2}
          </h2>
          <p className="text-muted-foreground text-sm">
            Result: {replay.match_result}
          </p>
        </div>

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

      {replay.games.map((game) => (
        <Card key={game.game_number}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Game {game.game_number}
              <span className="ml-2 font-normal text-muted-foreground">
                {game.winner ? `Winner: ${game.winner}` : "No winner"} | First:{" "}
                {game.went_first}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 font-medium text-sm">
                  {game.player1_cards.username} ({game.player1_cards.card_count}
                  )
                </p>
                <CardGrid cards={game.player1_cards.cards} />
              </div>
              <div>
                <p className="mb-2 font-medium text-sm">
                  {game.player2_cards.username} ({game.player2_cards.card_count}
                  )
                </p>
                <CardGrid cards={game.player2_cards.cards} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Separator />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Total Cards Seen (max 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 font-medium text-sm">{replay.player1}</p>
              <CardGrid cards={player1TotalCards} maxPerCard={3} />
            </div>
            <div>
              <p className="mb-2 font-medium text-sm">{replay.player2}</p>
              <CardGrid cards={player2TotalCards} maxPerCard={3} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
