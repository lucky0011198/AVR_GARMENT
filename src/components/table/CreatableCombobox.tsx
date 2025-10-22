// CreatableCombobox component placeholder
"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { type DropdownOption } from "@/types";
import { ButtonGroup } from "../ui/button-group";
import { removeItemIdOptionAtom, removeItemNameOptionAtom, removePartyNameOptionAtom } from "@/store/atoms";
import { useSetAtom } from "jotai";

interface CreatableComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  onCreateOption: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  type?: "partyName" | "itemName" | "itemId";
}

export function CreatableCombobox({
  value,
  onValueChange,
  options,
  onCreateOption,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled = false,
  type
}: CreatableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const updatePartyName = useSetAtom(removePartyNameOptionAtom);
  const removeItemName = useSetAtom(removeItemNameOptionAtom);
  const removeItemId = useSetAtom(removeItemIdOptionAtom);

  // const parties = useAtomValue(partiesAtom);



  const handleCreate = () => {
    if (searchQuery.trim()) {
      onCreateOption(searchQuery.trim());
      onValueChange(searchQuery.trim());
      setSearchQuery("");
      setOpen(false);
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            className="text-stone-700"
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 p-4">
                <p className="text-sm text-muted-foreground">{emptyText}</p>
                {searchQuery && (
                  <Button size="sm" className="w-full" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add "{searchQuery}"
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) =>
                  option.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((option) => (
                  <ButtonGroup className="w-full justify-between" key={option.value}>
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      className="flex-1"
                      onSelect={() => {
                        onValueChange(option.value);
                        setSearchQuery("");
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <p title={option.label} className="w-[100px] truncate"> 
                      {option.label}
                      </p>
                    </CommandItem>
                    <Button
                    onClick={()=>{
                       if(type === "partyName") {
                        updatePartyName(option.value)
                       } else if(type === "itemName") {
                        removeItemName(option.value)
                       } else if(type === "itemId") {
                        removeItemId(option.value)
                       }
                    }} variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </Button>
                  </ButtonGroup>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
