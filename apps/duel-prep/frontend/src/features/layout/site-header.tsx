import { Link } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GlobalSearch } from "@/features/search/global-search";

type BreadcrumbItemData = {
  label: string;
  href?: string;
};

type SiteHeaderProps = {
  breadcrumbs?: BreadcrumbItemData[];
  children?: ReactNode;
};

export const SiteHeader = ({ breadcrumbs = [], children }: SiteHeaderProps) => (
  <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
    {breadcrumbs.length > 0 ? (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    ) : (
      <div />
    )}
    <div className="flex items-center gap-2">
      <GlobalSearch />
      {children}
    </div>
  </header>
);
