"use no memo";

import type { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DataTableColumnFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  placeholder?: string;
};

export const DataTableColumnFilter = <TData, TValue>({
  column,
  placeholder,
}: DataTableColumnFilterProps<TData, TValue>) => {
  const filterValue = column.getFilterValue() as string | undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="size-6 p-0"
          size="sm"
          variant={filterValue ? "default" : "ghost"}
        >
          <Filter className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        <Input
          onChange={(e) => column.setFilterValue(e.target.value)}
          placeholder={placeholder ?? `Filter ${column.id}...`}
          value={filterValue ?? ""}
        />
      </PopoverContent>
    </Popover>
  );
};
