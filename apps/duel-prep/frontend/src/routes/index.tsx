import { createFileRoute } from "@tanstack/react-router";

const HomePage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <h1 className="font-bold text-2xl">duel-prep</h1>
  </div>
);

export const Route = createFileRoute("/")({
  component: HomePage,
});
