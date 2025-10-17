"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Save as SaveIcon,
  Search,
  X as XIcon,
  Check,
  ChevronsUpDown,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { tr } from "date-fns/locale";
import Todo from "@/components/TodoList";

// User Role Type
type UserRole = "admin" | "cutting" | "distributor";

// Type definitions
interface User {
  name: string;
  id: string;
}

interface Item {
  _internalId: string;
  id: string;
  name: string;
  description: string;
  recived: string;
  cuttting: string;
  sizes: string[];
  user: User[];
  collected: string;
  givenClothDate?: Date;
  cuttingDate?: Date;
  collectDate?: Date;
}

interface Party {
  id: number;
  party_name: string;
  Items: Item[];
}

// Column Configuration based on roles
const roleColumnConfig = {
  admin: {
    partyName: true,
    itemId: true,
    itemName: true,
    description: true,
    received: true,
    givenDate: true,
    cutting: false,
    cuttingDate: false,
    collected: false,
    collectDate: false,
    sizes: false,
    users: false,
  },
  cutting: {
    partyName: false,
    itemId: true,
    itemName: true,
    description: true,
    received: true,
    givenDate: false,
    cutting: true,
    cuttingDate: true,
    collected: false,
    collectDate: false,
    sizes: true,
    users: false,
  },
  distributor: {
    partyName: false,
    itemId: true,
    itemName: true,
    description: true,
    received: false,
    givenDate: false,
    cutting: true,
    cuttingDate: false,
    collected: false,
    collectDate: false,
    sizes: true,
    users: true,
  },
};

// Dropdown options (will be updated dynamically)
let partyNameOptions = [
  { value: "ABC Textiles", label: "ABC Textiles" },
  { value: "XYZ Fabrics", label: "XYZ Fabrics" },
  { value: "Premium Cloth House", label: "Premium Cloth House" },
  { value: "Royal Garments", label: "Royal Garments" },
  { value: "Golden Threads", label: "Golden Threads" },
  { value: "Fashion Hub", label: "Fashion Hub" },
  { value: "Silk Palace", label: "Silk Palace" },
];

let itemNameOptions = [
  { value: "panjabi", label: "Panjabi" },
  { value: "kurta", label: "Kurta" },
  { value: "shirt", label: "Shirt" },
  { value: "pant", label: "Pant" },
  { value: "saree", label: "Saree" },
  { value: "dupatta", label: "Dupatta" },
  { value: "sherwani", label: "Sherwani" },
  { value: "blouse", label: "Blouse" },
];

let itemIdOptions = [
  { value: "10001", label: "10001" },
  { value: "10002", label: "10002" },
  { value: "10003", label: "10003" },
  { value: "10004", label: "10004" },
  { value: "10005", label: "10005" },
  { value: "10092", label: "10092" },
  { value: "10093", label: "10093" },
  { value: "10094", label: "10094" },
  { value: "10095", label: "10095" },
];

// Initial data with internal IDs
const initialData: Party[] = [
  {
    id: 1,
    party_name: "ABC Textiles",
    Items: [
      {
        _internalId: "item-1-1",
        id: "10001",
        name: "panjabi",
        description: "this is a good panjabi",
        recived: "8000m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-10-01"),
        cuttingDate: new Date("2025-10-05"),
        collectDate: new Date("2025-10-10"),
      },
      {
        _internalId: "item-1-2",
        id: "10092",
        name: "kurta",
        description: "this is a good kurta",
        recived: "8070m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-10-02"),
        cuttingDate: new Date("2025-10-06"),
        collectDate: new Date("2025-10-12"),
      },
    ],
  },
  {
    id: 2,
    party_name: "XYZ Fabrics",
    Items: [
      {
        _internalId: "item-2-1",
        id: "10002",
        name: "shirt",
        description: "this is a good shirt",
        recived: "8000m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-09-25"),
        cuttingDate: new Date("2025-09-30"),
        collectDate: new Date("2025-10-08"),
      },
      {
        _internalId: "item-2-2",
        id: "10003",
        name: "pant",
        description: "this is a good pant",
        recived: "8000m",
        cuttting: "1000m",
        sizes: ["34:10", "34:12", "34:14"],
        user: [
          { name: "user1", id: "1" },
          { name: "user2", id: "2" },
          { name: "user3", id: "3" },
        ],
        collected: "3000:200",
        givenClothDate: new Date("2025-09-28"),
        cuttingDate: new Date("2025-10-03"),
        collectDate: new Date("2025-10-09"),
      },
    ],
  },
];

