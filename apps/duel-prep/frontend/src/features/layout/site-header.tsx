import { ThemeToggle } from "@/features/theme/theme-toggle";

type SiteHeaderProps = {
  title: string;
};

export const SiteHeader = ({ title }: SiteHeaderProps) => (
  <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
    <h1 className="font-semibold">{title}</h1>
    <div className="flex items-center gap-1">
      <ThemeToggle />
    </div>
  </header>
);
