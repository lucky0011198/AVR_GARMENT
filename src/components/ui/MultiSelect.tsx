"use client";

// import * as React from "react";
// import { type DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// type Checked = DropdownMenuCheckboxItemProps["checked"];

export default function MultiSelect() {
  // const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  // const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  // const [showPanel, setShowPanel] = React.useState<Checked>(false);

  const data = {
    buttonLabel: "select",
    title: "select users",
    options: [
      { id: "1", name: "user1", isSelected: true },
      { id: "1", name: "user1", isSelected: true },
      { id: "1", name: "user1", isSelected: true },
      { id: "2", name: "user2", isSelected: false },
    ],
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{data.buttonLabel}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{data.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.options.map((option) => (
          <DropdownMenuCheckboxItem
            checked={option.isSelected}
            onCheckedChange={(checked) => {option.isSelected = checked as boolean}} // Update the isSelected property
          >
            {option.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
