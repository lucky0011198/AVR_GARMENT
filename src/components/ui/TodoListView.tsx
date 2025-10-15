"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  getPartyByIdAtom,
  partyNamesAtom,
  setPartyByIdAtom,
} from "@/atom/partyAtom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

export type Framework = {
  value: string;
  label: string;
};

const defaultFrameworks: Framework[] = [
  { value: "name", label: "name" },
  { value: "user", label: "user" },
];

const PartyItems: Framework[] = [
  { value: "panjabi", label: "panjabi" },
  { value: "pinako", label: "pinako" },
];

export default function TodoListView({
  selected,
  type,
}: {
  selected?: string;
  type: "item" | "partyName";
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");
  const setPartyById = useSetAtom(setPartyByIdAtom);
  const getPartyById = useAtomValue(getPartyByIdAtom);

  const [frameworks, setFrameworks] = React.useState<Framework[]>(
    type == "item" ? PartyItems : defaultFrameworks
  );

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue === value ? "" : selectedValue);
    setOpen(false);
  };

  React.useEffect(() => {
    const party = getPartyById(1);
    if (!party) return;
    setPartyById({
      partyId: 1,
      updatedParty: { ...party, party_name: value },
    });
  }, [value]);

  const handleAddNew = () => {
    if (!inputValue.trim()) return;
    const newItem = {
      value: inputValue.toLowerCase().replace(/\s+/g, "-"),
      label: inputValue.trim(),
    };
    setFrameworks((prev) => [...prev, newItem]);
    setValue(newItem.value);
    setInputValue("");
    setOpen(false);
  };

  const filteredFrameworks = frameworks.filter((f) =>
    f.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showAddOption =
    inputValue.trim().length > 0 &&
    !frameworks.some((f) => f.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : selected || "Select framework..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput
            placeholder="Search or add..."
            className="h-9"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>

            <CommandGroup>
              {filteredFrameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={handleSelect}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}

              {showAddOption && (
                <CommandItem
                  onSelect={handleAddNew}
                  className="flex items-center gap-2 text-primary"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add “{inputValue}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