// Format date to short format like "12 Jan 2025"
const formatShortDate = (date?: Date) => {
  if (!date) return "Not set";
  return format(date, "d MMM yyyy");
};

// Creatable Combobox Component
function CreatableCombobox({
  value,
  onValueChange,
  options,
  onCreateOption,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  onCreateOption: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
                  <CommandItem
                    key={option.value}
                    value={option.value}
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
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Date Picker Component with Clear and Today Buttons
function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
}: {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    onDateChange(undefined);
    setOpen(false);
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) {
      setOpen(false);
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatShortDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="p-3 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleToday}
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Editable Cell Component with Dialog
const EditableCell = ({
  value,
  onSave,
  label,
}: {
  value: string;
  onSave: (newValue: string) => void;
  label: string;
}) => {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);

  React.useEffect(() => {
    if (open) {
      setEditValue(value);
    }
  }, [open, value]);

  const handleSave = () => {
    onSave(editValue);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:bg-accent p-2 rounded transition-colors">
          {value}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {label}</DialogTitle>
          <DialogDescription>
            Make changes to {label.toLowerCase()} here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-input">{label}</Label>
            <Input
              id="edit-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Editable Textarea Component with Dialog
const EditableTextarea = ({
  value,
  onSave,
  label,
}: {
  value: string;
  onSave: (newValue: string) => void;
  label: string;
}) => {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);

  React.useEffect(() => {
    if (open) {
      setEditValue(value);
    }
  }, [open, value]);

  const handleSave = () => {
    onSave(editValue);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:bg-accent p-2 rounded transition-colors min-h-[40px]">
          {value}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {label}</DialogTitle>
          <DialogDescription>
            Make changes to {label.toLowerCase()} here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-textarea">{label}</Label>
            <Textarea
              id="edit-textarea"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Sizes Todo List Manager with Creatable Combobox
const SizesTodo = ({
  items,
  onUpdate,
}: {
  items: string[];
  onUpdate: (newItems: string[]) => void;
}) => {
  const [newItem, setNewItem] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [openCombo, setOpenCombo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Predefined size options
  const sizeOptions = [
    { value: "34:10", label: "34:10" },
    { value: "34:12", label: "34:12" },
    { value: "34:14", label: "34:14" },
    { value: "36:10", label: "36:10" },
    { value: "36:12", label: "36:12" },
    { value: "36:14", label: "36:14" },
    { value: "38:10", label: "38:10" },
    { value: "38:12", label: "38:12" },
    { value: "38:14", label: "38:14" },
    { value: "40:10", label: "40:10" },
    { value: "40:12", label: "40:12" },
    { value: "40:14", label: "40:14" },
    { value: "42:10", label: "42:10" },
    { value: "42:12", label: "42:12" },
    { value: "42:14", label: "42:14" },
    { value: "S:5", label: "S:5" },
    { value: "M:10", label: "M:10" },
    { value: "L:15", label: "L:15" },
    { value: "XL:20", label: "XL:20" },
    { value: "XXL:25", label: "XXL:25" },
  ];

  const handleAdd = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onUpdate([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleAddFromCombo = (value: string) => {
    if (!items.includes(value)) {
      onUpdate([...items, value]);
    }
    setSearchQuery("");
    setOpenCombo(false);
  };

  const handleCreateFromCombo = () => {
    if (searchQuery.trim() && !items.includes(searchQuery.trim())) {
      onUpdate([...items, searchQuery.trim()]);
      setSearchQuery("");
      setOpenCombo(false);
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
    const newChecked = new Set(checkedItems);
    newChecked.delete(index);
    setCheckedItems(newChecked);
  };

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Popover open={openCombo} onOpenChange={setOpenCombo}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombo}
              className="flex-1 justify-between"
            >
              Select or add size...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search or type new size..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="flex flex-col items-center gap-2 p-4">
                    <p className="text-sm text-muted-foreground">
                      No size found.
                    </p>
                    {searchQuery && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={handleCreateFromCombo}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add "{searchQuery}"
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {sizeOptions
                    .filter(
                      (option) =>
                        option.label
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) &&
                        !items.includes(option.value)
                    )
                    .map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleAddFromCombo(option.value)}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        {option.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sizes added yet
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent transition-colors"
            >
              <span
                className={cn(
                  "flex-1 font-mono text-sm",
                  checkedItems.has(index) &&
                    "line-through text-muted-foreground"
                )}
              >
                {item}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemove(index)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Total: {items.length} sizes | Completed: {checkedItems.size}
          </p>
        </div>
      )}
    </div>
  );
};

// User Manager Component
const UserManager = ({
  users,
  onUpdate,
}: {
  users: User[];
  onUpdate: (newUsers: User[]) => void;
}) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserId, setNewUserId] = useState("");

  const handleAdd = () => {
    if (newUserName.trim() && newUserId.trim()) {
      onUpdate([...users, { name: newUserName, id: newUserId }]);
      setNewUserName("");
      setNewUserId("");
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(users.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="User name..."
        />
        <Input
          value={newUserId}
          onChange={(e) => setNewUserId(e.target.value)}
          placeholder="User ID..."
        />
        <Button onClick={handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No users added yet
          </p>
        ) : (
          users.map((user, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 rounded-md border bg-card"
            >
              <div className="flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  ID: {user.id}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemove(index)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Component
export default function DataVisualizationTable() {
  const [data, setData] = useState<Party[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("admin");

  // Get column visibility based on current role
  const columnVisibility = roleColumnConfig[userRole];

  // Update item field using internal ID
  const updateItemField = (
    partyId: number,
    internalItemId: string,
    field: keyof Item,
    value: any
  ) => {
    setData((prevData) =>
      prevData.map((party) =>
        party.id === partyId
          ? {
              ...party,
              Items: party.Items.map((item) =>
                item._internalId === internalItemId
                  ? { ...item, [field]: value }
                  : item
              ),
            }
          : party
      )
    );
  };

  const updatePartyName = (partyId: number, newName: string) => {
    setData((prevData) =>
      prevData.map((party) =>
        party.id === partyId ? { ...party, party_name: newName } : party
      )
    );
  };

  // Handle creating new options
  const handleCreatePartyName = (value: string) => {
    if (!partyNameOptions.find((opt) => opt.value === value)) {
      partyNameOptions = [...partyNameOptions, { value, label: value }];
    }
  };

  const handleCreateItemName = (value: string) => {
    if (!itemNameOptions.find((opt) => opt.value === value)) {
      itemNameOptions = [...itemNameOptions, { value, label: value }];
    }
  };

  const handleCreateItemId = (value: string) => {
    if (!itemIdOptions.find((opt) => opt.value === value)) {
      itemIdOptions = [...itemIdOptions, { value, label: value }];
    }
  };

  const handleSaveData = () => {
    console.log("=== SAVED DATA ===");
    console.log("Current User Role:", userRole);
    console.log(partyNameOptions);

    // Remove internal IDs before logging
    const dataToSave = data.map((party) => ({
      ...party,
      Items: party.Items.map((item) => {
        const { _internalId, ...itemWithoutInternal } = item;
        return itemWithoutInternal;
      }),
    }));
    console.log(JSON.stringify(dataToSave, null, 2));
    console.log("==================");

    // Also log in a more readable format
    data.forEach((party) => {
      console.log(`\nParty: ${party.party_name} (ID: ${party.id})`);
      party.Items.forEach((item) => {
        console.log(`  Item: ${item.name} (ID: ${item.id})`);
        console.log(`    Description: ${item.description}`);
        console.log(`    Received: ${item.recived}`);
        console.log(`    Cutting: ${item.cuttting}`);
        console.log(`    Collected: ${item.collected}`);
        console.log(
          `    Given Cloth Date: ${formatShortDate(item.givenClothDate)}`
        );
        console.log(`    Cutting Date: ${formatShortDate(item.cuttingDate)}`);
        console.log(`    Collect Date: ${formatShortDate(item.collectDate)}`);
        console.log(`    Sizes: ${item.sizes.join(", ")}`);
        console.log(
          `    Users: ${item.user.map((u) => `${u.name} (${u.id})`).join(", ")}`
        );
      });
    });
  };

  // Get background color class for party
  const getPartyBgClass = (partyIndex: number) => {
    return partyIndex % 2 === 0 ? "bg-background" : "bg-muted/30";
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data
      .map((party) => ({
        ...party,
        Items: party.Items.filter(
          (item) =>
            party.party_name.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.recived.toLowerCase().includes(query) ||
            item.cuttting.toLowerCase().includes(query) ||
            item.collected.toLowerCase().includes(query) ||
            item.sizes.some((size) => size.toLowerCase().includes(query)) ||
            item.user.some(
              (user) =>
                user.name.toLowerCase().includes(query) ||
                user.id.toLowerCase().includes(query)
            )
        ),
      }))
      .filter((party) => party.Items.length > 0);
  }, [data, searchQuery]);

  return (
    <div className="w-full absolute top-0 left-0 p-6">
      <Todo/>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveData} size="lg" className="gap-2">
              <SaveIcon className="h-5 w-5" />
              Save Data
            </Button>

            {/* Role Selector */}
            <div className="flex items-center gap-2">
              <Label htmlFor="role-select" className="whitespace-nowrap">
                User Role:
              </Label>
              <Select
                value={userRole}
                onValueChange={(value: UserRole) => setUserRole(value)}
              >
                <SelectTrigger id="role-select" className="w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cutting">Cutting</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by party, item, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.partyName && (
                <TableHead className="w-[180px]">Party Name</TableHead>
              )}
              {columnVisibility.itemId && (
                <TableHead className="w-[150px]">Item ID</TableHead>
              )}
              {columnVisibility.itemName && (
                <TableHead className="w-[150px]">Item Name</TableHead>
              )}
              {columnVisibility.description && (
                <TableHead className="min-w-[200px]">Description</TableHead>
              )}
              {columnVisibility.received && (
                <TableHead className="w-[120px]">Received</TableHead>
              )}
              {columnVisibility.givenDate && (
                <TableHead className="w-[160px]">Given Date</TableHead>
              )}
              {columnVisibility.cutting && (
                <TableHead className="w-[120px]">Cutting</TableHead>
              )}
              {columnVisibility.cuttingDate && (
                <TableHead className="w-[160px]">Cutting Date</TableHead>
              )}
              {columnVisibility.collected && (
                <TableHead className="w-[120px]">Collected</TableHead>
              )}
              {columnVisibility.collectDate && (
                <TableHead className="w-[160px]">Collect Date</TableHead>
              )}
              {columnVisibility.sizes && (
                <TableHead className="min-w-[200px] text-center">Sizes</TableHead>
              )}
              {columnVisibility.users && (
                <TableHead className="w-[100px] text-center">Users</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center py-8 text-muted-foreground"
                >
                  No results found for "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((party, partyIndex) =>
                party.Items.map((item, itemIndex) => {
                  const bgClass = getPartyBgClass(partyIndex);
                  const isItemIdEditable = userRole !== "cutting" && userRole !== "distributor";

                  return (
                    <TableRow key={item._internalId} className={bgClass}>
                      {columnVisibility.partyName && (
                        <TableCell className="align-top">
                          {itemIndex === 0 ? (
                            <CreatableCombobox
                              value={party.party_name}
                              onValueChange={(value) =>
                                updatePartyName(party.id, value)
                              }
                              options={partyNameOptions}
                              onCreateOption={handleCreatePartyName}
                              placeholder="Select party..."
                              searchPlaceholder="Search party..."
                              emptyText="No party found."
                            />
                          ) : null}
                        </TableCell>
                      )}

                      {columnVisibility.itemId && (
                        <TableCell className="align-top">
                           
                            <CreatableCombobox
                              value={item.id}
                              disabled={userRole !== "admin"}
                              onValueChange={(value) =>
                                updateItemField(
                                  party.id,
                                  item._internalId,
                                  "id",
                                  value
                                )
                              }
                              options={itemIdOptions}
                              onCreateOption={handleCreateItemId}
                              placeholder="Select ID..."
                              searchPlaceholder="Search ID..."
                              emptyText="No ID found."
                            />
                          
                        </TableCell>
                      )}

                      {columnVisibility.itemName && (
                        <TableCell className="align-top">
                          <CreatableCombobox
                            value={item.name}
                            disabled={userRole !== "admin"}
                            onValueChange={(value) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "name",
                                value
                              )
                            }
                            options={itemNameOptions}
                            onCreateOption={handleCreateItemName}
                            placeholder="Select item..."
                            searchPlaceholder="Search item..."
                            emptyText="No item found."
                          />
                        </TableCell>
                      )}

                      {columnVisibility.description && (
                        <TableCell className="min-w-[200px] align-top">
                          <EditableTextarea
                            value={item.description}
                            label="Description"
                            onSave={(value) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "description",
                                value
                              )
                            }
                          />
                        </TableCell>
                      )}

                      {columnVisibility.received && (
                        <TableCell className="align-top">
                          <EditableCell
                            value={item.recived}
                            label="Received"
                            onSave={(value) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "recived",
                                value
                              )
                            }
                          />
                        </TableCell>
                      )}

                      {columnVisibility.givenDate && (
                        <TableCell className="align-top">
                          <DatePicker
                            date={item.givenClothDate}
                            onDateChange={(date) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "givenClothDate",
                                date
                              )
                            }
                            placeholder="Select given date"
                          />
                        </TableCell>
                      )}

                      {columnVisibility.cutting && (
                        <TableCell className="align-top">
                          <EditableCell
                            value={item.cuttting}
                            label="Cutting"
                            onSave={(value) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "cuttting",
                                value
                              )
                            }
                          />
                        </TableCell>
                      )}

                      {columnVisibility.cuttingDate && (
                        <TableCell className="align-top">
                          <DatePicker
                            date={item.cuttingDate}
                            onDateChange={(date) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "cuttingDate",
                                date
                              )
                            }
                            placeholder="Select cutting date"
                          />
                        </TableCell>
                      )}

                      {columnVisibility.collected && (
                        <TableCell className="align-top">
                          <EditableCell
                            value={item.collected}
                            label="Collected"
                            onSave={(value) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "collected",
                                value
                              )
                            }
                          />
                        </TableCell>
                      )}

                      {columnVisibility.collectDate && (
                        <TableCell className="align-top">
                          <DatePicker
                            date={item.collectDate}
                            onDateChange={(date) =>
                              updateItemField(
                                party.id,
                                item._internalId,
                                "collectDate",
                                date
                              )
                            }
                            placeholder="Select collect date"
                          />
                        </TableCell>
                      )}

                      {/* {columnVisibility.sizes && (
                        <TableCell className="text-center align-top">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {item.sizes.length} sizes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Manage Sizes (Todo List)</DialogTitle>
                                <DialogDescription>
                                  Add, check off, or delete sizes. Checked items are marked as complete.
                                </DialogDescription>
                              </DialogHeader>
                              <SizesTodo
                                items={item.sizes}
                                onUpdate={(newSizes) =>
                                  updateItemField(party.id, item._internalId, "sizes", newSizes)
                                }
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )} */}

                      {columnVisibility.sizes && (
                        <TableCell className="align-top max-w-[300px]">
                          <div className="flex flex-wrap gap-1.5 p-2">
                            {item.sizes.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                No sizes
                              </span>
                            ) : (
                              item.sizes.map((size, sizeIndex) => (
                                <React.Fragment key={sizeIndex}>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-mono"
                                  >
                                    {size}
                                  </Badge>
                                  {sizeIndex < item.sizes.length - 1 && (
                                    <span className="text-muted-foreground self-center">
                                      /
                                    </span>
                                  )}
                                </React.Fragment>
                              ))
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                              >
                                Edit ({item.sizes.length} sizes)
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Manage Sizes (Todo List)
                                </DialogTitle>
                                <DialogDescription>
                                  Add, check off, or delete sizes. Checked items
                                  are marked as complete.
                                </DialogDescription>
                              </DialogHeader>
                              <SizesTodo
                                items={item.sizes}
                                onUpdate={(newSizes) =>
                                  updateItemField(
                                    party.id,
                                    item._internalId,
                                    "sizes",
                                    newSizes
                                  )
                                }
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}

                      {columnVisibility.users && (
                        <TableCell className="text-center align-top">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {item.user.length} users
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Manage Users</DialogTitle>
                                <DialogDescription>
                                  Add or remove users associated with this item.
                                </DialogDescription>
                              </DialogHeader>
                              <UserManager
                                users={item.user}
                                onUpdate={(newUsers) =>
                                  updateItemField(
                                    party.id,
                                    item._internalId,
                                    "user",
                                    newUsers
                                  )
                                }
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
